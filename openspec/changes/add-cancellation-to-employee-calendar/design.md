# Design: add-cancellation-to-employee-calendar

## Architecture Decisions

### Decision: Reuse AppointmentDetailDialogComponent instead of creating a new one
**Chose** to extend the existing `AppointmentDetailDialogComponent` with new `canCancel` input and `onCancelAppointment` output.
**Over** Creating a separate public-specific dialog component.
**Because**: The component already handles appointment detail display, navigation, and service editing. Adding opt-in cancel support via an input/output is minimally invasive and follows the Open/Closed Principle. Existing consumers (employee history page) are unaffected because `canCancel` defaults to `false` and they don't bind `onCancelAppointment`.

### Decision: Cancel logic lives in the parent, not the dialog
**Chose** to have the dialog emit `onCancelAppointment` and let the parent (`employee-calendar`) handle confirmation + service call.
**Over** Putting the confirmation dialog and `appointmentService.cancel()` call inside `AppointmentDetailDialogComponent`.
**Because**: Keeps the dialog component reusable and focused on display. The parent controls the full flow: auth check, confirmation, service call, and data refresh. Different contexts (public calendar, backoffice) can have different cancellation behaviors without modifying the dialog.

### Decision: Use ConfirmationService directly for confirmation
**Chose** to inject `ConfirmationService` (from `primeng/api`) in `EmployeeCalendarComponent`.
**Over** Using the `CONFIRMATION_DIALOG` injection token abstraction.
**Because**: `ConfirmationService` is already provided globally in `app.config.ts` and `ConfirmDialogModule` is imported in `App`. Using it directly avoids needing to provide the abstraction token in this standalone component. The daily-close pattern using the token is for backoffice components only.

### Decision: Convert calendarOptions to computed() signal
**Chose** to convert `calendarOptions` from a static class field to a `computed(() => ({ ... }))` signal.
**Over** Updating `calendarOptions.events` imperatively and calling `calendarApi.refetchEvents()`.
**Because**: This is the pattern already used by `shared/components/calendar/calendar.component.ts`. When `pendingAppointments()` changes (e.g., after cancellation), the computed recomputes and Angular re-renders the FullCalendar with the new events. It's cleaner and more Angular-idiomatic than imperative API calls.

### Decision: Load all employee appointments and filter client-side
**Chose** to call `getByEmployeeAll(employeeId)` (no date filter) and filter `status === 'pending'` in the component.
**Over** Creating a new service method or using `getByEmployee(employeeId, date)` per month.
**Because**: `getByEmployeeAll` already exists and returns all appointments ordered by date. Filtering `pending` on the client is trivial and avoids multiple API calls for different date ranges. The FullCalendar handles which events to show based on the current view.

### Decision: Single button emits once with loading state
**Chose** to disable the "Cancelar Cita" button with a loading spinner while the parent processes the cancellation.
**Over** Having the dialog manage its own loading state independently.
**Because**: The loading state originates in the parent (`cancellingAppointment` signal). The dialog receives it implicitly because the parent sets the signal when the flow starts. The dialog button binds `[loading]="cancellingAppointment()"` for visual feedback.

### Decision: Auth check at dialog-open time
**Chose** to check authentication and compute `canCancel` when the component initializes (via `ngOnInit` calling `authService.getCurrentUser()`), stored as a signal.
**Over** Checking auth each time the dialog opens.
**Because**: Auth state doesn't change during the lifecycle of this page. Checking once at init and computing `canCancel` reactively is sufficient and avoids redundant async calls.

## Data Flow

### Appointment Loading & Display
```
1. ngOnInit()
2.   ├── loadPendingAppointments()
3.   │     └── appointmentService.getByEmployeeAll(employeeId)
4.   │           └── filter: status === 'pending'
5.   │                 └── pendingAppointments.set(result)
6.   │
7.   └── authService.getCurrentUser()
8.         └── currentUser.set(user)

9. calendarOptions = computed(() => ({
10.     ...staticOptions,
11.     events: buildEvents(pendingAppointments()),
12.     eventClick: handleEventClick
13.   }))

14. buildEvents():
15.   pendingAppointments().map(apt => ({
16.     id: apt.id,
17.     title: `${apt.appointment_time} - ${apt.client_name}`,
18.     start: `${apt.appointment_date}T${apt.appointment_time}`,
19.     backgroundColor: '#F4D03F',  // yellow for pending
20.     borderColor: '#F4D03F',
21.     textColor: '#fff',
22.     extendedProps: { ... }
23.   }))
```

