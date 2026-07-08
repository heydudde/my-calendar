# PRD — my-calendar Booking App

## Problem
Clients have no self-serve way to book time. Without a system, double bookings happen and the builder spends time on scheduling instead of work.

## Target User
The builder's clients — anyone who wants to book a session. No account required.

## Core Objects
| Object | Purpose |
|---|---|
| `booking` | One client appointment request and its outcome |
| Google Calendar Event | The live calendar entry created on confirmation |

## MVP Must-Haves (v1)
- [ ] Public booking form: client enters name, email, topic, date & time
- [ ] System calls Google Calendar free/busy API for the requested slot
- [ ] If free → create Google Calendar event + save booking row → show confirmation
- [ ] If taken → show clear rejection message + prompt to pick a different time
- [ ] No double booking possible by construction (Calendar is the source of truth)
- [ ] Page loads with demo bookings visible (no login required)
- [ ] All form states handled: loading, success, slot-taken error, API error

## Non-Goals (v1)
- AI-suggested alternative slots
- Builder login / dashboard
- Email confirmation to client
- Working-hours configuration
- Multi-user / SaaS

## Success Criteria
**Pass:** A recruiter opens the live URL, fills in the booking form with a free time slot, sees a confirmed booking message, and the event appears on the builder's Google Calendar — in under 30 seconds, with zero errors.

**Fail:** Any dead button, any silent failure, any double booking, any login wall before the form.
