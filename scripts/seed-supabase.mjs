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
// Prefer the service role key when present so catalog writes bypass RLS;
// the anon key can only read and will be denied on insert.
const supabaseWriteKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

if (!supabaseUrl || !supabaseWriteKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or a Supabase key (SUPABASE_SERVICE_ROLE_KEY preferred) in .env or environment.');
}

const supabase = createClient(supabaseUrl, supabaseWriteKey);

const cookbooks = [
  {
    id: 'telugu-kitchen',
    title: 'The High-Protein Telugu Kitchen',
    category: 'high-protein',
    price: 999,
    oldPrice: 1499,
    description: 'Traditional South Indian meals reworked for muscle fuel, fat loss, and everyday performance.',
    image: 'https://images.unsplash.com/photo-1512058564366-c9e0f8ca44e5',
    tag: 'Best Seller',
    features: ['60+ protein-focused recipes', 'Macro tracking friendly', 'Minimal prep, maximum flavor'],
    macros: 'Avg 42g Protein / meal',
    pdfUrl: '',
  },
  {
    id: 'air-fryer',
    title: 'Modern Air Fryer Recipes',
    category: 'air-fryer',
    price: 799,
    oldPrice: 1199,
    description: 'Crispy, low-oil recipes designed for fast meal prep and lean results using your air fryer.',
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092',
    features: ['35+ quick air fryer blueprints', 'Zero added oils options', 'High-protein meal prep'],
    pdfUrl: '',
  },
  {
    id: 'meal-prep',
    title: 'Fat Loss Meal Prep Guide',
    category: 'high-protein',
    price: 899,
    oldPrice: 1299,
    description: 'A complete 7-day meal prep system with grocery lists, storage strategies, and macro-balanced recipes.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    tag: 'Highly Rated',
    features: ['7-day structured plan', 'Grocery list matrix', 'Batch cook efficiency'],
    pdfUrl: '',
  },
  {
    id: 'complete-bundle',
    title: 'The Complete Cookbook Bundle',
    category: 'bundle',
    price: 2499,
    oldPrice: 3697,
    description: 'Every cookbook in one bundle: Telugu Kitchen, Air Fryer Recipes, and the Meal Prep Guide.',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
    tag: 'Best Value',
    features: ['All 3 cookbooks included', '100+ High Protein recipes', 'Save vs buying separately'],
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
  { id: 'fat-loss-veg', title: 'Fat Loss (Veg)', description: 'Vegetarian fat-loss protocol with paneer, soya, and dal-first macro structures.', price: 1499, period: 'plan', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061', badge: 'Veg', popular: false },
  { id: 'fat-loss-non-veg', title: 'Fat Loss (Non-Veg)', description: 'Lean chicken, fish, and egg-based cutting plan with Indian kitchen staples.', price: 1499, period: 'plan', image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092', popular: false },
  { id: 'fat-loss-vegan', title: 'Fat Loss (Vegan)', description: 'Fully plant-based deficit plan built on tofu, tempeh, and legumes.', price: 1499, period: 'plan', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', badge: 'Vegan', popular: false },
  { id: 'muscle-gain-veg', title: 'Muscle Gain (Veg)', description: 'Vegetarian hypertrophy nutrition with surplus calories and high protein targets.', price: 1499, period: 'plan', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', popular: false },
  { id: 'muscle-gain-non-veg', title: 'Muscle Gain (Non-Veg)', description: 'High-protein mass-building plan with chicken, eggs, and fish rotations.', price: 1499, period: 'plan', image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092', badge: 'Most Popular', popular: true },
  { id: 'lean-bulk', title: 'Lean Bulk', description: 'Controlled surplus for clean size gains with minimal fat spillover.', price: 1499, period: 'plan', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b', popular: false },
  { id: 'cutting', title: 'Cutting', description: 'Aggressive-but-safe shredding protocol for visible definition phases.', price: 1499, period: 'plan', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', popular: false },
  { id: 'maintenance', title: 'Maintenance', description: 'Balanced Indian maintenance eating for life.', price: 1499, period: 'plan', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061', popular: false },
  { id: 'pcos-friendly', title: 'PCOS-Friendly', description: 'Low-glycemic plan supporting hormonal balance.', price: 1499, period: 'plan', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352', badge: 'Hormone Health', popular: false },
  { id: 'diabetes-friendly', title: 'Diabetes-Friendly', description: 'Glycemic-conscious protocols for insulin optimization and metabolic longevity.', price: 1499, period: 'plan', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352', badge: 'Wellness Focus', popular: false },
  { id: 'student-budget', title: 'Student Budget', description: 'Maximum protein per rupee: hostel and budget-kitchen friendly fat loss.', price: 999, period: 'plan', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', badge: 'Budget', popular: false },
  { id: 'office-worker', title: 'Office Worker', description: 'Desk-job friendly plan with tiffin, cafeteria, and shift strategies.', price: 1499, period: 'plan', image: 'https://images.unsplash.com/photo-1547592180-85f173990554', popular: false },
  { id: 'high-protein-indian', title: 'High Protein Indian Diet', description: 'Everyday Indian meals re-engineered for 120g+ protein days.', price: 1499, period: 'plan', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe', badge: 'Flagship', popular: false },
  { id: 'custom-diet-plan', title: 'Custom Diet Plan', description: 'Fully personalized plan built 1:1 around your labs, schedule, and food preferences.', price: 3999, period: 'plan', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061', badge: 'Custom', popular: false },
];

const coachingPlans = [
  { id: 'coaching-1-month', title: '1-Month 1:1 Coaching', description: 'Four weeks of strategic nutrition coaching with weekly check-ins and WhatsApp support.', price: 7500, duration_months: 1, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b', popular: false },
  { id: 'coaching-3-month', title: '3-Month 1:1 Coaching', description: 'A full quarter of coaching for real body-composition transformation.', price: 15000, duration_months: 3, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', badge: 'Most Popular', popular: true },
  { id: 'coaching-6-month', title: '6-Month 1:1 Coaching', description: 'Half a year of elite accountability for a complete lifestyle overhaul.', price: 50000, duration_months: 6, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', badge: 'Best Value', popular: false },
];

const consultations = [
  { id: 'nutrition-consult', title: 'Nutrition Consultation', description: 'A focused 1:1 session to audit your current eating and fix the biggest leaks.', price: 999, duration: '45 min', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061' },
  { id: 'healthy-cooking-consult', title: 'Healthy Cooking Session', description: 'Live cooking guidance for restaurant-grade healthy food at home.', price: 1499, duration: '60 min', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d' },
  { id: 'meal-prep-consult', title: 'Meal Prep Consultation', description: 'Design your weekly batch-cooking system with containers, schedules, and macros.', price: 999, duration: '45 min', image: 'https://images.unsplash.com/photo-1547592180-85f173990554' },
  { id: 'grocery-shopping-consult', title: 'Grocery Shopping Guide', description: 'Learn to read labels and build a high-protein Indian grocery list on any budget.', price: 799, duration: '30 min', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e' },
];

const courses = [
  { id: 'meal-prep-course', title: 'Meal Prep Video Course', description: 'Self-paced video course: batch cooking systems, storage science, and weekly layouts.', price: 1999, image: 'https://images.unsplash.com/photo-1547592180-85f173990554', tag: 'Video Course', features: ['Step-by-step video lessons', 'Downloadable checklists', 'Lifetime access'] },
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
    await seedTable('coaching_plans', coachingPlans);
    await seedTable('consultations', consultations);
    await seedTable('courses', courses);
    await seedTable('subscribers', []);
    await seedAdmins();
    console.log('Supabase seed complete.');
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
