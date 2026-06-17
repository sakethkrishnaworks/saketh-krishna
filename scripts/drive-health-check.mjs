import { createSign } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

function loadDotEnv(path) {
  if (!existsSync(path)) return;

  const content = readFileSync(path, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getOAuthToken() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return { ok: false, mode: 'oauth', missing: [
      !clientId && 'GOOGLE_OAUTH_CLIENT_ID',
      !clientSecret && 'GOOGLE_OAUTH_CLIENT_SECRET',
      !refreshToken && 'GOOGLE_DRIVE_REFRESH_TOKEN',
    ].filter(Boolean) };
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  const text = await response.text();
  const data = JSON.parse(text || '{}');
  if (!response.ok || !data.access_token) return { ok: false, mode: 'oauth', status: response.status, data };

  return { ok: true, mode: 'oauth', accessToken: data.access_token };
}

async function getServiceToken() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!email || !privateKey) return { ok: false, mode: 'service-account', missing: ['GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY'] };

  const now = Math.floor(Date.now() / 1000);
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64UrlEncode(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/drive',
    aud: tokenUrl,
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${payload}`;
  const sig = createSign('RSA-SHA256').update(unsigned).sign(privateKey);
  const assertion = `${unsigned}.${base64UrlEncode(sig)}`;

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) return { ok: false, mode: 'service-account', status: response.status, data };

  return { ok: true, mode: 'service-account', accessToken: data.access_token };
}

async function checkFolder(accessToken) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) return { ok: true, skipped: true, reason: 'No GOOGLE_DRIVE_FOLDER_ID set.' };

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}?supportsAllDrives=true&fields=id,name,mimeType,capabilities(canAddChildren)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json();

  if (!response.ok) return { ok: false, status: response.status, data };
  return { ok: data.mimeType === 'application/vnd.google-apps.folder', data };
}

async function uploadTinyPdf(accessToken) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const boundary = `health-check-${Date.now()}`;
  const metadata = {
    name: `saketh-drive-health-check-${Date.now()}.pdf`,
    mimeType: 'application/pdf',
    ...(folderId ? { parents: [folderId] } : {}),
  };
  const tinyPdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n');
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`),
    tinyPdf,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

loadDotEnv('.env.local');
loadDotEnv('.env');

console.log('Drive Health Check');
console.log('GOOGLE_OAUTH_CLIENT_ID:', process.env.GOOGLE_OAUTH_CLIENT_ID ? 'present' : 'MISSING');
console.log('GOOGLE_OAUTH_CLIENT_SECRET:', process.env.GOOGLE_OAUTH_CLIENT_SECRET ? 'present' : 'MISSING');
console.log('GOOGLE_DRIVE_REFRESH_TOKEN:', process.env.GOOGLE_DRIVE_REFRESH_TOKEN ? 'present' : 'MISSING');
console.log('GOOGLE_DRIVE_FOLDER_ID:', process.env.GOOGLE_DRIVE_FOLDER_ID || 'MISSING');

let token = await getOAuthToken();
if (!token.ok) {
  console.log('\nOAuth token check failed:', JSON.stringify(token, null, 2));
  console.log('Not falling back to service account for My Drive upload, because service accounts have no storage quota.');
  process.exit(1);
}
console.log('\nOAuth token check: OK');

const folder = await checkFolder(token.accessToken);
console.log('Folder check:', JSON.stringify(folder, null, 2));
if (!folder.ok) process.exit(1);

if (process.argv.includes('--upload-test')) {
  const upload = await uploadTinyPdf(token.accessToken);
  console.log('Tiny PDF upload test:', JSON.stringify(upload, null, 2));
  if (!upload.ok) process.exit(1);
}
