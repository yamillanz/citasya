## ADDED Requirements

### Requirement: Public reschedule page reachable by token

The system SHALL expose a public route `/reprogramar/:token` that resolves the appointment identified by the token in the URL, shows a read-only summary (company, employee, services with duration, current date and time) and, when the appointment can still be moved, a form to pick a new date and slot. The page SHALL render without authentication and SHALL NOT request any other appointment.

#### Scenario: Valid token for a pending appointment

- **GIVEN** a pending appointment whose `cancellation_token` is `T`
- **WHEN** an anonymous visitor opens `/reprogramar/T`
- **THEN** the page shows the appointment summary (company, employee, services, total duration, current date and time)
- **AND** the new date and slot selector is enabled

#### Scenario: Unknown or malformed token

- **GIVEN** no appointment exists with token `X`
- **WHEN** a visitor opens `/reprogramar/X`
- **THEN** the page shows the message "Enlace inválido o cita no encontrada"
- **AND** no date or slot selector is rendered

#### Scenario: Token of an appointment that can no longer be moved

- **GIVEN** an appointment with token `T` whose status is `completed`, `cancelled` or `no_show`
- **WHEN** a visitor opens `/reprogramar/T`
- **THEN** the page shows the appointment summary in read-only form
- **AND** it shows "Esta cita ya no se puede reprogramar"
- **AND** no date or slot selector is rendered

### Requirement: Token-scoped read RPC

The system SHALL provide a `SECURITY DEFINER` function `get_appointment_by_token(p_token text)` that returns the appointment matching that token together with its services, its company (name, address, phone) and its employee (full name), and nothing for any other token. It SHALL be executable by `anon` and `authenticated`.

#### Scenario: Token resolves to its appointment

- **WHEN** an anonymous client calls `get_appointment_by_token` with a token that exists
- **THEN** exactly one appointment is returned, with its services, company and employee
- **AND** the returned row belongs to the token that was supplied

#### Scenario: Unknown token returns nothing

- **WHEN** `get_appointment_by_token` is called with a token that does not exist
- **THEN** the function returns no row (no error is raised)

#### Scenario: Token cannot be used to read another appointment

- **GIVEN** two appointments with tokens `T1` and `T2`
- **WHEN** `get_appointment_by_token('T1')` is called
- **THEN** the appointment of `T2` is not returned

### Requirement: Reschedule token secrecy

The `appointments.cancellation_token` column SHALL NOT be readable by the `anon` role, so a token cannot be harvested from the public availability reads and reused to move somebody else's appointment. Public (unauthenticated) reads of `appointments` SHALL request an explicit column list that excludes `cancellation_token`.

#### Scenario: Anonymous read of the token column is rejected

- **WHEN** an anonymous client selects `cancellation_token` from `appointments`
- **THEN** the request is rejected by column privileges

#### Scenario: Public availability keeps working without the token

- **GIVEN** the public employee calendar loads availability for a bookable employee
- **WHEN** it reads that employee's appointments for a date
- **THEN** the query requests explicit columns and succeeds
- **AND** no `cancellation_token` value is present in the response

### Requirement: Client reschedule write RPC

The system SHALL provide a `SECURITY DEFINER` function `reschedule_appointment_by_token(p_token text, p_date date, p_time time)` that moves the appointment identified by `p_token` to the new date and time, and SHALL reject every request that is not allowed. On success it SHALL modify only `appointment_date` and `appointment_time` of the same row, keep the token, status, services and client data unchanged, and return the updated appointment.

#### Scenario: Successful reschedule

- **GIVEN** a pending appointment with token `T` on 2026-10-01 at 10:00
- **AND** the employee is free on 2026-10-05 at 15:00
- **WHEN** `reschedule_appointment_by_token('T', '2026-10-05', '15:00')` is called
- **THEN** the appointment keeps its `id`, `cancellation_token`, `status = 'pending'` and services
- **AND** its `appointment_date`/`appointment_time` become 2026-10-05 / 15:00
- **AND** the updated appointment is returned

#### Scenario: Unknown token

- **WHEN** the function is called with a token that does not exist
- **THEN** it raises an error and no appointment is modified

#### Scenario: Appointment is not pending

- **GIVEN** an appointment with token `T` whose status is not `pending`
- **WHEN** `reschedule_appointment_by_token('T', …)` is called
- **THEN** it raises an error and the appointment is unchanged

#### Scenario: New date is in the past

- **GIVEN** a pending appointment with token `T`
- **WHEN** the function is called with a date before today, or with today's date and a time that already passed
- **THEN** it raises an error and the appointment is unchanged

#### Scenario: Employee is not bookable

- **GIVEN** the appointment's employee is inactive or has `not_available = true`
- **WHEN** the function is called with a valid token
- **THEN** it raises an error and the appointment is unchanged

#### Scenario: Target slot overlaps another appointment

- **GIVEN** the employee already has a non-cancelled appointment from 15:00 to 15:30 on 2026-10-05
- **AND** the appointment being moved lasts 30 minutes
- **WHEN** the function is called with 2026-10-05 / 15:00 or 15:15
- **THEN** it raises an error and the appointment is unchanged

