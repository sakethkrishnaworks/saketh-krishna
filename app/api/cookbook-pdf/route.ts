import { NextRequest, NextResponse } from 'next/server';
import { BUNDLE_CONTENTS } from '../../../src/lib/products';
import { getDriveAccessToken } from '../../../src/lib/driveUpload';
import { createServerClient } from '../../../src/lib/serverSupabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const privateHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  Pragma: 'no-cache',
  Vary: 'Authorization',
  'X-Content-Type-Options': 'nosniff',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

function failure(status: number) {
  return NextResponse.json(
    { error: 'Unable to access this cookbook.' },
    { status, headers: privateHeaders }
  );
}

function driveFileId(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' || url.hostname !== 'drive.google.com' ||
      url.port || url.username || url.password || url.hash
    ) return null;

    const pathMatch = url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]{10,200})(?:\/(?:view|preview))?\/?$/);
    if (pathMatch) return url.searchParams.has('id') ? null : pathMatch[1];
    if (url.pathname !== '/open' && url.pathname !== '/uc') return null;
    const ids = url.searchParams.getAll('id');
    return ids.length === 1 && /^[A-Za-z0-9_-]{10,200}$/.test(ids[0]) ? ids[0] : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(true);
    if (!supabase) return failure(503);

    const token = request.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
    if (!token) return failure(401);
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user?.id) return failure(401);

    const cookbookIds = request.nextUrl.searchParams.getAll('cookbookId');
    const cookbookId = cookbookIds[0];
    if (cookbookIds.length !== 1 || !cookbookId?.trim() || cookbookId.length > 200) return failure(400);

    const { data: owned, error: purchaseError } = await supabase
      .from('purchases')
      .select('cookbook_id, product_id')
      .eq('user_id', userData.user.id)
      .eq('status', 'paid');
    if (purchaseError) return failure(503);
    const ownedIds = new Set((owned ?? []).flatMap((row) => [row.cookbook_id, row.product_id]).filter((id): id is string => typeof id === 'string'));
    const granted = ownedIds.has(cookbookId) ||
      [...ownedIds].some((id) => BUNDLE_CONTENTS[id]?.includes(cookbookId));
    if (!granted) return failure(403);

    // Snapshot kept for the direct-purchase row so deleted products still open.
    const { data: purchase } = await supabase
      .from('purchases')
      .select('pdf_url')
      .eq('user_id', userData.user.id)
      .eq('cookbook_id', cookbookId)
      .eq('status', 'paid')
      .order('purchased_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: cookbook, error: cookbookError } = await supabase
      .from('cookbooks')
      .select('pdfurl')
      .eq('id', cookbookId)
      .maybeSingle();
    if (cookbookError) return failure(503);

    const currentUrl = cookbook?.pdfurl;
    const fileId = driveFileId(
      typeof currentUrl === 'string' && currentUrl.trim() ? currentUrl : purchase?.pdf_url
    );
    if (!fileId) return failure(404);

    const accessToken = await getDriveAccessToken();
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
      {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/pdf' },
        cache: 'no-store',
        redirect: 'error',
        signal: request.signal,
      }
    );
    if (
      !response.ok || !response.body ||
      response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/pdf'
    ) {
      await response.body?.cancel();
      return failure(502);
    }

    return new NextResponse(response.body, {
      headers: {
        ...privateHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="cookbook.pdf"',
      },
    });
  } catch {
    return failure(502);
  }
}
