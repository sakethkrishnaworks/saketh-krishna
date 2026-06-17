import { readFileSync, existsSync } from 'node:fs';
import { createSign } from 'node:crypto';
import path from 'node:path';

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, 'utf8');
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

const repoRoot = path.resolve(new URL('.', import.meta.url).pathname, '..');
loadDotEnv(path.join(repoRoot, '.env.local'));
loadDotEnv(path.join(repoRoot, '.env'));

const configPath = path.join(repoRoot, 'firebase-applet-config.json');
if (!existsSync(configPath)) throw new Error('firebase-applet-config.json not found.');
const firebaseConfig = JSON.parse(readFileSync(configPath, 'utf8'));
const projectId = firebaseConfig.projectId || process.env.FIREBASE_PROJECT_ID;
if (!projectId) throw new Error('Firebase projectId is required in firebase-applet-config.json or FIREBASE_PROJECT_ID env.');

const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
if (!serviceAccountEmail || !privateKey) {
  throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY in environment.');
}

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function createServiceAccountJwt() {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64UrlEncode(JSON.stringify({
    iss: serviceAccountEmail,
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsignedToken = `${header}.${payload}`;
  const signature = createSign('RSA-SHA256').update(unsignedToken).sign(privateKey);
  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

async function getAccessToken() {
  const assertion = createServiceAccountJwt();
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const body = await response.json();
  if (!response.ok || !body.access_token) {
    throw new Error(`Failed to obtain access token: ${JSON.stringify(body)}`);
  }
  return body.access_token;
}

function toFirestoreValue(value) {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(toFirestoreValue),
      },
    };
  }

  switch (typeof value) {
    case 'string':
      return { stringValue: value };
    case 'number':
      return Number.isInteger(value)
        ? { integerValue: value.toString() }
        : { doubleValue: value };
    case 'boolean':
      return { booleanValue: value };
    case 'object':
      return {
        mapValue: {
          fields: Object.entries(value).reduce((acc, [key, nestedValue]) => {
            acc[key] = toFirestoreValue(nestedValue);
            return acc;
          }, {}),
        },
      };
    default:
      return { stringValue: String(value) };
  }
}

async function seedCookbooks() {
  const token = await getAccessToken();
  const docs = [
    {
      id: 'telugu-kitchen',
      title: 'The High-Protein Telugu Kitchen',
      category: 'high-protein',
      price: 2499,
      oldPrice: 3999,
      description: 'Traditional South Indian meals reworked for muscle fuel, fat loss, and everyday performance.',
      image: 'https://images.unsplash.com/photo-1512058564366-c9e0f8ca44e5',
      tag: 'Best Seller',
      features: ['60+ protein-focused recipes', 'Macro tracking friendly', 'Minimal prep, maximum flavor'],
      macros: 'Avg 42g Protein / meal',
      pdfUrl: 'https://drive.google.com/file/d/1NEkXnXbyNxqrypaUQBIiO2-e1H9npbpk/view?usp=share_link',
    },
    {
      id: 'air-fryer-recipes',
      title: 'Modern Air Fryer Recipes',
      category: 'air-fryer',
      price: 1499,
      description: 'Crispy, low-oil recipes designed for fast meal prep and lean results using your air fryer.',
      image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092',
      features: ['35+ quick air fryer blueprints', 'Zero added oils options', 'High-protein meal prep'],
      pdfUrl: '',
    },
    {
      id: 'meal-prep-guide',
      title: 'Fat Loss Meal Prep Guide',
      category: 'high-protein',
      price: 1999,
      description: 'A complete 7-day meal prep system with grocery lists, storage strategies, and macro-balanced recipes.',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
      tag: 'Highly Rated',
      features: ['7-day structured plan', 'Grocery list matrix', 'Batch cook efficiency'],
      pdfUrl: '',
    },
  ];

  for (const docData of docs) {
    const fields = Object.entries(docData).reduce((acc, [key, value]) => {
      acc[key] = toFirestoreValue(value);
      return acc;
    }, {});

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cookbooks/${encodeURIComponent(docData.id)}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    });

    const responseBody = await response.json();
    if (!response.ok) {
      console.error('Failed to save cookbook:', docData.id, response.status, responseBody);
      continue;
    }
    console.log('Saved cookbook:', docData.id, responseBody.name);
  }
}

seedCookbooks().catch((error) => {
  console.error('Seed script failed:', error);
  process.exit(1);
});
