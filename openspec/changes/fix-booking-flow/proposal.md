# Fix Booking Flow and Auth Lock Error

## Why

Users accessing the employee booking link directly from another browser encounter two critical issues:
1. **"Parámetros incompletos" error**: The booking form requires query parameters (date, time, serviceId) that are not present when accessing the link directly
2. **NavigatorLockAcquireTimeoutError**: Supabase Auth's default NavigatorLockManager fails in certain browser contexts (multiple tabs, private mode, etc.)

Additionally, the "Tu link" feature in the employee's calendar generates a link to `/book` instead of the employee's public calendar, preventing users from selecting service/date/time interactively.

## What

1. **Fix "Tu link" generation**: Change the link to point to the employee's public calendar (`/c/{slug}/e/{id}`) instead of the booking form
2. **Support open booking mode**: Allow direct access to `/book` without query params by showing a complete booking form where users can select service, date, time, and contact info
3. **Fix contact validation**: Change from "phone required" to "email AND/OR phone required (at least one)"
4. **Fix Supabase Auth lock error**: Configure Supabase to use localStorage instead of NavigatorLockManager

## Impact

- **Users**: Can access booking links directly from any context without errors
- **Employees**: "Tu link" generates a shareable calendar URL that works for all users
- **Business**: Reduced booking abandonment due to technical errors