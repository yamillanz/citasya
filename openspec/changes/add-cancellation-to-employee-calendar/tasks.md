# Tasks: add-cancellation-to-employee-calendar

## Phase 1: Extender AppointmentDetailDialogComponent

- [ ] 1.1 Agregar `canCancel = input(false)` al `AppointmentDetailDialogComponent`
- [ ] 1.2 Agregar `onCancelAppointment = output<void>()` 
- [ ] 1.3 Agregar `cancellingAppointment = signal(false)` para el loading state del botón
- [ ] 1.4 En `appointment-detail-dialog.component.html`, agregar botón "Cancelar Cita" dentro del bloque `@if (!isEditingServices())`, después del botón "Editar Servicios" y antes de "Cerrar", con:
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

## Phase 2: Cargar y mostrar citas pendientes en el calendario público

- [ ] 2.1 Inyectar `AuthService` en `EmployeeCalendarComponent`
- [ ] 2.2 Agregar signals: `pendingAppointments = signal<Appointment[]>([])`, `selectedAppointment = signal<Appointment | null>(null)`, `dialogVisible = signal(false)`, `cancellingAppointment = signal(false)`
- [ ] 2.3 Agregar `currentUser = signal<User | null>(null)` y llamar `authService.getCurrentUser()` en `ngOnInit`
- [ ] 2.4 Agregar `canCancel = computed(() => { ... })` que verifica: `currentUser()` existe Y (`currentUser().id === employee().id` O `currentUser().role === 'manager' && currentUser().company_id === company().id`)
- [ ] 2.5 Crear método `loadPendingAppointments()` que llama `appointmentService.getByEmployeeAll(employeeId)`, filtra `status === 'pending'`, y actualiza `pendingAppointments`
- [ ] 2.6 Convertir `calendarOptions` de campo estático a `computed(() => ({ ... }))` con:
  - Mismas opciones estáticas (plugins, initialView, headerToolbar, slotMinTime/MaxTime, weekends, selectable, locale, etc.)
  - `events: this.buildEvents()`
  - `select: this.handleDateSelect.bind(this)`
  - `dateClick: this.handleDateClick.bind(this)`
  - `eventClick: this.handleEventClick.bind(this)`
- [ ] 2.7 Crear `buildEvents()` que mapea `pendingAppointments()` a `EventInput[]` con `id`, `title: "HH:MM - Client Name"`, `start`, `backgroundColor: '#F4D03F'`, `borderColor: '#F4D03F'`, `textColor: '#fff'`
- [ ] 2.8 Crear `handleEventClick(arg)` que busca `pendingAppointments().find(a => a.id === arg.event.id)`, asigna a `selectedAppointment`, y abre el diálogo (`dialogVisible.set(true)`)
- [ ] 2.9 Agregar `closeDialog()` que resetea `dialogVisible.set(false)` y `selectedAppointment.set(null)`
- [ ] 2.10 Llamar `loadPendingAppointments()` al final de `ngOnInit` (después de cargar company, employee, y services)

## Phase 3: Implementar flujo de cancelación

- [ ] 3.1 Inyectar `ConfirmationService` y `MessageService` en `EmployeeCalendarComponent`
- [ ] 3.2 Crear método `async handleCancelAppointment()`:
  ```typescript
  const apt = this.selectedAppointment();
  if (!apt) return;
  
  const confirmed = await new Promise<boolean>(resolve => {
    this.confirmationService.confirm({
      message: '¿Cancelar esta cita?',
      header: 'Confirmar cancelación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => resolve(true),
      reject: () => resolve(false)
    });
  });
  
  if (!confirmed) return;
  
  this.cancellingAppointment.set(true);
  try {
    await this.appointmentService.cancel(apt.id);
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cita cancelada correctamente' });
    await this.loadPendingAppointments();
    this.dialogVisible.set(false);
    this.selectedAppointment.set(null);
  } catch (error: any) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudo cancelar la cita' });
  } finally {
    this.cancellingAppointment.set(false);
  }
  ```
- [ ] 3.3 Conectar `(onCancelAppointment)="handleCancelAppointment()"` en el binding del diálogo

## Phase 4: Integrar diálogo y toast en template

- [ ] 4.1 Agregar imports al componente: `AppointmentDetailDialogComponent`, `ToastModule`, `MessageService`
- [ ] 4.2 Agregar `providers: [MessageService]` al decorador del componente
- [ ] 4.3 Agregar `<p-toast position="bottom-right">` al final del template (antes del cierre del container principal)
- [ ] 4.4 Agregar `<app-appointment-detail-dialog>` al template:
  ```html
  <app-appointment-detail-dialog
    [appointment]="selectedAppointment()"
    [visible]="dialogVisible()"
    [canCancel]="canCancel()"
    (onClose)="closeDialog()"
    (onCancelAppointment)="handleCancelAppointment()">
  </app-appointment-detail-dialog>
  ```
  - No pasar `currentIndex`, `totalCount`, `hasPrevious`, `hasNext`, `(onPrevious)`, `(onNext)` ya que no hay navegación entre citas en este contexto
  - No pasar `(onServicesUpdated)` ya que la edición de servicios no está habilitada en el contexto público (`canEditServices` requiere `status === 'pending'` que sí se cumple, pero la edición de servicios desde el público no es parte de este scope)

## Phase 5: Verificación

- [ ] 5.1 Verificar que las citas pendientes se muestran como eventos amarillos en el calendario
- [ ] 5.2 Verificar que al hacer clic en un evento se abre el diálogo con los datos correctos (cliente, servicios, fecha, hora, estado, precio)
- [ ] 5.3 Verificar que el botón "Cancelar Cita" NO aparece para usuarios no autenticados
- [ ] 5.4 Verificar que el botón "Cancelar Cita" SÍ aparece para el empleado autenticado viendo su propio calendario
- [ ] 5.5 Verificar que la confirmación funciona: cancelar = no cambia nada, confirmar = cancela la cita
- [ ] 5.6 Verificar que tras cancelar, la cita desaparece del calendario y el diálogo se cierra
- [ ] 5.7 Verificar que los toasts de éxito y error se muestran correctamente
- [ ] 5.8 Verificar que el `AppointmentDetailDialogComponent` sigue funcionando correctamente en la página de historial del empleado (backoffice) sin el botón "Cancelar Cita"
- [ ] 5.9 Ejecutar tests existentes: `npm run test -- --testPathPattern="appointment-detail-dialog"` y verificar que pasan
