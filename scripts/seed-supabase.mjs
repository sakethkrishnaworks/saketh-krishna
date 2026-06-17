import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env or environment.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const cookbooks = [
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
    pdfUrl: '',
  },
  {
    id: 'test-cookbook-pdf',
    title: 'Test Cookbook PDF',
    category: 'high-protein',
    price: 0,
    description: 'A temporary test cookbook used for validating PDF links',
    image: 'https://images.unsplash.com/photo-1598511720359-5f9f2e3f8f3c',
    features: ['test'],
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

const events = [
  {
    id: 'fresh-start-session',
    title: 'Fresh Start Coaching Session',
    description: 'A personal performance consultation to help you sync training, nutrition, and recovery.',
    date: '2026-07-11',
    month: 'July',
    time: '10:00 AM - 12:00 PM',
    tag: '1:1 Coaching',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
    joined: 8,
    tagColor: 'bg-brand-beige text-black',
  },
  {
    id: 'meal-plan-workshop',
    title: 'Macro Meal Planning Workshop',
    description: 'Build your most consistent weekly menu, portion strategy, and pantry-ready meal system.',
    date: '2026-07-18',
    month: 'July',
    time: '5:30 PM - 7:30 PM',
    tag: 'Group Coaching',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    joined: 24,
    tagColor: 'bg-[#D2B48C] text-black',
  },
];

const dietPlans = [
  {
    id: 'lean-muscle-quarter',
    title: 'Lean Muscle Quarter',
    description: 'A 12-week strength and nutrition plan to add lean mass without unwanted fat gain.',
    price: 4999,
    period: 'quarter',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
    badge: 'Popular',
    popular: true,
  },
  {
    id: 'clean-eating-30',
    title: 'Clean Eating 30',
    description: 'A full month of daily meal templates, shopping lists, and easy prep menus.',
    price: 2999,
    period: 'month',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
    badge: 'Best Value',
    popular: false,
  },
];

const admins = [
  {
    user_id: process.env.SUPABASE_ADMIN_USER_ID || 'demo-admin',
    email: process.env.SUPABASE_ADMIN_EMAIL || 'sakethkrishna.work@gmail.com',
    role: 'admin',
  },
];

async function seedTable(tableName, rows) {
  if (!rows.length) return;

  console.log(`Seeding ${tableName} (${rows.length} rows)...`);
  const normalizedRows = rows.map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k.toLowerCase(), v])));
  const { error } = await supabase.from(tableName).upsert(normalizedRows, { onConflict: 'id' });
  if (error) {
    if (error.code === 'PGRST205') {
      throw new Error(
        `Failed to seed ${tableName}: table not found. Create the table first using scripts/supabase-schema.sql.`
      );
    }
    throw new Error(`Failed to seed ${tableName}: ${error.message}`);
  }
  console.log(`Seeded ${tableName} successfully.`);
}

async function seedAdmins() {
  console.log('Seeding admins...');
  const { error } = await supabase.from('admins').upsert(admins, { onConflict: 'user_id' });
  if (error) {
    throw new Error(`Failed to seed admins: ${error.message}`);
  }
  console.log('Seeded admins successfully.');
}

async function main() {
  try {
    await seedTable('cookbooks', cookbooks);
    await seedTable('events', events);
    await seedTable('dietplans', dietPlans);
    await seedTable('subscribers', [
      { id: 'sub-demo-1', email: 'newmember@example.com', date: '2026-06-05', status: 'Active' },
    ]);
    await seedAdmins();
    console.log('Supabase seed complete.');
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
