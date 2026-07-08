# Intelligence Layer — my-calendar

## v1: Rule-Based (No AI)
The availability check is pure logic: query Google Calendar free/busy → slot free = confirm, slot busy = decline. Deterministic. No model needed.

## Messy Input → Structured Data
| Raw client input | Structured field |
|---|---|
| Free-text date picker | `requested_at` (ISO 8601 timestamptz) |
| Free-text topic | `topic` text |
| Duration (default 30 min) | `duration_minutes` integer |

## Events to Track
- `booking.attempted` — client submitted form
- `booking.confirmed` — slot was free, event created
- `booking.declined` — slot was taken
- `booking.cancelled` — builder cancelled

## Sprint 4 — Slot Suggestion AI
- **Trigger:** slot is declined
- **Input:** client's preferred date range + working-hours config
- **Output:** 3 next-available slots
- **Storage per suggestion:** `suggested_at` (value), `suggestion_source` ('google_freebusy_scan'), `suggestion_confidence` (1.0 — deterministic scan), `suggestion_review_status` ('unreviewed')
- **Scoring rule:** earliest available slot scores highest; score = 1 / hours_from_now
