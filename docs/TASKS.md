# Tasks — my-calendar

## Sprint 1 — DB + Booking Engine ✅ v1 functional milestone
**Goal:** A real client can book a real slot; no double booking possible.

- [ ] Run migration SQL: create `bookings` table + RLS policies + seed 4 demo rows
- [ ] Build `/` page: render demo bookings list (loading / empty / error / ready states)
- [ ] Build booking form component: name, email, topic, date-time picker, submit button
- [ ] `POST /api/book` route: validate input → call `gcal_check_freebusy` → branch confirm/decline
- [ ] On confirm: call `gcal_create_event` → insert booking row → return 200 + event link
- [ ] On decline: return 409 + decline reason → form shows 'slot taken' + resets
- [ ] Confirmation screen: show topic, date/time, Google Calendar link
- [ ] Error state: network/API failure shows friendly message, no silent failure
- [ ] Deploy to Vercel; verify Google Calendar event appears after test booking

**Definition of Done:** Submit form with a free slot → event appears on Google Calendar + booking row in DB. Submit with a taken slot → rejected with clear message. All in ≤30 s. No login required.

---

## Sprint 2 — Email + Builder Dashboard
**Goal:** Builder can see all bookings; client gets an email.

- [ ] Integrate Resend: send confirmation email on `booking.confirmed`
- [ ] Build `/dashboard` page: table of all bookings (date, topic, client, status)
- [ ] Dashboard loading / empty / error states
- [ ] Cancel action: update status → delete Google Calendar event → reflect in UI

**Definition of Done:** Confirmed booking triggers email to client. Dashboard shows all rows. Cancel removes the Calendar event.

---

## Sprint 3 — Lock It Down
**Goal:** Real client data is safe; dashboard is builder-only.

- [ ] Enable Supabase Auth; add builder login page
- [ ] Replace permissive RLS with owner-scoped write policies
- [ ] Gate `/dashboard` behind auth middleware
- [ ] Public booking form remains open (no login for clients)
- [ ] Audit all env vars; confirm no secrets in client bundle

**Definition of Done:** Unauthenticated user cannot read booking list or write arbitrary rows. Builder can log in and see dashboard. Client form still works without login.

---

## Sprint 4 — AI Slot Suggestions + Polish
**Goal:** Declined clients get 3 alternatives; builder can configure hours.

- [ ] On decline, scan next 7 days of free/busy → return 3 open slots
- [ ] Store suggestions with source + confidence + review_status fields
- [ ] Working-hours config (builder sets days/hours)
- [ ] Buffer-time rule between bookings
- [ ] Booking page branding (name, bio, avatar)

**Definition of Done:** Declined booking response includes 3 clickable alternative slots. Builder can set working hours and they are respected.

---

## Gantt (sprint → feature)
```
Sprint 1 | DB · Booking form · Calendar check · Confirm/Decline · Deploy
Sprint 2 | Email · Dashboard · Cancel
Sprint 3 | Auth · RLS lock-down · Secret audit
Sprint 4 | AI suggestions · Working hours · Branding
```
