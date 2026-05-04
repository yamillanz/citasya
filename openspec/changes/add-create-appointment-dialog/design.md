# Design: Create Appointment Dialog

## Architecture Decision
**New standalone component** `AppointmentCreateDialogComponent` — chosen over extending `AppointmentDetailDialogComponent` (would make it too complex) or embedding form in calendar (violates single responsibility).

## Component Location
`app-web/src/app/features/backoffice/employee/calendar/appointment-create-dialog.component.*`

## Data Flow
```
EmployeeCalendarComponent
  showCreateDialog (signal)
  openCreateDialog() → set true
  handleAppointmentCreated() → refresh + close
      │
      ▼
  <app-appointment-create-dialog
    [visible]  [employeeId]  [companyId]
    (onClose)  (onCreated)>
      │
      ▼
  AppointmentCreateDialogComponent
    - FormGroup (client_name, client_phone, client_email,
                 appointment_date, appointment_time, service_ids)
    - Signals: employeeServices, availableSlots, loadingServices, loadingSlots, submitting
    - Services: ServiceService, AppointmentService, MessageService
    - Effects: visible→load services, date+services→recalculate slots
```

## Component API
- **Inputs**: `visible: boolean`, `employeeId: string`, `companyId: string`
- **Outputs**: `onClose: void`, `onCreated: void`

## Template Structure
- `p-dialog` root with header="Nueva Cita", [modal]="true", [visible], (onHide)
- Content: form fields in vertical layout
  1. Service checkboxes (with conditional scroll container)
  2. Client name input
  3. Client phone input
  4. Client email input
  5. Date picker
  6. Time select dropdown
- Footer: "Cancelar" (outlined) + "Crear Cita" (primary, disabled when invalid, loading when submitting)

## PrimeNG Modules
DialogModule, ButtonModule, InputTextModule, DatePickerModule, SelectModule, CheckboxModule, ToastModule, FloatLabelModule

## Styling
- Dialog width: 500px
- Service scroll: max-height: 200px, overflow-y: auto when > 4 services
- p-dialog overrides in `styles.scss` (since p-dialog renders in body)

## File Inventory
| File | Action | Purpose |
|------|--------|---------|
| `appointment-create-dialog.component.ts` | NEW | Component logic |
| `appointment-create-dialog.component.html` | NEW | Template |
| `appointment-create-dialog.component.scss` | NEW | Styles |
| `appointment-create-dialog.component.spec.ts` | NEW | Tests |
| `employee-calendar.component.ts` | MODIFY | Add signal + methods |
| `employee-calendar.component.html` | MODIFY | Add button + dialog tag |
| `employee-calendar.component.scss` | MODIFY | Button styles |
| `employee-calendar.component.spec.ts` | MODIFY | Integration tests |
