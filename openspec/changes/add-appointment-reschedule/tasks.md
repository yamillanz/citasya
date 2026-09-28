## 1. Database — token RPCs and token secrecy

- [x] 1.1 Create the migration split in two files: `20260928_add_appointment_reschedule_rpcs.sql` (Paso 1/2, seguro ahora) y `20260928_add_appointment_reschedule_grants.sql` (Paso 2/2, solo tras el deploy del frontend)
- [x] 1.2 Implement `get_appointment_by_token(p_token text)`: `SECURITY DEFINER SET search_path = public`, returns appointment + services (name, duration, price) + company (name, address, phone) + employee name; returns no row for an unknown token
- [x] 1.3 Implement `reschedule_appointment_by_token(p_token text, p_date date, p_time time)`: advisory lock on (employee, date), `FOR UPDATE` on the token row, then validate token → status `pending` → future date/time → bookable employee → no overlap with other non-cancelled appointments (duration = sum of `appointment_services`, fallback `service_id`, fallback 30 min); `UPDATE … RETURNING *`
- [x] 1.4 Use the Spanish messages from the design (`'Enlace inválido o cita no encontrada'`, `'Esta cita ya no se puede reprogramar'`, `'La nueva fecha debe ser futura'`, `'El profesional no está disponible'`, `'El horario ya no está disponible'`)
- [x] 1.5 Effective grant pattern (a column-only REVOKE is a no-op while `anon` holds table-level SELECT): `REVOKE ALL PRIVILEGES ON appointments FROM anon; GRANT INSERT …; GRANT SELECT (<all columns except cancellation_token>) TO anon`, plus `GRANT EXECUTE ON FUNCTION … TO anon, authenticated` for both functions
- [ ] 1.6 Two-step apply: (a) ejecutar `…_rpcs.sql` (Paso 1/2) en el SQL Editor y smoke-test both functions: valid token, unknown token, non-pending appointment, overlapping slot (el reschedule dentro de `BEGIN…ROLLBACK`); (b) ejecutar `…_grants.sql` (Paso 2/2) solo después del deploy del frontend, verificando que booking/calendario siguen funcionando y que un `select cancellation_token` anónimo es rechazado

## 2. Service and model layer

- [x] 2.1 `appointment.service.ts`: replace the `select('*')` in `getByEmployee()` with an explicit column list that excludes `cancellation_token` (keeps `appointment_services(service:services(*))` embed)
- [x] 2.2 `appointment.service.ts`: add the optional `excludeAppointmentId` parameter to `getAvailableSlots()` and skip that appointment when computing busy intervals
- [x] 2.3 `appointment.service.ts`: add `reschedule(appointmentId, date, time)` — load the appointment with services, compute total duration, run `checkAvailability(..., excludeAppointmentId)`, throw `'El horario ya no está disponible'` when busy, otherwise update only `appointment_date`/`appointment_time` (+ `updated_at`) and return the refreshed appointment
- [x] 2.4 `appointment.service.ts`: add `getByToken(token)` and `rescheduleByToken(token, date, time)` wrapping `supabase.rpc('get_appointment_by_token' | 'reschedule_appointment_by_token')` and mapping the returned row to `Appointment` (+ services)
- [x] 2.5 `core/models/email-notification.model.ts`: extend `EmailEventType` with `'rescheduled'`
- [x] 2.6 Update `appointment.service.spec.ts`: `reschedule` excludes its own appointment and writes only date/time; throws and writes nothing when unavailable; `getAvailableSlots(..., excludeId)` re-offers the excluded slot; `getByToken` calls the RPC with the token (spies + `toHaveBeenCalledWith`)
- [x] 2.7 `appointment.service.ts`: `getById` and the insert-with-returning in `create` (public booking path, runs as `anon`) switch to the shared explicit column list (`APPOINTMENT_COLUMNS`, no `cancellation_token`) — required before the grant migration; guard tests assert no anon read/return requests the token

## 3. Public reschedule page

