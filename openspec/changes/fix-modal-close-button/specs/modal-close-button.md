## ADDED: Modal Close Button — Status Drawer

The status update drawer in the appointments page SHALL display a close (X) button in the top-right corner of its custom header.

### Requirements

- **REQ-1**: The close button SHALL be visible in the top-right corner of the status drawer header at all times when the drawer is open.
- **REQ-2**: Clicking the close button SHALL invoke `closeDrawer()` to close the drawer and reset `selectedAppointment`, `statusAction`, and `amountCollected` state.
- **REQ-3**: The close button SHALL be visually consistent with PrimeNG's native close button style.

### Scenarios

- **Given** the status drawer is open for completing/cancelling an appointment
  **When** the user clicks the X button in the header
  **Then** the drawer closes and all drawer state is cleared

## ADDED: Modal Close Button — Employee Detail Dialog

The employee weekly detail dialog in the weekly reports page SHALL display a close (X) button in the top-right corner of its custom header.

### Requirements

- **REQ-4**: The close button SHALL be visible in the top-right corner of the employee detail dialog header at all times when the dialog is open.
- **REQ-5**: Clicking the close button SHALL invoke `closeDialog()` to close the dialog and emit the `onClose` event.
- **REQ-6**: The close button SHALL be visually consistent with PrimeNG's native close button style.

### Scenarios

- **Given** the employee detail dialog is open showing weekly appointment data
  **When** the user clicks the X button in the header
  **Then** the dialog closes and the `onClose` event is emitted to the parent

## ADDED: Modal Close Button — Style Consistency

All manually added close buttons SHALL follow a consistent visual style.

### Requirements

- **REQ-7**: Icon SHALL be `pi pi-times` (PrimeIcons)
- **REQ-8**: Size SHALL be 32x32px with `border-radius: var(--radius-md)` (8px)
- **REQ-9**: Default color SHALL be `var(--color-text-secondary)` (#5D6D7E)
- **REQ-10**: Hover color SHALL be `var(--color-text-primary)` (#2C3E50)
- **REQ-11**: Hover background SHALL be `var(--color-sage-pale)` (#E8F0E0)
- **REQ-12**: Button SHALL have no border and a transparent background by default