### Cancellation Flow
```
1. User clicks appointment event on calendar
2.   └── handleEventClick(arg)
3.         ├── Find apt by arg.event.id in pendingAppointments()
4.         ├── selectedAppointment.set(apt)
5.         └── dialogVisible.set(true)

6. User clicks "Cancelar Cita" in dialog
7.   └── onCancelAppointment.emit()
8.         └── handleCancelAppointment()
9.               ├── confirmationService.confirm({
10.               │     message: '¿Cancelar esta cita?',
11.               │     header: 'Confirmar cancelación',
12.               │     icon: 'pi pi-exclamation-triangle',
13.               │     acceptLabel: 'Sí, cancelar',
14.               │     rejectLabel: 'No',
15.               │     acceptButtonStyleClass: 'p-button-danger'
16.               │   })
17.               ├── [If confirmed]
18.               │     ├── cancellingAppointment.set(true)
19.               │     ├── try: appointmentService.cancel(apt.id)
20.               │     ├── toast: success
21.               │     ├── loadPendingAppointments()  // refresh
22.               │     ├── dialogVisible.set(false)
23.               │     └── finally: cancellingAppointment.set(false)
24.               └── [If rejected] → no-op
```

### canCancel Computation
```
canCancel = computed(() => {
  const user = currentUser();
  const comp = company();
  const emp = employee();

  if (!user || !comp || !emp) return false;

  const isEmployee = user.id === emp.id;
  const isManager = user.role === 'manager' && user.company_id === comp.id;

  return isEmployee || isManager;
});
```

## File Changes

### Modified Files

| File | Change |
|------|--------|
| `app-web/src/app/features/backoffice/employee/history/appointment-detail-dialog.component.ts` | Add `canCancel` input, `onCancelAppointment` output, `cancellingAppointment` signal |
| `app-web/src/app/features/backoffice/employee/history/appointment-detail-dialog.component.html` | Add "Cancelar Cita" button in footer (after "Editar Servicios", before "Cerrar") |
| `app-web/src/app/features/public/employee-calendar/employee-calendar.component.ts` | Inject AuthService, ConfirmationService, MessageService; add pendingAppointments/selectedAppointment/dialogVisible/currentUser/canCancel signals; add loadPendingAppointments/buildEvents/handleEventClick/handleCancelAppointment/openDialog/closeDialog; convert calendarOptions to computed() |
| `app-web/src/app/features/public/employee-calendar/employee-calendar.component.html` | Add `<app-appointment-detail-dialog>`, add `<p-toast>` |

### No New Files
All changes are modifications to existing files. No new components, services, or modules are needed.

## Component Details

### AppointmentDetailDialogComponent Changes

**New input**:
```typescript
canCancel = input(false);
```

**New output**:
```typescript
onCancelAppointment = output<void>();
```

**New signal**:
```typescript
cancellingAppointment = signal(false);
```

**New button in footer** (HTML, inside the `@if (!isEditingServices())` block, between "Editar Servicios" and "Cerrar"):
```html
@if (canCancel() && appointment()?.status === 'pending') {
  <p-button
    label="Cancelar Cita"
    icon="pi pi-ban"
    severity="danger"
    [outlined]="true"
    [loading]="cancellingAppointment()"
    (onClick)="onCancelAppointment.emit()">
  </p-button>
}
```

### EmployeeCalendarComponent Changes

**Converted calendarOptions pattern** (from static to computed):
```typescript
// BEFORE (class field):
calendarOptions: CalendarOptions = { events: [], select: ..., dateClick: ... };

// AFTER (computed signal):
calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  events: this.buildEvents(),
  select: this.handleDateSelect.bind(this),
  dateClick: this.handleDateClick.bind(this),
  eventClick: this.handleEventClick.bind(this),
  // ... other static options
}));
```

**New methods**:
```typescript
buildEvents(): EventInput[] { /* maps pendingAppointments to calendar events */ }
handleEventClick(arg: any): void { /* finds apt, opens dialog */ }
handleCancelAppointment(): void { /* confirmation → cancel → refresh */ }
openDialog(appointment: Appointment): void { /* sets selectedAppointment + visible */ }
closeDialog(): void { /* resets state */ }
```

### Confirmation Dialog Pattern
Uses `ConfirmationService.confirm()` from PrimeNG, which delegates rendering to the `<p-confirmDialog>` already present in `App` (root component). No additional template element is needed in the employee-calendar component.

### Toast Pattern
Requires adding `<p-toast position="bottom-right">` to the template and providing `MessageService` at the component level. Uses `messageService.add({ severity, summary, detail })` for both success and error notifications.

### Styling
No additional SCSS changes are required. The dialog's existing styles handle the new button layout (flexbox `.action-buttons` container). The button uses PrimeNG's built-in `severity="danger"` and `[outlined]="true"` for consistent danger styling.
