# Saketh Krishna — Healthy Food, Sustainable Fat Loss, Elevated Living

Mobile-first storefront for premium digital cookbooks and 1:1 nutrition coaching. Built with **Next.js 16**, **Supabase** (Postgres + RLS + realtime), and **Razorpay** payments.

## Prerequisites

- Node.js 18+
- A Supabase project
- A Razorpay account (test keys work)

## 1. Install

```bash
npm install
```

## 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env` (git-ignored — never commit secrets):

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | recommended | Server-only: verifies admins, records purchases server-side |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | yes | Razorpay key ID (safe for browser) |
| `RAZORPAY_KEY_SECRET` | yes | Razorpay secret — **server only, never prefix with `NEXT_PUBLIC_`** |
| `GOOGLE_DRIVE_*` | optional | Admin PDF uploads to Google Drive |

## 3. Create the database + security

Run **`scripts/supabase-schema.sql`** in the Supabase SQL editor. It creates all tables, enables Row Level Security, and defines policies:

- `cookbooks` / `events` / `dietplans` — public read, admin-only write
- `subscribers` — anyone may subscribe; only admins read/manage the list
- `admins` — bootstrap-insert restricted to whitelisted emails; admin-managed after
- `purchases` — users read/insert their own rows; admins read all
- `bookings` — users read/insert their own rows; admins read all

(Optionally seed sample data with `npm run seed:supabase`.)

## 4. Run

```bash
npm run dev
```

Open http://localhost:3000

## Payments (Razorpay Standard Checkout)

Flow is fully server-amount-verified — the client never decides the price:

1. `POST /api/create-order` — looks up live cookbook prices in Supabase, applies promo codes server-side, creates a Razorpay order, returns `order_id` + `amount`.
2. Frontend opens the Razorpay modal with that `order_id`.
3. `POST /api/verify-payment` — HMAC-SHA256 verification of `order_id|payment_id`. On match, purchases are recorded (server-side when `SUPABASE_SERVICE_ROLE_KEY` is set, otherwise by the client under RLS).

Test card: `4111 1111 1111 1112`, any future date, any CVV.

## Admin access

Admins bootstrap themselves by signing in with a whitelisted Google email (configured in `src/lib/admins.ts`). Actual write access is enforced by Supabase RLS and server-side checks — the client list only decides *who may bootstrap*.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — TypeScript check
- `npm run seed:supabase` — seed sample catalog data
- `npm run drive:oauth` / `npm run drive:check` — Google Drive setup & health

## Stack

- Next.js 16 (App Router) + React 19 + Tailwind v4
- Supabase (auth, Postgres, RLS, realtime)
- Razorpay (payments)
- Recharts (admin analytics)
