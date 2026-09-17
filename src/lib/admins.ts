// Emails allowed to bootstrap themselves as admins on first sign-in.
// This list ONLY gates the initial `admins` row creation (see the
// `admins_create` RLS policy in scripts/supabase-schema.sql). All real
// write access is enforced by RLS + server-side checks, not by this list.

export const AUTHORIZED_ADMIN_EMAILS = [
  'sakethkrishna.work@gmail.com',
  'gokulkannan0205@gmail.com',
];

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  return Boolean(email && AUTHORIZED_ADMIN_EMAILS.includes(email.toLowerCase()));
}
