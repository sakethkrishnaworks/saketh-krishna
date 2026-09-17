import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../src/lib/serverAuth';
import { getDriveAccessToken, makeDriveFilePublic, uploadFileToDrive } from '../../../src/lib/driveUpload';

export const runtime = 'nodejs';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    // Only signed-in admins may push files into the owner's Google Drive.
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return NextResponse.json({ error: admin.message }, { status: admin.status });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const cookbookId = formData.get('cookbookId')?.toString() || 'draft';

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No image file was provided.' }, { status: 400 });
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported image format. Use JPG, PNG, WebP, or GIF.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Image must be 10MB or smaller.' }, { status: 400 });
    }

    const driveFile = await uploadFileToDrive({
      file,
      fileName: file.name,
      mimeType: file.type,
      appProperties: { cookbookId, kind: 'cover' },
    });

    await makeDriveFilePublic(driveFile.id, await getDriveAccessToken());

    return NextResponse.json({
      id: driveFile.id,
      name: driveFile.name,
      imageUrl: `https://drive.google.com/thumbnail?id=${driveFile.id}&sz=w1000`,
      webViewLink: driveFile.webViewLink,
      webContentLink: driveFile.webContentLink,
    });
  } catch (error) {
    console.error('Image upload failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Image upload failed.' },
      { status: 500 }
    );
  }
}