- [x] 3.1 Add the public route `reprogramar/:token` in `app.routes.ts` (lazy `loadComponent`, no guard), next to the existing `c/:companySlug` routes
- [x] 3.2 Create `features/public/reschedule-appointment/reschedule-appointment.component.ts` (standalone, OnPush, `inject()`): read the token from the route, load via `getByToken`, expose `loading` / `notFound` / `notReschedulable` / `appointment` signals
- [x] 3.3 Render the appointment summary (company, employee, services, total duration, current date/time) and the invalid-link / non-pending states with the Spanish messages from the spec
- [x] 3.4 Add the date selector using the documented `p-datepicker` + signal + `[ngModel]`/`ngModelOptions.standalone` workaround (no `formControlName` under OnPush) with `minDate` = today
- [x] 3.5 Load slots with `getAvailableSlots(companyId, employeeId, date, totalDuration, appointmentId)` and render them as a `p-button` grid (no `p-select` inside scrollable containers); show "No hay horarios disponibles para ese día" when empty
- [x] 3.6 Confirm flow: `p-confirmDialog` ("¿Confirmar reprogramación?") → `rescheduleByToken(token, date, time)` → success state "Cita reprogramada" with the new date/time; on error show the message, reload slots and keep the form
- [x] 3.7 After a successful reschedule call `emailNotificationService.notify(appointmentId, 'rescheduled')` (best-effort, never blocking the success state)
- [x] 3.8 Style with `STYLES.MD` tokens (page/card/form patterns); any PrimeNG override that renders into `<body>` goes in `styles.scss`, not `:host ::ng-deep`
- [x] 3.9 Add `reschedule-appointment.component.spec.ts`: renders the summary for a valid token; invalid token shows the error state and no picker; non-pending shows the read-only state; confirming calls `rescheduleByToken` with the chosen date/time and renders the success state; a rejection shows the error and reloads slots

## 4. Manager reschedule action

- [x] 4.1 Create `features/backoffice/manager/appointments/manager-appointment-reschedule-dialog.component.ts` (+ html/scss) modelled on `manager-appointment-create-dialog`: inputs = appointment, output = `rescheduled`; `p-datepicker` (min today) + slot button grid + submit/cancel
- [x] 4.2 Load slots with `getAvailableSlots(companyId, employeeId, date, totalDuration, appointment.id)` and keep the appointment's current slot selectable
- [x] 4.3 On submit call `AppointmentService.reschedule(appointment.id, date, time)`; success → emit and close; failure → error toast and keep the dialog open
- [x] 4.4 `appointments.component.html`: add the "Reprogramar" action to the pending-only action group (next to Completar/Cancelar/No asistió)
- [x] 4.5 `appointments.component.ts`: wire the dialog state, and on success show the toast "Cita reprogramada correctamente", refresh the list, and fire `notify(id, 'rescheduled')`
- [x] 4.6 Add dialog/list specs: pending cards render "Reprogramar" and non-pending cards do not; confirming calls `reschedule` with id/date/time; a rejection shows the error toast and leaves the appointment unchanged; success triggers the list refresh

## 5. Notification email

- [x] 5.1 `backend/send-appointment-email/index.ts`: accept `rescheduled` in the event whitelist and add `STATUS_LABELS`/`STATUS_COLORS` entries (`REPROGRAMADA`)
- [x] 5.2 Add the `rescheduled` copy for the client ("Tu cita fue reprogramada…" with the new date/time), employee and manager emails
- [x] 5.3 Replace the dead `/cancelar/{token}` block in `buildClientEmail` with the `/reprogramar/{token}` link (for `created` and `rescheduled`)
- [ ] 5.4 Deploy the edge function and verify with a real appointment: client, employee and manager emails for a reschedule; appointment without `client_email` skips only the client email *(pendiente: requiere `supabase functions deploy`)*

## 6. Verification and rollout

- [x] 6.1 Run the frontend suite (`npm test` in `app-web`) and confirm no regressions in booking, cancellation, service-edit and payment flows *(39 suites / 850 tests OK, tsc limpio)*
- [ ] 6.2 Manual end-to-end (client): book an appointment, open the emailed `/reprogramar/{token}` link, move it, verify the success screen, the new slot blocking the old one, and the email
- [ ] 6.3 Manual end-to-end (manager): reschedule a pending appointment from `/bo/appointments`, verify the toast, the refreshed card, the availability of the freed slot and the email
- [ ] 6.4 Negative checks: token of a cancelled appointment, unknown token, past date, slot taken by another appointment, and an anonymous `select=cancellation_token` request rejected by the column privilege
- [ ] 6.5 Confirm the deploy order (frontend explicit column list first, then the migration) and record the rollback steps from the design
