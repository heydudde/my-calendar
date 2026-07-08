# Test Plan — my-calendar

## v1 Success Scenario (manual)
1. Open app URL — page loads with demo bookings visible (no login prompt)
2. Click 'Book a session'
3. Enter: name = 'Test Client', email = 'test@example.com', topic = 'Demo Chat', pick a date/time at least 1 hour from now that is free on the builder's Google Calendar
4. Submit → loading spinner appears
5. **Expected:** Confirmation screen shows topic, date/time, and a Google Calendar event link
6. Open Google Calendar → verify event exists at that exact time
7. Open Supabase → verify `bookings` row exists with `status = 'confirmed'` and `google_event_id` populated

## Double-Booking Guard
1. Note a time slot that is already booked (use a demo booking's time)
2. Submit booking form with that exact date/time
3. **Expected:** Form shows 'That slot is already taken — please choose another time.' No event created. No duplicate row inserted.

## Empty State
1. (Dev only) Clear seeded rows from `bookings`
2. Load homepage → **Expected:** 'No bookings yet' empty state shown, not a blank page or error

## API Error State
1. Temporarily set an invalid Google API key in env vars
2. Submit booking form
3. **Expected:** Friendly error message ('Something went wrong, please try again'). No crash. No data written.

## Form Validation
1. Submit form with email field blank → **Expected:** inline validation error, form does not submit
2. Submit form with a past date/time → **Expected:** validation rejects it before API call

## Loading State
1. Submit form on a slow connection (throttle in DevTools)
2. **Expected:** Button shows spinner / disabled state; user cannot double-submit
