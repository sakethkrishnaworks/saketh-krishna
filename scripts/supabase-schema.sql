-- ============================================================================
-- Saketh Krishna — Supabase schema + Row Level Security
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
--
-- Column names are intentionally lower-case (e.g. `pdfurl`, `tagcolor`) to
-- match the app's write path. The client normalizes them to camelCase on read.
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- TABLES
-- ============================================================================

create table if not exists cookbooks (
  id text primary key,
  title text not null,
  description text,
  price numeric not null default 0,
  oldprice numeric,
  image text,
  category text,
  features text[],
  pdfurl text,
  tag text,
  macros text,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id text primary key,
  title text not null,
  description text,
  date text,
  month text,
  time text,
  tag text,
  image text,
  joined int not null default 0,
  tagcolor text,
  level text
);

create table if not exists dietplans (
  id text primary key,
  title text not null,
  description text,
  price numeric not null default 0,
  period text,
  image text,
  badge text,
  popular boolean not null default false
);

create table if not exists subscribers (
  id text primary key,
  email text unique not null,
  date text,
  status text not null default 'Active'
);

create table if not exists admins (
  user_id text primary key,
  email text unique not null,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

-- Orders recorded after a verified Razorpay payment.
create table if not exists purchases (
  id text primary key,
  user_id text not null,
  cookbook_id text not null,
  title text not null,
  image text,
  pdf_url text,
  price numeric,
  quantity int not null default 1,
  amount_paid numeric not null default 0,
  currency text not null default 'INR',
  razorpay_order_id text,
  razorpay_payment_id text,
  status text not null default 'paid',
  purchased_at timestamptz not null default now()
);

create index if not exists purchases_user_id_idx on purchases (user_id);
create index if not exists purchases_order_id_idx on purchases (razorpay_order_id);

-- Generic products: diet plans, coaching tiers, consultations, and courses
-- share the purchases table. Cookbook rows keep cookbook_id; everything else
-- uses product_kind/product_id with a null cookbook_id.
alter table purchases add column if not exists product_kind text not null default 'cookbook';
alter table purchases add column if not exists product_id text;
alter table purchases alter column cookbook_id drop not null;
update purchases set product_id = cookbook_id where product_id is null and cookbook_id is not null;
create index if not exists purchases_product_idx on purchases (product_kind, product_id);

-- 1:1 coaching consultation requests.
create table if not exists bookings (
  id text primary key,
  user_id text not null,
  name text not null,
  email text not null,
  plan text,
  session_date text not null,
  session_time text not null,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

create index if not exists bookings_user_id_idx on bookings (user_id);

-- Purchasable 1:1 coaching tiers (1 / 3 / 6 months).
create table if not exists coaching_plans (
  id text primary key,
  title text not null,
  description text,
  price numeric not null default 0,
  duration_months int not null default 1,
  image text,
  badge text,
  popular boolean not null default false,
  created_at timestamptz not null default now()
);

-- Paid single-session consultations (nutrition, cooking, meal prep, grocery).
create table if not exists consultations (
  id text primary key,
  title text not null,
  description text,
  price numeric not null default 0,
  duration text,
  image text,
  created_at timestamptz not null default now()
);

-- Self-paced video courses (meal prep course).
create table if not exists courses (
  id text primary key,
  title text not null,
  description text,
  price numeric not null default 0,
  image text,
  tag text,
  features text[],
  created_at timestamptz not null default now()
);

-- ============================================================================
-- HELPER: is_admin()
-- SECURITY DEFINER so it can read the `admins` table without triggering RLS
-- recursion. Search path is pinned for safety.
-- ============================================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid()::text);
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table cookbooks   enable row level security;
alter table events      enable row level security;
alter table dietplans   enable row level security;
alter table coaching_plans enable row level security;
alter table consultations  enable row level security;
alter table courses        enable row level security;
alter table subscribers enable row level security;
alter table admins      enable row level security;
alter table purchases   enable row level security;
alter table bookings    enable row level security;

-- ---------- Cookbooks: public read, admin write ----------
drop policy if exists "cookbooks_read"   on cookbooks;
drop policy if exists "cookbooks_write"  on cookbooks;
create policy "cookbooks_read"  on cookbooks for select using (true);
create policy "cookbooks_write" on cookbooks for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Events: public read, admin write ----------
drop policy if exists "events_read"  on events;
drop policy if exists "events_write" on events;
create policy "events_read"  on events for select using (true);
create policy "events_write" on events for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Diet plans: public read, admin write ----------
drop policy if exists "dietplans_read"  on dietplans;
drop policy if exists "dietplans_write" on dietplans;
create policy "dietplans_read"  on dietplans for select using (true);
create policy "dietplans_write" on dietplans for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Coaching plans / consultations / courses: public read, admin write ----------
drop policy if exists "coaching_plans_read"  on coaching_plans;
drop policy if exists "coaching_plans_write" on coaching_plans;
create policy "coaching_plans_read"  on coaching_plans for select using (true);
create policy "coaching_plans_write" on coaching_plans for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "consultations_read"  on consultations;
drop policy if exists "consultations_write" on consultations;
create policy "consultations_read"  on consultations for select using (true);
create policy "consultations_write" on consultations for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "courses_read"  on courses;
drop policy if exists "courses_write" on courses;
create policy "courses_read"  on courses for select using (true);
create policy "courses_write" on courses for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Subscribers: self-service join, admin-only management ----------
drop policy if exists "subscribers_insert" on subscribers;
drop policy if exists "subscribers_manage" on subscribers;
create policy "subscribers_insert" on subscribers for insert
  with check (status in ('Active', 'Unsubscribed'));
create policy "subscribers_manage" on subscribers for select
  using (public.is_admin());
-- (update/delete are admin-only and are covered by the catch-all below)
drop policy if exists "subscribers_update" on subscribers;
drop policy if exists "subscribers_delete" on subscribers;
create policy "subscribers_update" on subscribers for update
  using (public.is_admin()) with check (public.is_admin());
create policy "subscribers_delete" on subscribers for delete
  using (public.is_admin());

-- ---------- Admins: read own row; whitelisted emails may bootstrap ----------
drop policy if exists "admins_read"    on admins;
drop policy if exists "admins_create"  on admins;
drop policy if exists "admins_manage"  on admins;
create policy "admins_read" on admins for select
  using (auth.uid()::text = user_id);
create policy "admins_create" on admins for insert
  with check (
    auth.uid()::text = user_id
    and lower(email) = lower(auth.jwt() ->> 'email')
    and role = 'admin'
    and lower(auth.jwt() ->> 'email') in (
      'sakethkrishna.work@gmail.com',
      'gokulkannan0205@gmail.com'
    )
  );
create policy "admins_manage" on admins for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Purchases: users own their rows, admins read all ----------
drop policy if exists "purchases_read"   on purchases;
drop policy if exists "purchases_insert" on purchases;
drop policy if exists "purchases_update" on purchases;
create policy "purchases_read" on purchases for select
  using (auth.uid()::text = user_id or public.is_admin());
drop policy if exists "purchases_delete" on purchases;
drop policy if exists "purchases_write" on purchases;
drop policy if exists "purchases_manage" on purchases;
drop policy if exists "purchases_deny_insert" on purchases;
drop policy if exists "purchases_deny_update" on purchases;
drop policy if exists "purchases_deny_delete" on purchases;
create policy "purchases_deny_insert" on purchases as restrictive for insert to anon, authenticated
  with check (false);
create policy "purchases_deny_update" on purchases as restrictive for update to anon, authenticated
  using (false) with check (false);
create policy "purchases_deny_delete" on purchases as restrictive for delete to anon, authenticated
  using (false);
revoke insert, update, delete, truncate, references, trigger on table public.purchases from public, anon, authenticated;
grant select on table public.purchases to authenticated;
grant select, insert, update, delete on table public.purchases to service_role;

-- ---------- Bookings: users own their rows, admins read all ----------
drop policy if exists "bookings_read"   on bookings;
drop policy if exists "bookings_insert" on bookings;
drop policy if exists "bookings_update" on bookings;
create policy "bookings_read" on bookings for select
  using (auth.uid()::text = user_id or public.is_admin());
create policy "bookings_insert" on bookings for insert
  with check (auth.uid()::text = user_id);
create policy "bookings_update" on bookings for update
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- RPC: increment_event_joined(event_uuid)
-- Lets a signed-in user bump the "joined" counter for a workshop. The events
-- table itself is admin-write-only, so this SECURITY DEFINER function is the
-- safe way to expose a single, narrow mutation.
-- ============================================================================

create or replace function public.increment_event_joined(event_uuid text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.events
     set joined = joined + 1
   where id = event_uuid;
end;
$$;

grant execute on function public.increment_event_joined(text) to anon, authenticated;
