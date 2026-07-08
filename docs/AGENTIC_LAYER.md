# Agentic Layer — my-calendar

## Risk Levels & Actions

### Low — Auto-execute (no approval)
| Action | Tool | Trigger |
|---|---|---|
| Check Google Calendar free/busy | `gcal_check_freebusy` | Client submits form |
| Insert booking row | `supabase_insert` | Slot confirmed free |

### Medium — Builder reviews before action (Sprint 2+)
| Action | Tool | Trigger |
|---|---|---|
| Send confirmation email | `resend_send_email` | Booking confirmed — auto in Sprint 2 |

### High — Approval required
| Action | Tool | Trigger |
|---|---|---|
| Create Google Calendar event | `gcal_create_event` | Only after free/busy confirms slot is open |
| Cancel Google Calendar event | `gcal_delete_event` | Builder explicitly cancels on dashboard |

### Critical — Human only
| Action | Notes |
|---|---|
| Delete all bookings | Never automated |
| Revoke Google OAuth token | Manual in Google console |

## Audit Log Fields (every meaningful action)
`id`, `action`, `booking_id`, `actor` ('client' or 'builder'), `result` ('success'/'error'), `detail` (json), `created_at`

## Named Tools Only
`gcal_check_freebusy`, `gcal_create_event`, `gcal_delete_event`, `supabase_insert`, `supabase_update`, `resend_send_email` — no raw `run_any` or `send_any`.
