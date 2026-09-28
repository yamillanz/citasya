## Context

CitasYa keeps every booking in the `appointments` table (Postgres + RLS on Supabase) and mutates it only through `AppointmentService` with direct `supabase-js` table calls — there is no RPC in the frontend today. Existing mutation paths are `create`, `cancel`, `updateStatus`, `updateServices` and `markAsPaid`; no path writes `appointment_date`/`appointment_time` after creation, and the generic `update()` has no callers.

Relevant current state:

- `appointments.cancellation_token` is generated on create (`crypto.randomUUID()`) and the schema comment already documents it as "token para cancelar/**reprogramar** sin login" (`supabase/01-tables.sql:155`). The confirmation email emits `${appUrl}/cancelar/{token}`, but no such route, component, policy or RPC exists — the link is dead.
- Anonymous access: `appointments_public_insert` (insert), `appointments_select_public` (read appointments of bookable employees, needed by the public calendar) and `appointments_token_select` (`cancellation_token IS NOT NULL`). There is **no anon UPDATE policy** and **no anon SELECT policy on `appointment_services`**.
- `AppointmentService.getByEmployee()` selects `*`, so the token of every appointment of a bookable employee is currently readable by any anonymous caller — a token-based feature would inherit that exposure.
- Availability is computed in TypeScript: `getAvailableSlots(companyId, employeeId, date, durationMinutes)` walks the company schedule and drops slots overlapping existing appointments; `checkAvailability(..., excludeAppointmentId?)` already supports ignoring one appointment (used by `updateServices`).
- Emails go through the `send-appointment-email` edge function, whose event whitelist is `created | cancelled | no_show`.
- Project constraints: PrimeNG-only UI, `ChangeDetectionStrategy.OnPush`, and two known PrimeNG issues documented in `AGENTS.md` (double-click bug for `p-datepicker` with `formControlName`, positioning issues for `p-select` inside scrollable dialogs). Tests are behavior-oriented (spies + Testing Library) per `AGENTS.md`.

## Goals / Non-Goals

**Goals:**

- Let a client move their own appointment from the link in their confirmation email, without login, touching only that appointment.
- Let a manager move a pending appointment from `/bo/appointments` with a date + slot picker that respects the employee's real availability.
- Keep the reschedule atomic and authoritative on the server for the client path, and consistent with the existing manager-side validation pattern.
- Stop `cancellation_token` from being readable by anonymous clients.
- Notify client, employee and managers with the new date/time.

**Non-Goals:**

- Client-side cancellation (the `/cancelar/:token` link stays unimplemented; the change removes the dead link from the email instead of advertising it).
- Rescheduling from the employee backoffice calendar / history dialog / daily-close (`AppointmentDetailDialogComponent` stays untouched).
- Changing services, employee or price while rescheduling.
- A DB-level double-booking constraint (`EXCLUDE USING gist`) for the create path.
- Fixing the anonymous availability degradation caused by `appointment_services` having no anon SELECT policy (see Risks).
- OTP/email-verification instead of a token.

## Decisions

### D1 — Client write path: `SECURITY DEFINER` RPC, not an anon UPDATE policy

An RLS policy cannot see values supplied by the caller, so an anon UPDATE policy would have to be `USING (cancellation_token IS NOT NULL)` — which lets any anonymous caller update *any* appointment they can address, and ids/tokens are already exposed by the public reads. The RPC validates the token, the status, the date and the overlap inside one transaction.

*Alternatives:* (a) anon UPDATE policy scoped by token — rejected (above); (b) a Postgres trigger on `appointments` validating `auth.uid() IS NULL` cases — rejected (harder to keep the token contract in one place, and the error messages would be opaque); (c) email OTP — rejected (large UX/backend addition).

### D2 — Token secrecy: revoke the table-level grant from `anon` and re-grant explicit columns; all anon reads and insert-returnings use explicit column lists

Postgres column-level privileges are additive to table-level privileges: `REVOKE SELECT (col)` cannot remove a table-wide grant, and Supabase's default privileges give `anon` table-wide SELECT on new tables (verified in the project: `anon_table_select = true`). The effective pattern is therefore:

