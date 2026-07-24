---
Task ID: 1
Agent: Main Agent
Task: Fix admin panel internal server error, standalone admin layout, and photo upload

Work Log:
- Diagnosed root cause: start.sh was suppressing all errors with `2>/dev/null`, meaning `prisma db push` and seed failures were invisible
- Also: photo uploads wrote to `public/uploads/` which is read-only in Docker standalone mode
- Also: admin settings API had no auth protection
- Fixed start.sh: proper error logging, retry on db push failure, DATABASE_URL check
- Fixed Dockerfile: ensured all runtime dependencies copied, /tmp/uploads writable by nextjs user
- Fixed photo upload: saves to /tmp/uploads, served via new /api/admin/settings/photo/[filename] API route
- Added auth checks to admin settings POST and PUT routes
- Created (admin)/layout.tsx for standalone admin layout with proper metadata
- Created root middleware.ts for admin route handling
- Built and verified all routes compile correctly
- Pushed to GitHub, Railway will auto-deploy

Stage Summary:
- Admin panel internal error fix: root cause was silent DB sync failure → now logs properly with retry
- Photo upload: now uses /tmp/uploads (writable in Docker) instead of public/uploads
- Admin is properly standalone: /admin/login for login, /admin for dashboard, separate from client navigation
- Push commit: 3a031da

---
Task ID: 2
Agent: Main Agent
Task: Audit code, fix OTP delivery, clear errors, deploy

Work Log:
- Full audit of all API routes, schema, admin panel, landing page, and config
- Found ROOT CAUSE of OTP not sending: `resend` package missing from `serverExternalPackages` in next.config.ts
  - In standalone output mode, Next.js bundles all node_modules via webpack. The `resend` package uses Node.js internals that break when bundled.
  - Fix: Added `'resend'` to `serverExternalPackages` array.
- Removed `set -e` from start.sh to prevent script exit on non-critical failures (emoji encoding, prisma retry, etc.)
- Verified all 5 user requests:
  1. OTP fix: DONE (resend externalized)
  2. Admin-editable Elon photo: ALREADY DONE (settings API + landing page fetches elonPhotoUrl)
  3. Admin messaging for KYC: ALREADY DONE (PATCH /api/admin/kyc with adminMessage + attachmentUrl + email)
  4. Admin messaging for deposits: ALREADY DONE (PATCH /api/admin/deposits with adminMessage + attachmentUrl + email)
  5. Popup testimonials: ALREADY DONE (TestimonialPopup component, fixed bottom-right, auto-rotates every 18s)
- Verified schema has all fields needed by API routes (elonPhotoUrl, verificationCode, lockedUntil, etc.)
- Committed and pushed: 296dbfb

Stage Summary:
- OTP fix: `resend` added to serverExternalPackages — this was the critical missing piece
- start.sh: removed set -e, removed emoji chars that could cause shell encoding issues
- All other features were already implemented from previous sessions
- Railway will auto-deploy from push
