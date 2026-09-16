# کیخسرو ایرانزاد — استودیو

Three bilingual public pages: /, /works, /studio. Inquiry management: /admin.

## Local development

npm install
npm run dev

Run D1 migrations locally before submitting requests:

npx wrangler d1 migrations apply DB --local --config scripts/local-db.json --persist-to .wrangler/state

The admin page uses a password-derived hash and a separate session secret. For local testing, set `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET` in `.dev.vars`. Production values are stored as Sites secrets and are never committed. The admin page and all admin APIs validate the signed, HTTP-only session cookie on the server.

## Assets and fonts

Photo placeholder: public/images/studio.webp. All current frames intentionally use the supplied photo.
Persian font: public/fonts/fa/regular.woff2
English font: public/fonts/en/regular.woff2
Enable the corresponding @font-face in app/fonts.css after copying each font. No broken font references are enabled by default.
Brand transliteration is provisionally KEYKHOSRO IRANZAD, editable in app/studio-site.tsx.

## Motion

GSAP and ScrollTrigger in app/use-studio-motion.ts: entrance sequence, scroll parallax, desktop pinned editorial scene, gallery reveals, progress indicator and route curtain. Reduced-motion users receive the full static composition. Mobile omits the pinned scene.

## Requests

Requests persist in D1, with server validation, email-based rate limiting and origin checks. Admin login is password-protected, limits repeated failures, and creates an eight-hour signed session. Admin can view full submissions, filter status, paginate and save internal notes/status. The image library supports upload and removal for works and gallery, using D1 metadata and R2 file storage. Homepage imagery remains independent. Email notifications are not configured.

## Validation

npx tsc --noEmit
npm run build

Schema changes: npm run db:generate. Keep generated migrations in version control.