#### Scenario: The appointment does not block itself

- **GIVEN** a pending appointment with token `T` on 2026-10-01 at 10:00, lasting 30 minutes
- **WHEN** the function is called to move it to the same date at 10:00
- **THEN** the call succeeds (only other appointments are considered)

### Requirement: Reschedule is atomic under concurrency

The reschedule RPC SHALL validate availability and apply the update inside a single transaction that locks the affected rows, so two concurrent reschedules cannot both place an appointment in the same slot.

#### Scenario: Two concurrent reschedules for the same slot

- **GIVEN** two pending appointments of the same employee
- **WHEN** both are rescheduled to the same date and time at the same moment
- **THEN** at most one of the two calls succeeds
- **AND** the other raises an availability error

### Requirement: Manager reschedule action

The manager appointments list at `/bo/appointments` SHALL offer a "Reprogramar" action on pending appointment cards. The action SHALL open a dialog prefilled with the appointment's current date and time, let the manager pick a new date and one of the employee's available slots, and apply the change through `AppointmentService.reschedule()`.

#### Scenario: Action is offered only for pending appointments

- **GIVEN** the manager list shows appointments with different statuses
- **WHEN** a card is `completed`, `cancelled` or `no_show`
- **THEN** no "Reprogramar" action is rendered for that card
- **AND** pending cards do render it

#### Scenario: Dialog proposes the employee's free slots

- **GIVEN** the manager opens the reschedule dialog for a pending appointment
- **WHEN** the dialog loads for a date
- **THEN** the slots come from `getAvailableSlots(company, employee, date, duration, excludeAppointmentId)`
- **AND** the appointment's own current slot is offered again

#### Scenario: Successful reschedule from the manager list

- **WHEN** the manager confirms a free slot
- **THEN** `AppointmentService.reschedule()` is called with the appointment id, the new date and the new time
- **AND** a success toast "Cita reprogramada correctamente" is shown
- **AND** the list is refreshed and the card shows the new date and time

#### Scenario: Slot taken between selection and confirmation

- **GIVEN** the slot was taken by another appointment after the dialog loaded
- **WHEN** the manager confirms
- **THEN** an error toast is shown ("El horario ya no está disponible")
- **AND** the dialog stays open with the appointment unchanged

### Requirement: Reschedule service contract

`AppointmentService` SHALL expose `reschedule(appointmentId: string, date: string, time: string): Promise<Appointment>` and SHALL expose `getAvailableSlots(companyId, employeeId, date, durationMinutes, excludeAppointmentId?)`. `reschedule` SHALL validate availability for the appointment's total service duration while ignoring the appointment itself, SHALL NOT modify status, services, client data or payment fields, and SHALL throw when the slot is not available.

#### Scenario: Availability is validated against other appointments only

- **GIVEN** an appointment lasting 30 minutes at 10:00
- **WHEN** `reschedule(id, sameDate, '10:00')` is called
- **THEN** the availability check ignores the appointment itself
- **AND** the update is applied when no other appointment overlaps

#### Scenario: Unavailable slot rejects the update

- **GIVEN** another appointment already occupies the target slot
- **WHEN** `reschedule()` is called
- **THEN** it throws and no update is written

### Requirement: Reschedule notification

After a successful reschedule — from the client page or from the manager list — the system SHALL invoke the `send-appointment-email` function with event type `rescheduled`. The email SHALL state the new date and time and, for the client, SHALL include the `/reprogramar/{token}` link. A failure to send the email SHALL NOT roll back or hide the successful reschedule.

#### Scenario: Client with email receives the new schedule

- **GIVEN** an appointment with a client email
- **WHEN** the appointment is rescheduled
- **THEN** the client receives an email for the `rescheduled` event
- **AND** the email contains the new date and time
- **AND** the email contains the `/reprogramar/{token}` link

#### Scenario: Employee and managers are informed

- **WHEN** an appointment is rescheduled
- **THEN** the employee receives the `rescheduled` email
- **AND** the company's active managers receive it as well

#### Scenario: Client without email

- **GIVEN** an appointment whose `client_email` is empty
- **WHEN** the appointment is rescheduled
- **THEN** no client email is attempted
- **AND** employee and manager emails are still sent

#### Scenario: Email failure does not undo the reschedule

- **GIVEN** the email function fails
- **WHEN** the appointment was rescheduled successfully
- **THEN** the appointment keeps its new date and time
- **AND** the user still sees the success state

### Requirement: Reschedule error messages

Both flows SHALL surface reschedule failures with user-facing Spanish messages and SHALL leave the appointment unchanged when a validation fails.

#### Scenario: Client-side validation error

- **WHEN** the RPC rejects the reschedule
- **THEN** the page shows an error message (for example "El horario seleccionado ya no está disponible")
- **AND** the available slots are reloaded

#### Scenario: Manager-side validation error

- **WHEN** `reschedule()` rejects
- **THEN** an error toast is shown
- **AND** the appointment keeps its previous date and time
