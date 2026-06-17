# Google Drive PDF Delivery

## Target Flow

1. Admin compresses the cookbook PDF before publishing.
2. Admin uses the cookbook `Upload PDF` button.
3. The app sends the PDF to `/api/drive-upload`.
4. The server uploads the PDF into Google Drive.
5. Firestore stores the returned Drive link in the cookbook `pdfUrl` field.
6. After checkout, the cookbook appears in `My Library`.
7. Users click the cookbook and read it inside the app reader.

## Google Drive API Setup

Preferred setup uses OAuth so uploads consume your own Google Drive storage quota.

1. In Google Cloud, enable the Google Drive API.
2. Create an OAuth Client ID for a Web application.
3. Add the OAuth `Client ID` and `Client secret` to `.env` or `.env.local`.
4. Generate a refresh token:

```bash
npm run drive:oauth
```

5. Paste the printed `GOOGLE_DRIVE_REFRESH_TOKEN` into `.env` or `.env.local`.
6. Create a Drive folder for cookbook PDFs.
7. Copy the folder ID from the Drive folder URL.
8. Add these values to `.env` or `.env.local`:

```bash
GOOGLE_OAUTH_CLIENT_ID="YOUR_GOOGLE_OAUTH_CLIENT_ID"
GOOGLE_OAUTH_CLIENT_SECRET="YOUR_GOOGLE_OAUTH_CLIENT_SECRET"
GOOGLE_DRIVE_REFRESH_TOKEN="YOUR_GOOGLE_DRIVE_REFRESH_TOKEN"
GOOGLE_DRIVE_FOLDER_ID="YOUR_DRIVE_FOLDER_ID"
GOOGLE_DRIVE_PUBLIC_READ="true"
```

`GOOGLE_DRIVE_PUBLIC_READ=true` makes uploaded PDFs readable by anyone with the link, which allows the embedded in-app reader to work. For stricter paid-content protection, set it to `false` and serve files through an authenticated server route instead.

If upload returns `Service Accounts do not have storage quota`, remove the service-account-only setup and configure the OAuth variables above. Service accounts can only upload reliably to Google Workspace Shared Drives or via domain-wide delegation.

## Admin Upload

In the app:

1. Sign in as admin.
2. Open **Admin → Cookbooks**.
3. Edit or add a cookbook.
4. Click **Upload PDF**.
5. Wait for the progress bar to reach 100%.
6. Click **Save Cookbook**.

The upload button now stores PDFs directly in Google Drive, not Firebase Storage.

## Compression

Compress PDFs before upload with a tool such as Ghostscript:

```bash
gs -sDEVICE=pdfwrite \
  -dCompatibilityLevel=1.6 \
  -dPDFSETTINGS=/ebook \
  -dNOPAUSE \
  -dQUIET \
  -dBATCH \
  -sOutputFile=compressed-cookbook.pdf \
  original-cookbook.pdf
```

Use `/ebook` for a good reader-friendly balance. Use `/screen` only when maximum size reduction matters more than visual quality.

## Manual Google Drive Link

You can still manually upload a compressed PDF to Google Drive:

1. Open the file sharing settings.
2. Set access to the intended audience.
3. Copy the file link.
4. Paste it into the admin cookbook form under `Cookbook PDF`.

The app converts common Drive file links into an embedded preview URL for the in-app reader.

## Production Note

For real paid content, do not expose permanently public Drive links directly in Firestore. Use a server API after payment verification to issue short-lived reader access, or store the files in a protected bucket and stream them through authenticated routes.
