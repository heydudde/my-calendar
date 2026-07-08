# Security — my-calendar

## Secret Handling
- Google OAuth credentials and Calendar API key live **only** in Vercel environment variables
- Never referenced in frontend code; all Calendar calls go through Next.js API routes (server-side)
- Supabase service-role key is server-only; client uses the anon key with RLS

## Permission Model (end state, reached at Sprint 3)
| Actor | Allowed |
|---|---|
| Anonymous client | Submit booking form; read own confirmation |
| Builder (logged in) | Read all bookings; cancel bookings; view dashboard |
| Agent / API route | Inherits server-side key; can only call named tools |

## v1 Interim (Sprints 1–2)
- RLS policies are permissive (demo mode) — no real client PII should be stored until Sprint 3 locks down
- Builder must complete Sprint 3 before sharing the URL publicly with real clients

## Approved Tools Rule
Only explicitly named tools (`gcal_check_freebusy`, `gcal_create_event`, etc.) may be called from API routes. No dynamic tool construction.

## Audit Principle
Every Calendar write and every booking status change is logged with actor, timestamp, and result before the action is confirmed to the user. Logs are append-only.
