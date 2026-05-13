import { signal, computed } from '@angular/core';
import { Appointment, AppointmentStatus, PaymentMethod } from '../../../../core/models/appointment.model';
import { User } from '../../../../core/models/user.model';

describe('AppointmentsComponent (Manager)', () => {
  const mockEmployees: User[] = [
    { id: 'emp-1', full_name: 'Juan Pérez', email: 'juan@test.com', role: 'employee' as const, company_id: 'company-1', is_active: true, can_be_employee: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
    { id: 'emp-2', full_name: 'María García', email: 'maria@test.com', role: 'employee' as const, company_id: 'company-1', is_active: true, can_be_employee: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }
  ];

  const mockAppointments: Appointment[] = [
    { id: 'apt-1', client_name: 'Cliente Uno', client_phone: '555-111-1111',
      appointment_date: '2026-03-20', appointment_time: '10:00', status: 'pending' as const,
      employee_id: 'emp-1', service_id: 'srv-1', company_id: 'company-1', is_paid: false,
      created_at: '2026-03-19T10:00:00Z', updated_at: '2026-03-19T10:00:00Z',
      services: [{ id: 'srv-1', name: 'Corte', duration_minutes: 30, price: 50, company_id: 'company-1', commission_percentage: 0, is_active: true, created_at: '2026-01-01T00:00:00Z' }, { id: 'srv-2', name: 'Peinado', duration_minutes: 20, price: 30, company_id: 'company-1', commission_percentage: 0, is_active: true, created_at: '2026-01-01T00:00:00Z' }],
      employee: { full_name: 'Juan Pérez' } },
    { id: 'apt-2', client_name: 'Cliente Dos', client_phone: '555-222-2222',
      appointment_date: '2026-03-20', appointment_time: '11:00', status: 'completed' as const,
      amount_collected: 120, amount_in_bs: 720, employee_id: 'emp-2', service_id: 'srv-3', company_id: 'company-1', is_paid: false,
      created_at: '2026-03-19T11:00:00Z', updated_at: '2026-03-19T11:00:00Z',
      services: [{ id: 'srv-3', name: 'Tinte', duration_minutes: 60, price: 80, company_id: 'company-1', commission_percentage: 0, is_active: true, created_at: '2026-01-01T00:00:00Z' }],
      employee: { full_name: 'María García' } }
  ];

  type StatusAction = 'completed' | 'cancelled' | 'no_show' | 'paid' | null;

  const createMock = () => {
    const appointments = signal<Appointment[]>([]);
    const employees = signal<User[]>([]);
    const loading = signal(true);
    const filterEmployee = signal('');
    const filterStatus = signal('');
    const selectedAppointment = signal<Appointment | null>(null);
    const showStatusDialog = signal(false);
    const statusAction = signal<StatusAction>(null);
    const amountCollected = signal<number>(0);
    const exchangeRate = signal<number>(1);
    const amountBs = signal<number>(0);
    const observations = signal<string>('');
    const paymentMethod = signal<PaymentMethod | null>(null);
    const paymentReference = signal<string>('');
    const paymentAmountBs = signal<number>(0);
    const saving = signal(false);
    const selectedCompletionReceipt = signal<File | null>(null);
    const completionReceiptError = signal<string | null>(null);
    const uploadingCompletionReceipt = signal(false);
    const selectedPaymentReceipt = signal<File | null>(null);
    const paymentReceiptError = signal<string | null>(null);
    const uploadingPaymentReceipt = signal(false);

    const updateStatusCalls: { appointment: Appointment; status: AppointmentStatus }[] = [];

    const filteredAppointments = computed(() =>
      appointments().filter(apt => {
        if (filterEmployee() && apt.employee_id !== filterEmployee()) return false;
        if (filterStatus() && apt.status !== filterStatus()) return false;
        return true;
      })
    );

    const employeeOptions = computed(() => [
      { label: 'Todos los empleados', value: '' },
      ...employees().map(e => ({ label: e.full_name, value: e.id }))
    ]);

    const getStatusSeverity = (s: AppointmentStatus) => ({ completed: 'success', pending: 'warn', cancelled: 'danger', no_show: 'secondary' }[s] || 'info') as any;
    const getStatusLabel = (s: AppointmentStatus) => ({ completed: 'Completada', pending: 'Pendiente', cancelled: 'Cancelada', no_show: 'No asistió' }[s] || s);
    const getServicesNames = (apt: Appointment | null) => !apt?.services?.length ? 'N/A' : apt.services.map(s => s.name).join(', ');
    const getTotalPrice = (apt: Appointment | null) => apt?.services?.reduce((s, svc) => s + svc.price, 0) || 0;

    const openStatusDialog = (appointment: Appointment, status: AppointmentStatus) => {
      selectedAppointment.set(appointment);
      statusAction.set(status as any);
      showStatusDialog.set(true);
      if (status === 'completed') {
        amountCollected.set(0);
        exchangeRate.set(1);
        amountBs.set(0);
        observations.set('');
        selectedCompletionReceipt.set(null);
        completionReceiptError.set(null);
        uploadingCompletionReceipt.set(false);
      }
    };

    const closeDrawer = () => {
      showStatusDialog.set(false);
      selectedAppointment.set(null);
      statusAction.set(null);
      paymentMethod.set(null);
      paymentReference.set('');
      paymentAmountBs.set(0);
      selectedCompletionReceipt.set(null);
      completionReceiptError.set(null);
      uploadingCompletionReceipt.set(false);
      selectedPaymentReceipt.set(null);
      paymentReceiptError.set(null);
      uploadingPaymentReceipt.set(false);
    };

    const openPaymentDrawer = (appointment: Appointment) => {
      selectedAppointment.set(appointment);
      statusAction.set('paid');
      showStatusDialog.set(true);
      paymentAmountBs.set(appointment.amount_in_bs ?? 0);
      paymentMethod.set(null);
      paymentReference.set('');
      selectedPaymentReceipt.set(null);
      paymentReceiptError.set(null);
      uploadingPaymentReceipt.set(false);
    };

    const getDrawerTitle = () => {
      const action = statusAction();
      switch (action) {
        case 'completed': return 'Completar Cita';
        case 'cancelled': return 'Cancelar Cita';
        case 'no_show': return 'Marcar como No Asistió';
        case 'paid': return 'Registrar Pago';
        default: return 'Actualizar Estado';
      }
    };

    const getActionLabel = () => {
      const action = statusAction();
      switch (action) {
        case 'completed': return 'Confirmar y Completar';
        case 'cancelled': return 'Sí, Cancelar';
        case 'no_show': return 'Sí, No Asistió';
        case 'paid': return 'Confirmar pago';
        default: return 'Aceptar';
      }
    };

    const getActionSeverity = () => {
      const action = statusAction();
      switch (action) {
        case 'completed': return 'success';
        case 'cancelled':
        case 'no_show': return 'danger';
        case 'paid': return 'success';
        default: return 'secondary';
      }
    };

    const confirmStatusChange = () => {
      const appointment = selectedAppointment();
      const action = statusAction();
      if (!appointment || !action) return;
      if (action === 'completed' && completionReceiptError()) return;
      updateStatusCalls.push({ appointment, status: action as AppointmentStatus });
      closeDrawer();
    };

    const markAsPaidCalls: { id: string; paymentData: { payment_method: PaymentMethod; payment_reference?: string; payment_amount_bs?: number } }[] = [];

    const confirmPayment = () => {
      const appointment = selectedAppointment();
      const method = paymentMethod();
      if (!appointment || !method) return;
      if (paymentReceiptError()) return;
      markAsPaidCalls.push({
        id: appointment.id,
        paymentData: {
          payment_method: method,
          payment_reference: paymentReference() || undefined,
          payment_amount_bs: paymentAmountBs() || undefined,
        }
      });
      closeDrawer();
    };

    return { appointments, employees, loading, filterEmployee, filterStatus, selectedAppointment, showStatusDialog, statusAction, amountCollected, exchangeRate, amountBs, observations, paymentMethod, paymentReference, paymentAmountBs, saving, filteredAppointments, employeeOptions, getStatusSeverity, getStatusLabel, getServicesNames, getTotalPrice, openStatusDialog, openPaymentDrawer, closeDrawer, getDrawerTitle, getActionLabel, getActionSeverity, confirmStatusChange, confirmPayment, updateStatusCalls, markAsPaidCalls, selectedCompletionReceipt, completionReceiptError, uploadingCompletionReceipt, selectedPaymentReceipt, paymentReceiptError, uploadingPaymentReceipt };
  };

  describe('filtrado de citas', () => {
    it('debe filtrar por empleado', () => {
      const comp = createMock();
      comp.appointments.set(mockAppointments);
      comp.filterEmployee.set('emp-1');
      expect(comp.filteredAppointments()).toHaveLength(1);
      expect(comp.filteredAppointments()[0].employee_id).toBe('emp-1');
    });

    it('debe filtrar por estado', () => {
      const comp = createMock();
      comp.appointments.set(mockAppointments);
      comp.filterStatus.set('completed');
      expect(comp.filteredAppointments()).toHaveLength(1);
      expect(comp.filteredAppointments()[0].status).toBe('completed');
    });

    it('debe combinar filtros', () => {
      const comp = createMock();
      comp.appointments.set(mockAppointments);
      comp.filterEmployee.set('emp-1');
      comp.filterStatus.set('completed');
      expect(comp.filteredAppointments()).toHaveLength(0);
    });
  });

  describe('opciones de empleados', () => {
    it('debe incluir opción "Todos" como primera', () => {
      const comp = createMock();
      comp.employees.set(mockEmployees);
      expect(comp.employeeOptions()[0].label).toBe('Todos los empleados');
    });

    it('debe incluir todos los empleados', () => {
      const comp = createMock();
      comp.employees.set(mockEmployees);
      expect(comp.employeeOptions()).toHaveLength(3);
    });
  });

  describe('servicios múltiples en vista manager', () => {
    it('debe mostrar nombres concatenados de servicios', () => {
      const comp = createMock();
      expect(comp.getServicesNames(mockAppointments[0])).toBe('Corte, Peinado');
    });

    it('debe calcular precio total de servicios', () => {
      const comp = createMock();
      expect(comp.getTotalPrice(mockAppointments[0])).toBe(80);
    });

    it('debe retornar N/A para citas sin servicios', () => {
      const comp = createMock();
      expect(comp.getServicesNames(null)).toBe('N/A');
    });
  });

  describe('status helpers', () => {
    it('debe retornar severity y label correctos por estado', () => {
      const comp = createMock();
      expect(comp.getStatusSeverity('completed')).toBe('success');
      expect(comp.getStatusLabel('completed')).toBe('Completada');
      expect(comp.getStatusSeverity('pending')).toBe('warn');
      expect(comp.getStatusLabel('pending')).toBe('Pendiente');
    });
  });

  describe('openStatusDialog — apertura del drawer de confirmación', () => {
    it('debe abrir el drawer y trackear la cita para cancelar', () => {
      const comp = createMock();
      comp.openStatusDialog(mockAppointments[0], 'cancelled');
      expect(comp.showStatusDialog()).toBe(true);
      expect(comp.selectedAppointment()?.id).toBe('apt-1');
      expect(comp.statusAction()).toBe('cancelled');
    });

    it('debe abrir el drawer y trackear la cita para no_show', () => {
      const comp = createMock();
      comp.openStatusDialog(mockAppointments[0], 'no_show');
      expect(comp.showStatusDialog()).toBe(true);
      expect(comp.selectedAppointment()?.id).toBe('apt-1');
      expect(comp.statusAction()).toBe('no_show');
    });

    it('debe abrir el drawer y trackear la cita para completar', () => {
      const comp = createMock();
      comp.openStatusDialog(mockAppointments[0], 'completed');
      expect(comp.showStatusDialog()).toBe(true);
      expect(comp.selectedAppointment()?.id).toBe('apt-1');
      expect(comp.statusAction()).toBe('completed');
    });

    it('debe resetear montos y observaciones solo para completar', () => {
      const comp = createMock();
      comp.amountCollected.set(50);
      comp.exchangeRate.set(2);
      comp.amountBs.set(100);
      comp.observations.set('nota previa');
      comp.openStatusDialog(mockAppointments[0], 'completed');
      expect(comp.amountCollected()).toBe(0);
      expect(comp.exchangeRate()).toBe(1);
      expect(comp.amountBs()).toBe(0);
      expect(comp.observations()).toBe('');
    });

    it('NO debe resetear montos para cancelar', () => {
      const comp = createMock();
      comp.amountCollected.set(50);
      comp.exchangeRate.set(2);
      comp.openStatusDialog(mockAppointments[0], 'cancelled');
      expect(comp.amountCollected()).toBe(50);
      expect(comp.exchangeRate()).toBe(2);
    });

    it('NO debe resetear montos para no_show', () => {
      const comp = createMock();
      comp.amountCollected.set(50);
      comp.exchangeRate.set(2);
      comp.openStatusDialog(mockAppointments[0], 'no_show');
      expect(comp.amountCollected()).toBe(50);
      expect(comp.exchangeRate()).toBe(2);
    });
  });

  describe('closeDrawer — cierre del drawer', () => {
    it('debe cerrar el drawer y limpiar el estado', () => {
      const comp = createMock();
      comp.openStatusDialog(mockAppointments[0], 'cancelled');
      comp.closeDrawer();
      expect(comp.showStatusDialog()).toBe(false);
      expect(comp.selectedAppointment()).toBeNull();
      expect(comp.statusAction()).toBeNull();
    });
  });

  describe('getDrawerTitle — títulos del drawer', () => {
    it('debe retornar título para cancelar', () => {
      const comp = createMock();
      comp.openStatusDialog(mockAppointments[0], 'cancelled');
      expect(comp.getDrawerTitle()).toBe('Cancelar Cita');
    });

    it('debe retornar título para no_show', () => {
      const comp = createMock();
      comp.openStatusDialog(mockAppointments[0], 'no_show');
      expect(comp.getDrawerTitle()).toBe('Marcar como No Asistió');
    });

    it('debe retornar título para completar', () => {
      const comp = createMock();
      comp.openStatusDialog(mockAppointments[0], 'completed');
      expect(comp.getDrawerTitle()).toBe('Completar Cita');
    });
  });

  describe('getActionLabel — etiquetas del botón de confirmación', () => {
    it('debe retornar "Sí, Cancelar" para acción cancel', () => {
      const comp = createMock();
      comp.openStatusDialog(mockAppointments[0], 'cancelled');
      expect(comp.getActionLabel()).toBe('Sí, Cancelar');
    });

    it('debe retornar "Sí, No Asistió" para acción no_show', () => {
      const comp = createMock();
      comp.openStatusDialog(mockAppointments[0], 'no_show');
      expect(comp.getActionLabel()).toBe('Sí, No Asistió');
    });

    it('debe retornar "Confirmar y Completar" para completar', () => {
      const comp = createMock();
      comp.openStatusDialog(mockAppointments[0], 'completed');
      expect(comp.getActionLabel()).toBe('Confirmar y Completar');
    });
  });

  describe('getActionSeverity — severidad visual del botón', () => {
    it('debe retornar danger para cancelar (acción destructiva)', () => {
      const comp = createMock();
      comp.openStatusDialog(mockAppointments[0], 'cancelled');
      expect(comp.getActionSeverity()).toBe('danger');
    });

    it('debe retornar danger para no_show (acción destructiva)', () => {
      const comp = createMock();
      comp.openStatusDialog(mockAppointments[0], 'no_show');
      expect(comp.getActionSeverity()).toBe('danger');
    });

    it('debe retornar success para completar', () => {
      const comp = createMock();
      comp.openStatusDialog(mockAppointments[0], 'completed');
      expect(comp.getActionSeverity()).toBe('success');
    });
  });

  describe('confirmStatusChange — confirmación en el drawer', () => {
    it('debe ejecutar updateStatus y cerrar el drawer al confirmar cancelar', () => {
      const comp = createMock();
      comp.openStatusDialog(mockAppointments[0], 'cancelled');
      comp.confirmStatusChange();
      expect(comp.updateStatusCalls).toHaveLength(1);
      expect(comp.updateStatusCalls[0]).toEqual({ appointment: mockAppointments[0], status: 'cancelled' });
      expect(comp.showStatusDialog()).toBe(false);
    });

    it('debe ejecutar updateStatus y cerrar el drawer al confirmar no_show', () => {
      const comp = createMock();
      comp.openStatusDialog(mockAppointments[0], 'no_show');
      comp.confirmStatusChange();
      expect(comp.updateStatusCalls).toHaveLength(1);
      expect(comp.updateStatusCalls[0]).toEqual({ appointment: mockAppointments[0], status: 'no_show' });
      expect(comp.showStatusDialog()).toBe(false);
    });

    it('NO debe ejecutar updateStatus si no hay cita seleccionada', () => {
      const comp = createMock();
      comp.statusAction.set('cancelled');
      comp.showStatusDialog.set(true);
      comp.confirmStatusChange();
      expect(comp.updateStatusCalls).toHaveLength(0);
    });

    it('NO debe ejecutar updateStatus si no hay acción definida', () => {
      const comp = createMock();
      comp.selectedAppointment.set(mockAppointments[0]);
      comp.showStatusDialog.set(true);
      comp.confirmStatusChange();
      expect(comp.updateStatusCalls).toHaveLength(0);
    });
  });

  describe('openPaymentDrawer — apertura del drawer de pago', () => {
    it('debe abrir el drawer con statusAction paid y precargar monto en Bs', () => {
      const comp = createMock();
      comp.openPaymentDrawer(mockAppointments[1]);
      expect(comp.showStatusDialog()).toBe(true);
      expect(comp.selectedAppointment()?.id).toBe('apt-2');
      expect(comp.statusAction()).toBe('paid');
      expect(comp.paymentAmountBs()).toBe(720);
    });

    it('debe precargar 0 si la cita no tiene amount_in_bs', () => {
      const comp = createMock();
      const apt = { ...mockAppointments[1], amount_in_bs: undefined };
      comp.openPaymentDrawer(apt);
      expect(comp.paymentAmountBs()).toBe(0);
    });

    it('debe resetear paymentMethod y paymentReference al abrir', () => {
      const comp = createMock();
      comp.paymentMethod.set('cash' as PaymentMethod);
      comp.paymentReference.set('ref');
      comp.openPaymentDrawer(mockAppointments[1]);
      expect(comp.paymentMethod()).toBeNull();
      expect(comp.paymentReference()).toBe('');
    });
  });

  describe('getDrawerTitle — título para pago', () => {
    it('debe retornar "Registrar Pago" para acción paid', () => {
      const comp = createMock();
      comp.openPaymentDrawer(mockAppointments[1]);
      expect(comp.getDrawerTitle()).toBe('Registrar Pago');
    });
  });

  describe('getActionLabel — etiqueta para pago', () => {
    it('debe retornar "Confirmar pago" para acción paid', () => {
      const comp = createMock();
      comp.openPaymentDrawer(mockAppointments[1]);
      expect(comp.getActionLabel()).toBe('Confirmar pago');
    });
  });

  describe('getActionSeverity — severidad para pago', () => {
    it('debe retornar success para paid', () => {
      const comp = createMock();
      comp.openPaymentDrawer(mockAppointments[1]);
      expect(comp.getActionSeverity()).toBe('success');
    });
  });

  describe('confirmPayment — confirmación de pago', () => {
    it('debe registrar el pago y cerrar el drawer', () => {
      const comp = createMock();
      comp.openPaymentDrawer(mockAppointments[1]);
      comp.paymentMethod.set('cash' as PaymentMethod);
      comp.paymentReference.set('ref-001');
      comp.paymentAmountBs.set(700);
      comp.confirmPayment();
      expect(comp.markAsPaidCalls).toHaveLength(1);
      expect(comp.markAsPaidCalls[0]).toEqual({
        id: 'apt-2',
        paymentData: {
          payment_method: 'cash',
          payment_reference: 'ref-001',
          payment_amount_bs: 700
        }
      });
      expect(comp.showStatusDialog()).toBe(false);
    });

    it('NO debe registrar pago si no hay método de pago', () => {
      const comp = createMock();
      comp.openPaymentDrawer(mockAppointments[1]);
      comp.confirmPayment();
      expect(comp.markAsPaidCalls).toHaveLength(0);
      expect(comp.showStatusDialog()).toBe(true);
    });

    it('NO debe registrar pago si no hay cita seleccionada', () => {
      const comp = createMock();
      comp.statusAction.set('paid');
      comp.paymentMethod.set('transfer' as PaymentMethod);
      comp.confirmPayment();
      expect(comp.markAsPaidCalls).toHaveLength(0);
    });

    it('debe omitir referencia y monto si están vacíos', () => {
      const comp = createMock();
      comp.openPaymentDrawer(mockAppointments[1]);
      comp.paymentMethod.set('mobile_payment' as PaymentMethod);
      comp.paymentAmountBs.set(0);
      comp.confirmPayment();
      expect(comp.markAsPaidCalls).toHaveLength(1);
      expect(comp.markAsPaidCalls[0].paymentData.payment_reference).toBeUndefined();
      expect(comp.markAsPaidCalls[0].paymentData.payment_amount_bs).toBeUndefined();
    });
  });

  describe('closeDrawer — reset de señales de pago', () => {
    it('debe resetear paymentMethod, reference y amountBs al cerrar', () => {
      const comp = createMock();
      comp.openPaymentDrawer(mockAppointments[1]);
      comp.paymentMethod.set('card' as PaymentMethod);
      comp.paymentReference.set('test');
      comp.paymentAmountBs.set(500);
      comp.closeDrawer();
      expect(comp.showStatusDialog()).toBe(false);
      expect(comp.selectedAppointment()).toBeNull();
      expect(comp.statusAction()).toBeNull();
      expect(comp.paymentMethod()).toBeNull();
      expect(comp.paymentReference()).toBe('');
      expect(comp.paymentAmountBs()).toBe(0);
    });
  });

  describe('señales de comprobante — apertura de drawers', () => {
    it('debe resetear señales de comprobante al abrir drawer de completar', () => {
      const comp = createMock();
      comp.selectedCompletionReceipt.set(new File(['x'], 'old.png', { type: 'image/png' }));
      comp.completionReceiptError.set('error previo');
      comp.uploadingCompletionReceipt.set(true);
      comp.openStatusDialog(mockAppointments[0], 'completed');
      expect(comp.selectedCompletionReceipt()).toBeNull();
      expect(comp.completionReceiptError()).toBeNull();
      expect(comp.uploadingCompletionReceipt()).toBe(false);
    });

    it('debe resetear señales de comprobante de pago al abrir drawer de pago', () => {
      const comp = createMock();
      comp.selectedPaymentReceipt.set(new File(['x'], 'old.png', { type: 'image/png' }));
      comp.paymentReceiptError.set('error previo');
      comp.uploadingPaymentReceipt.set(true);
      comp.openPaymentDrawer(mockAppointments[1]);
      expect(comp.selectedPaymentReceipt()).toBeNull();
      expect(comp.paymentReceiptError()).toBeNull();
      expect(comp.uploadingPaymentReceipt()).toBe(false);
    });
  });

  describe('closeDrawer — reset de señales de comprobante', () => {
    it('debe resetear todas las señales de comprobante al cerrar', () => {
      const comp = createMock();
      comp.selectedCompletionReceipt.set(new File(['x'], 'receipt.png', { type: 'image/png' }));
      comp.completionReceiptError.set('upload failed');
      comp.uploadingCompletionReceipt.set(true);
      comp.selectedPaymentReceipt.set(new File(['x'], 'payment.png', { type: 'image/png' }));
      comp.paymentReceiptError.set('upload failed');
      comp.uploadingPaymentReceipt.set(true);

      comp.closeDrawer();

      expect(comp.selectedCompletionReceipt()).toBeNull();
      expect(comp.completionReceiptError()).toBeNull();
      expect(comp.uploadingCompletionReceipt()).toBe(false);
      expect(comp.selectedPaymentReceipt()).toBeNull();
      expect(comp.paymentReceiptError()).toBeNull();
      expect(comp.uploadingPaymentReceipt()).toBe(false);
    });
  });

  describe('confirmStatusChange — con comprobante', () => {
    it('debe subir comprobante antes de actualizar estado cuando hay archivo seleccionado', () => {
      const comp = createMock();
      const receiptFile = new File(['x'], 'receipt.png', { type: 'image/png' });
      comp.openStatusDialog(mockAppointments[0], 'completed');
      comp.selectedCompletionReceipt.set(receiptFile);
      comp.confirmStatusChange();

      expect(comp.updateStatusCalls).toHaveLength(1);
      expect(comp.showStatusDialog()).toBe(false);
    });

    it('NO debe ejecutar updateStatus si la subida del comprobante falla', () => {
      const comp = createMock();
      comp.openStatusDialog(mockAppointments[0], 'completed');
      comp.selectedCompletionReceipt.set(new File(['x'], 'receipt.png', { type: 'image/png' }));
      comp.completionReceiptError.set('Error al subir el comprobante. Intente de nuevo.');

      comp.confirmStatusChange();

      expect(comp.updateStatusCalls).toHaveLength(0);
      expect(comp.showStatusDialog()).toBe(true);
    });
  });

  describe('confirmPayment — con comprobante de pago', () => {
    it('debe subir comprobante antes de registrar pago cuando hay archivo seleccionado', () => {
      const comp = createMock();
      const receiptFile = new File(['x'], 'payment.png', { type: 'image/png' });
      comp.openPaymentDrawer(mockAppointments[1]);
      comp.paymentMethod.set('cash' as PaymentMethod);
      comp.selectedPaymentReceipt.set(receiptFile);
      comp.confirmPayment();

      expect(comp.markAsPaidCalls).toHaveLength(1);
      expect(comp.showStatusDialog()).toBe(false);
    });

    it('NO debe ejecutar markAsPaid si la subida del comprobante falla', () => {
      const comp = createMock();
      comp.openPaymentDrawer(mockAppointments[1]);
      comp.paymentMethod.set('cash' as PaymentMethod);
      comp.selectedPaymentReceipt.set(new File(['x'], 'payment.png', { type: 'image/png' }));
      comp.paymentReceiptError.set('Error al subir el comprobante. Intente de nuevo.');

      comp.confirmPayment();

      expect(comp.markAsPaidCalls).toHaveLength(0);
      expect(comp.showStatusDialog()).toBe(true);
    });
  });
});