```sql
REVOKE ALL PRIVILEGES ON appointments FROM anon;
GRANT INSERT ON appointments TO anon;
GRANT SELECT (id, company_id, …, updated_at) ON appointments TO anon;  -- sin cancellation_token
```

This makes PostgREST reject any anonymous query that requests `cancellation_token` — including `select *`. Every anonymous path must then request explicit columns: `getByEmployee` (public calendar / booking availability), `getById` and the insert-with-returning in `create` (the public booking form calls `create()`, whose `.insert().select()` uses `return=representation` and returns every column). All three now share the explicit column list (`APPOINTMENT_COLUMNS` in `AppointmentService`), which excludes the token. With the token secret again, the RPC from D1 is a real credential check.

*Alternatives:* (a) keep `select('*')` and accept the exposure — rejected (anyone could move anyone's appointment); (b) add a separate non-exposed `manage_token` column — rejected (still a column on a row anon can select, so it needs the same revoke plus a data migration); (c) move public availability behind an RPC that returns only busy intervals — deferred (bigger blast radius on the booking flow, listed under Non-Goals); (d) column-only `REVOKE SELECT (cancellation_token)` without touching table-level grants — rejected (no-op while the table-wide grant exists).

### D3 — Same row, same token; only `pending` can be moved

Rescheduling updates `appointment_date`/`appointment_time` on the existing row: services, duration, price, client data, payment fields and the token are preserved, so the emailed link keeps working after a reschedule and the appointment history stays in one record. Only `status = 'pending'` appointments are movable — the same rule the project already applies to service edits (`updateServices`, `canEditServices`).

*Alternative:* cancel + recreate — rejected (loses the record, invalidates the token, re-asks the client for data, breaks reports).

### D4 — Availability: reuse the TypeScript computation, keep the RPC authoritative

`getAvailableSlots` gains an optional `excludeAppointmentId` (mirroring `checkAvailability`) and is reused by both the public page and the manager dialog, so slot presentation stays in one place. The client RPC performs its own overlap check with `appointment_services` durations, so the authoritative decision is server-side; the picker is a UX aid.

### D5 — Atomicity: transaction + advisory lock keyed by employee and date

The RPC takes `pg_advisory_xact_lock(hashtext(employee_id || date))` before validating, then locks the appointment row with `FOR UPDATE`. Two concurrent reschedules for the same employee/day therefore serialize; the loser re-validates and fails with the availability error. Without this, the check-then-write pattern (`checkAvailability` before `UPDATE`) that the rest of the app uses would allow double-booking — acceptable for a manager-driven single-user flow, not for a public endpoint.

### D6 — Notification: new `rescheduled` event type

`EmailEventType` (frontend) and the edge function's `EventType` whitelist learn `rescheduled`, with label `REPROGRAMADA`, a colour, copy stating the new date/time, and the `/reprogramar/{token}` link for the client. Reusing `created` was rejected: the client copy, the employee/manager branches and the link generation are all keyed on `created`, and a second `created` email would be misleading. Sending the email is best-effort, like every other notification in the app.

### D7 — Email link: replace the dead cancel link with the working reschedule link

`buildClientEmail` currently appends "¿Necesitas cancelar? … /cancelar/{token}". Since that route does not exist, the change replaces that block with "¿Necesitas reprogramar tu cita? … /reprogramar/{token}". Client cancellation remains out of scope; the proposal's Non-Goals record it.

### D8 — Manager UI: new dialog opened from the list card, not the shared detail dialog

`/bo/appointments` has no per-appointment detail dialog and the shared `AppointmentDetailDialogComponent` is only used by the employee calendar/history. A new `ManagerAppointmentRescheduleDialogComponent` modelled on `manager-appointment-create-dialog` (employee/services are read-only here; date picker + slot grid + submit) keeps the manager list self-contained and avoids changing components used by the employee flows.

### D9 — PrimeNG constraints baked into both UIs

The date picker uses the documented workaround for the `p-datepicker` + `formControlName` + OnPush double-click bug (`AGENTS.md`, `openspec/specs/primeng-datepicker-onpush-bug`): a dedicated signal plus `[ngModel]` with `[ngModelOptions]="{standalone: true}"`, not a reactive-form control. Time selection uses a grid of `p-button`s (not `p-select` inside the scrollable dialog/drawer), matching the existing create dialog. Styling follows `STYLES.MD`; dialogs rendered into `<body>` are styled from `styles.scss`, never `:host ::ng-deep`.

## Data Contracts

```sql
-- read: appointment + services + company + employee, scoped by token
get_appointment_by_token(p_token text)
  returns table (id uuid, company_id uuid, employee_id uuid, client_name text,
                 appointment_date date, appointment_time time, status text, notes text,
                 company_name text, company_address text, company_phone text,
                 employee_name text, services jsonb, total_duration int)

-- write: validated, atomic reschedule; returns the updated appointment row
reschedule_appointment_by_token(p_token text, p_date date, p_time time)
  returns appointments
```

Both are `SECURITY DEFINER SET search_path = public` with `GRANT EXECUTE … TO anon, authenticated`.

`reschedule_appointment_by_token` validation order (each failure raises a Spanish message):

1. row with `cancellation_token = p_token` exists (`FOR UPDATE`), else `'Enlace inválido o cita no encontrada'`;
2. `status = 'pending'`, else `'Esta cita ya no se puede reprogramar'`;
3. `p_date > current_date`, or `p_date = current_date and p_time > localtime`, else `'La nueva fecha debe ser futura'`;
4. employee `is_active and not not_available`, else `'El profesional no está disponible'`;
5. no other non-cancelled appointment of that employee on `p_date` overlaps `[p_time, p_time + duration)` (duration = sum of `appointment_services.duration_minutes`, falling back to the deprecated `service_id` duration, then 30 minutes), else `'El horario ya no está disponible'`;
6. `UPDATE … RETURNING *`.

Frontend contracts:

- `AppointmentService.reschedule(appointmentId, date, time): Promise<Appointment>`
- `AppointmentService.getAvailableSlots(companyId, employeeId, date, durationMinutes, excludeAppointmentId?)`
- `AppointmentService.getByToken(token)` / `rescheduleByToken(token, date, time)` wrapping `supabase.rpc(...)`
- `EmailEventType = 'created' | 'cancelled' | 'no_show' | 'rescheduled'`

## File Changes

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/20260928_add_appointment_reschedule_rpcs.sql` | new | **Paso 1/2, seguro ahora**: both RPCs (`SECURITY DEFINER`) + `GRANT EXECUTE` |
| `supabase/migrations/20260928_add_appointment_reschedule_grants.sql` | new | **Paso 2/2, solo tras el deploy del frontend**: revoke table-level from `anon` + re-grant all columns except `cancellation_token` |
| `app-web/src/app/core/services/appointment.service.ts` | modified | shared `APPOINTMENT_COLUMNS` (excludes the token) used by `getByEmployee`, `getById` and the insert-returning in `create`; `excludeAppointmentId` in `getAvailableSlots`, `reschedule`, `getByToken`, `rescheduleByToken` |
| `app-web/src/app/core/models/email-notification.model.ts` | modified | add `rescheduled` |
| `app-web/src/app/app.routes.ts` | modified | public route `reprogramar/:token` |
| `app-web/src/app/features/public/reschedule-appointment/*` | new | token page (component, template, styles, spec) |
| `app-web/src/app/features/backoffice/manager/appointments/manager-appointment-reschedule-dialog.component.*` | new | manager reschedule dialog (+ spec) |
| `app-web/src/app/features/backoffice/manager/appointments/appointments.component.*` | modified | "Reprogramar" action, dialog wiring, refresh + toast |
| `backend/send-appointment-email/index.ts` | modified | `rescheduled` event, copy, `/reprogramar/{token}` link |
| `app-web/src/app/core/services/appointment.service.spec.ts` | modified | behaviour tests for the new methods |
| `app-web/src/app/features/public/reschedule-appointment/*.spec.ts` | new | page behaviour tests |

## Testing Strategy

Behaviour first, per `AGENTS.md`: `toHaveBeenCalledWith()` over DOM assertions over primitive checks.

- **Service**: `reschedule` calls `checkAvailability` with the appointment's own id excluded and then writes only the date/time (spy on the Supabase builder); `reschedule` throws and writes nothing when availability fails; `getAvailableSlots(..., excludeId)` offers the excluded appointment's slot again; `getByToken` calls the `get_appointment_by_token` RPC with the token.
- **Public page**: renders the summary for a token (mocked service); shows "Enlace inválido o cita no encontrada" for an unknown token; renders no picker for a non-pending appointment; confirming calls `rescheduleByToken` with the chosen date/time and shows the success state; a rejected RPC shows the error and reloads slots.
- **Manager dialog/list**: pending cards render "Reprogramar" and non-pending do not; confirming calls `AppointmentService.reschedule` with id/date/time; a rejection shows the error toast and keeps the appointment unchanged; a success refreshes the list.
- **Emails**: covered by the notification call site assertion (`notify` called with `'rescheduled'`); the edge function's own templates are verified manually against a test appointment.

## Risks / Trade-offs

- [Anonymous availability is optimistic: `appointment_services` has no anon SELECT policy, so `getByEmployee` returns appointments without durations for anonymous callers and the picker can offer a slot that is actually taken] → the RPC re-validates with real durations and returns `'El horario ya no está disponible'`; the page reloads slots after the error. A dedicated availability RPC is a documented follow-up.
- [Two reschedules for different appointments of the same employee can still race with a *booking* (`create`) because the create path is not advisory-locked] → advisory lock covers reschedule-vs-reschedule; reschedule-vs-create keeps the pre-existing behaviour. A DB-level constraint is out of scope.
- [Column revoke breaks any anonymous query that still selects `*` or returns all columns] → anon only queries `appointments` through `getByEmployee`, `getById` and `create`'s insert-returning, all migrated to the shared explicit column list in the same change; deploy order is frontend first, then migration. `service_role` (edge function) and `authenticated` (backoffice) are unaffected.
- [The token travels in the URL and in emails; anyone with the link can move the appointment] → accepted (same trust model as the cancel link the product already advertises); the token is regenerated only at create time, and only `pending` appointments can be moved.
- [`rescheduled` emails can be triggered by any caller of the edge function, as with `created` today] → accepted pre-existing risk; the function is not part of this change's trust boundary.
- [PrimeNG date picker regressions] → follow the documented signal + `ngModel` workaround and keep slot selection as buttons, as the existing dialogs do.

## Migration Plan

1. Deploy the frontend changes that stop selecting `cancellation_token` publicly (`getByEmployee`, `getById` and `create`'s insert-returning use the explicit column list) — safe with or without the migration.
2. Apply `supabase/migrations/20260928_add_appointment_reschedule_rpcs.sql` (Paso 1/2): creates both functions and grants execute to `anon, authenticated` — additive, can run before or after step 1; smoke-test both RPCs (unknown token, non-pending, overlap; the reschedule test inside `BEGIN … ROLLBACK`).
3. Ship the public page, the manager action and the `rescheduled` email event (they depend on the functions from step 2); deploy the web app and the edge function, then verify public booking still works with the old grants.
4. Only after step 3 is live: apply `supabase/migrations/20260928_add_appointment_reschedule_grants.sql` (Paso 2/2) — revokes table-level privileges from `anon` and re-grants all columns except `cancellation_token`; verify an anonymous read of the token is rejected by column privileges.
5. Rollback: drop both functions, `GRANT ALL PRIVILEGES ON appointments TO anon`, and revert the frontend commits. No data migration is involved, so rollback never loses appointments.

## Open Questions

- Should the client page also offer cancellation (completing the dead `/cancelar/:token` link)? Deferred; the token RPC pattern would make it a small follow-up.
- Should reschedule be offered from the employee backoffice calendar and the daily-close workbench too? Deferred to a later change.
- Should the new date/time be logged as an audit entry (e.g. `rescheduled_from_date`, `rescheduled_count`)? No column exists today; the change keeps the current single-record model unless reporting asks for it.
