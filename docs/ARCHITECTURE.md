# Architecture — my-calendar

## Stack
- **Frontend:** Next.js 14 (App Router) on Vercel
- **Database:** Supabase (Postgres + RLS)
- **Calendar:** Google Calendar API (free/busy + event creation)
- **Email (Sprint 2):** Resend
- **Auth (Sprint 3):** Supabase Auth (builder only)

## Now vs Later
| Now (v1) | Later |
|---|---|
| Public booking form | Builder login + dashboard |
| Google Calendar free/busy check | AI slot suggestions |
| Confirm / decline flow | Working-hours rules |
| Seed demo rows | Email confirmations |

## Key User Action — Step by Step
1. Client opens booking page (no login required; demo bookings visible)
2. Client submits form: name, email, topic, date & time
3. Next.js API route calls Google Calendar **free/busy** for the slot (server-side, key never exposed)
4. **If free:** API route creates a Google Calendar event → inserts `booking` row (status = confirmed) → returns confirmation to client
5. **If busy:** API route returns slot-taken error → client sees message + form resets to pick another time
6. Booking table is the durable record; Google Calendar is the live source of truth

## Why It Runs Without AI
The core check is deterministic: Google Calendar says free or busy. No AI is needed for v1. AI (slot suggestions) is additive in Sprint 4.
