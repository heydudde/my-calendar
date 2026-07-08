# Data Model — my-calendar

## `bookings`
| Field | Type | Notes |
|---|---|---|
| `id` | uuid PK | gen_random_uuid() |
| `user_id` | uuid nullable | owner-scope added at lock-down sprint |
| `client_name` | text NOT NULL | |
| `client_email` | text NOT NULL | |
| `topic` | text NOT NULL | |
| `requested_at` | timestamptz NOT NULL | the exact slot the client wants |
| `duration_minutes` | integer default 30 | |
| `status` | text default 'confirmed' | enum: confirmed \| declined \| cancelled |
| `google_event_id` | text nullable | returned by Calendar API on create |
| `google_event_link` | text nullable | htmlLink from Calendar API |
| `decline_reason` | text nullable | e.g. 'slot unavailable' |
| `created_at` | timestamptz NOT NULL | default now() |

## AI Fields (Sprint 4)
When AI suggests slots, each suggestion stores:
- `suggested_at` (value), `suggestion_source text`, `suggestion_confidence numeric`, `suggestion_review_status text default 'unreviewed'`

## RLS
- v1: permissive read + write for demo (no login required)
- Sprint 3 (lock-down): `user_id = auth.uid()` for write; public read stays for the booking form

## Relationships
- `bookings` is standalone in v1; `user_id` FK to `auth.users` added at lock-down
