import { createSign } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,webViewLink,webContentLink,mimeType';

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function getPrivateKey() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  return privateKey?.replace(/\\n/g, '\n');
}

function createServiceAccountJwt() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = getPrivateKey();

  if (!clientEmail || !privateKey) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY.');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64UrlEncode(JSON.stringify({
    iss: clientEmail,
    scope: DRIVE_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }));
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

  const data = await response.json() as { access_token?: string };
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

  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error('Google token response did not include an access token.');

  return data.access_token;
}

async function getAccessToken() {
  const userAccessToken = await getUserAccessToken();
  if (userAccessToken) return userAccessToken;

  if (process.env.GOOGLE_ALLOW_SERVICE_ACCOUNT_UPLOAD !== 'true') {
    throw new Error(
      'Google Drive OAuth is not configured. Add GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_DRIVE_REFRESH_TOKEN to .env, then restart the dev server.'
    );
  }

  return getServiceAccountAccessToken();
}

async function makeDriveFilePublic(fileId: string, accessToken: string) {
  if (process.env.GOOGLE_DRIVE_PUBLIC_READ === 'false') return;

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions?supportsAllDrives=true`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to make Drive file readable: ${error}`);
  }
}

async function assertDriveFolderAccess(folderId: string, accessToken: string) {
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

  const folder = await response.json() as { mimeType?: string; name?: string };
  if (folder.mimeType !== 'application/vnd.google-apps.folder') {
    throw new Error(`GOOGLE_DRIVE_FOLDER_ID points to "${folder.name || folderId}", but it is not a Drive folder.`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const cookbookId = formData.get('cookbookId')?.toString() || 'draft';

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No PDF file was provided.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 });
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'PDF must be 25MB or smaller.' }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (folderId) {
      await assertDriveFolderAccess(folderId, accessToken);
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const metadata = {
      name: `${Date.now()}-${safeName}`,
      mimeType: 'application/pdf',
      ...(folderId ? { parents: [folderId] } : {}),
      appProperties: { cookbookId },
    };

    const boundary = `saketh-drive-upload-${Date.now()}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`),
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

    const driveFile = await uploadResponse.json() as {
      id: string;
      name: string;
      webViewLink?: string;
      webContentLink?: string;
    };

    await makeDriveFilePublic(driveFile.id, accessToken);

    return NextResponse.json({
      id: driveFile.id,
      name: driveFile.name,
      pdfUrl: `https://drive.google.com/file/d/${driveFile.id}/view`,
      previewUrl: `https://drive.google.com/file/d/${driveFile.id}/preview`,
      webViewLink: driveFile.webViewLink,
      webContentLink: driveFile.webContentLink,
    });
  } catch (error) {
    console.error('Google Drive upload failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Google Drive upload failed.' },
      { status: 500 }
    );
  }
}
