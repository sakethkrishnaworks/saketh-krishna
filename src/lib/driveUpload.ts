import { createSign } from 'crypto';

/**
 * Shared Google Drive helpers used by both /api/drive-upload (PDFs) and
 * /api/image-upload (cover art). Keeping the token + multipart logic in one
 * place means the two routes can't drift apart.
 */

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';
const DRIVE_UPLOAD_URL =
  'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,webViewLink,webContentLink,mimeType';

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function getPrivateKey() {
  return process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
}

function createServiceAccountJwt() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = getPrivateKey();

  if (!clientEmail || !privateKey) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY.');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: clientEmail,
      scope: DRIVE_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );
  const unsignedToken = `${header}.${payload}`;
  const signature = createSign('RSA-SHA256').update(unsignedToken).sign(privateKey);

  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

async function getUserAccessToken() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return null;

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google OAuth refresh-token request failed: ${error}`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error('Google OAuth token response did not include an access token.');

  return data.access_token;
}

async function getServiceAccountAccessToken() {
  const assertion = createServiceAccountJwt();
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google token request failed: ${error}`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error('Google token response did not include an access token.');

  return data.access_token;
}

export async function getDriveAccessToken() {
  const userAccessToken = await getUserAccessToken();
  if (userAccessToken) return userAccessToken;

  if (process.env.GOOGLE_ALLOW_SERVICE_ACCOUNT_UPLOAD !== 'true') {
    throw new Error(
      'Google Drive OAuth is not configured. Add GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_DRIVE_REFRESH_TOKEN to .env, then restart the dev server.'
    );
  }

  return getServiceAccountAccessToken();
}

export async function makeDriveFilePublic(fileId: string, accessToken: string) {
  if (process.env.GOOGLE_DRIVE_PUBLIC_READ === 'false') return;

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/permissions?supportsAllDrives=true`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to make Drive file readable: ${error}`);
  }
}

export async function assertDriveFolderAccess(folderId: string, accessToken: string) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${folderId}?supportsAllDrives=true&fields=id,name,mimeType`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Google Drive folder is not accessible. Share folder ${folderId} with GOOGLE_SERVICE_ACCOUNT_EMAIL as Editor, or verify GOOGLE_DRIVE_FOLDER_ID. Details: ${error}`
    );
  }

  const folder = (await response.json()) as { mimeType?: string; name?: string };
  if (folder.mimeType !== 'application/vnd.google-apps.folder') {
    throw new Error(`GOOGLE_DRIVE_FOLDER_ID points to "${folder.name || folderId}", but it is not a Drive folder.`);
  }
}

export interface DriveUploadedFile {
  id: string;
  name: string;
  webViewLink?: string;
  webContentLink?: string;
}

export interface UploadToDriveParams {
  /** The web File/Blob from the request formData. */
  file: Blob;
  /** Sanitized file name used as the Drive file name. */
  fileName: string;
  /** Explicit MIME type for the stored file. */
  mimeType: string;
  /** AppProperties attached to the Drive file. */
  appProperties?: Record<string, string>;
}

export async function uploadFileToDrive({
  file,
  fileName,
  mimeType,
  appProperties,
}: UploadToDriveParams): Promise<DriveUploadedFile> {
  const accessToken = await getDriveAccessToken();

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (folderId) {
    await assertDriveFolderAccess(folderId, accessToken);
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
  const metadata = {
    name: `${Date.now()}-${safeName}`,
    mimeType,
    ...(folderId ? { parents: [folderId] } : {}),
    appProperties: appProperties ?? {},
  };

  const boundary = `saketh-drive-upload-${Date.now()}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
    fileBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const uploadResponse = await fetch(DRIVE_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    if (error.includes('Service Accounts do not have storage quota')) {
      throw new Error(
        'Google Drive upload is using a service account, but service accounts do not have My Drive storage quota. Configure GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_DRIVE_REFRESH_TOKEN so uploads use your Google Drive quota, or upload to a Google Workspace Shared Drive.'
      );
    }

    throw new Error(`Drive upload failed: ${error}`);
  }

  return (await uploadResponse.json()) as DriveUploadedFile;
}
