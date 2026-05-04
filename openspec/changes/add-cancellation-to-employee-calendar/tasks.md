# Tasks: add-cancellation-to-employee-calendar

## Phase 1: Extender AppointmentDetailDialogComponent

- [x] 1.1 Agregar `canCancel = input(false)` al `AppointmentDetailDialogComponent`
- [x] 1.2 Agregar `canEdit = input(true)` al `AppointmentDetailDialogComponent`
- [x] 1.3 Agregar `onCancelAppointment = output<void>()`
- [x] 1.4 Agregar `cancellingAppointment = signal(false)` para el loading state del botón
- [x] 1.5 Actualizar `canEditServices` computed para incluir `this.canEdit()`
- [x] 1.6 En `appointment-detail-dialog.component.html`, agregar botón "Cancelar" dentro del bloque `@if (!isEditingServices())`, después del botón "Editar Servicios" y antes de "Cerrar", condicional a `canCancel() && appointment()?.status === 'pending'`

## Phase 2: Reemplazar diálogo inline en el calendario del backoffice

- [x] 2.1 Importar `AppointmentDetailDialogComponent`, `ToastModule`, `ConfirmationService` en `EmployeeCalendarComponent` (backoffice)
- [x] 2.2 Cambiar tipo de `appointments` signal a `Appointment[]` (sin cast a `AppointmentWithService`)
- [x] 2.3 Agregar signals: `cancellingAppointment`, actualizar `selectedAppointment` a `Appointment | null`
- [x] 2.4 Agregar getter `calendarAppointments` que hace el cast para el input del shared calendar
- [x] 2.5 En `onAppointmentClick`, castear a `Appointment` antes de asignar a `selectedAppointment`
- [x] 2.6 Reemplazar el `p-dialog` inline en el template con `<app-appointment-detail-dialog [canCancel]="true" [canEdit]="false">`
- [x] 2.7 Agregar `closeDetailsDialog()` y `handleCancelAppointment()` (confirmación → cancel → refresh → toast)

## Phase 3: Verificación

- [x] 3.1 Build exitoso sin errores
- [x] 3.2 Tests existentes del backoffice employee calendar pasan (33/33)
- [x] 3.3 Tests del AppointmentDetailDialogComponent pasan (12/12)
- [x] 3.4 Suite completa de tests: 517/517
