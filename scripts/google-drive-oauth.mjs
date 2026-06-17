import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { readFileSync, existsSync } from 'node:fs';

function loadDotEnv(path = '.env') {
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

loadDotEnv('.env.local');
loadDotEnv('.env');

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const redirectUri = 'https://developers.google.com/oauthplayground';
const scope = 'https://www.googleapis.com/auth/drive';

if (!clientId || !clientSecret) {
  console.error('Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET in .env or .env.local.');
  console.error('Create a Google OAuth Web client first, then add those two values and rerun this script.');
  process.exit(1);
}

const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.set('client_id', clientId);
authUrl.searchParams.set('redirect_uri', redirectUri);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', scope);
authUrl.searchParams.set('access_type', 'offline');
authUrl.searchParams.set('prompt', 'consent');

console.log('\nOpen this URL in your browser:\n');
console.log(authUrl.toString());
console.log('\nAfter approval, OAuth Playground will show a code. Paste that code here.\n');

const rl = createInterface({ input, output });
const code = (await rl.question('Authorization code: ')).trim();
rl.close();

if (!code) {
  console.error('No authorization code provided.');
  process.exit(1);
}

const response = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  }),
});

const text = await response.text();
let data;
try {
  data = JSON.parse(text);
} catch {
  data = { raw: text };
}

if (!response.ok) {
  console.error('\nToken exchange failed:\n');
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}

if (!data.refresh_token) {
  console.error('\nNo refresh_token returned. Re-run and make sure the consent URL includes prompt=consent and access_type=offline.');
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}

console.log('\nAdd this to .env or .env.local:\n');
console.log(`GOOGLE_DRIVE_REFRESH_TOKEN="${data.refresh_token}"`);
console.log('\nThen restart npm run dev.\n');
