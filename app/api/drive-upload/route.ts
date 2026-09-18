import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../src/lib/serverAuth';
import { uploadFileToDrive } from '../../../src/lib/driveUpload';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Only signed-in admins may push files into the owner's Google Drive.
    // The client cannot forge this — identity is re-derived server-side.
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return NextResponse.json({ error: admin.message }, { status: admin.status });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const cookbookId = formData.get('cookbookId')?.toString() || 'draft';

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No PDF file was provided.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 });
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'PDF must be 25MB or smaller.' }, { status: 400 });
    }

    const driveFile = await uploadFileToDrive({
      file,
      fileName: file.name,
      mimeType: 'application/pdf',
      appProperties: { cookbookId },
    });

    return NextResponse.json({
      id: driveFile.id,
      name: driveFile.name,
      pdfUrl: `https://drive.google.com/file/d/${driveFile.id}/view`,
      previewUrl: `https://drive.google.com/file/d/${driveFile.id}/preview`,
      webViewLink: driveFile.webViewLink,
      webContentLink: driveFile.webContentLink,
      warning: 'No public sharing permission was added. Inherited folder permissions still apply; use a restricted Drive folder for PDFs.',
    });
  } catch {
    return NextResponse.json(
      { error: 'Google Drive upload failed.' },
      { status: 500 }
    );
  }
}
