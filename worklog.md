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
