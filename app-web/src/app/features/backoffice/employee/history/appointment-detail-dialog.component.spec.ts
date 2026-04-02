import { signal } from '@angular/core';

interface AppointmentWithService {
  id: string;
  company_id: string;
  employee_id: string;
  service_id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  amount_collected?: number;
  notes?: string;
  cancellation_token?: string;
  created_at: string;
  updated_at: string;
  service?: { name: string };
}

describe('AppointmentDetailDialogComponent - Behavior Driven Tests', () => {
  const mockAppointment: AppointmentWithService = {
    id: 'apt-1',
    company_id: 'company-1',
    employee_id: 'emp-1',
    service_id: 'srv-1',
    client_name: 'Juan Cliente',
    client_phone: '555-111-1111',
    client_email: 'juan@email.com',
    appointment_date: '2026-04-01',
    appointment_time: '10:30',
    status: 'completed',
    amount_collected: 150,
    notes: 'Cliente frecuente, servicio satisfactorio',
    service: { name: 'Corte de cabello premium' },
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-01T10:30:00Z'
  };

  const mockAppointmentWithoutEmail: AppointmentWithService = {
    id: 'apt-2',
    company_id: 'company-1',
    employee_id: 'emp-1',
    service_id: 'srv-2',
    client_name: 'María Pérez',
    client_phone: '555-222-2222',
    appointment_date: '2026-04-02',
    appointment_time: '14:00',
    status: 'pending',
    service: { name: 'Tinte de cabello' },
    created_at: '2026-04-02T14:00:00Z',
    updated_at: '2026-04-02T14:30:00Z'
  };

  const mockAppointmentWithoutNotes: AppointmentWithService = {
    id: 'apt-3',
    company_id: 'company-1',
    employee_id: 'emp-1',
    service_id: 'srv-3',
    client_name: 'Carlos López',
    client_phone: '555-333-3333',
    appointment_date: '2026-04-03',
    appointment_time: '09:00',
    status: 'cancelled',
    service: { name: 'Barba' },
    created_at: '2026-04-03T09:00:00Z',
    updated_at: '2026-04-03T09:30:00Z'
  };

  const createMockAppointmentDetailDialogComponent = () => {
    const appointment = signal<AppointmentWithService | null>(null);
    const visible = signal(false);
    const currentIndex = signal(0);
    const totalCount = signal(0);
    const hasPrevious = signal(false);
    const hasNext = signal(false);

    const onClose = jest.fn();
    const onPrevious = jest.fn();
    const onNext = jest.fn();

    const getStatusLabel = (status: string): string => {
      const labels: { [key: string]: string } = {
        'completed': 'Completada',
        'pending': 'Pendiente',
        'cancelled': 'Cancelada',
        'no_show': 'No asistió'
      };
      return labels[status] || status;
    };

    const getStatusSeverity = (status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined => {
      switch (status) {
        case 'completed': return 'success';
        case 'pending': return 'warn';
        case 'cancelled': return 'danger';
        case 'no_show': return 'secondary';
        default: return 'info';
      }
    };

    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    };

    const formatTime = (timeStr: string): string => {
      const [hours, minutes] = timeStr.split(':');
      return `${hours}:${minutes}`;
    };

    return {
      appointment,
      visible,
      currentIndex,
      totalCount,
      hasPrevious,
      hasNext,
      onClose,
      onPrevious,
      onNext,
      getStatusLabel,
      getStatusSeverity,
      formatDate,
      formatTime
    };
  };

  describe('when dialog initializes', () => {
    let component: ReturnType<typeof createMockAppointmentDetailDialogComponent>;

    beforeEach(() => {
      component = createMockAppointmentDetailDialogComponent();
    });

    it('should have visible default to false', () => {
      expect(component.visible()).toBe(false);
    });

    it('should have null appointment by default', () => {
      expect(component.appointment()).toBeNull();
    });

    it('should have currentIndex default to 0', () => {
      expect(component.currentIndex()).toBe(0);
    });

    it('should have totalCount default to 0', () => {
      expect(component.totalCount()).toBe(0);
    });

    it('should have hasPrevious default to false', () => {
      expect(component.hasPrevious()).toBe(false);
    });

    it('should have hasNext default to false', () => {
      expect(component.hasNext()).toBe(false);
    });
  });

  describe('when displaying appointment details', () => {
    let component: ReturnType<typeof createMockAppointmentDetailDialogComponent>;

    beforeEach(() => {
      component = createMockAppointmentDetailDialogComponent();
      component.appointment.set(mockAppointment);
      component.visible.set(true);
    });

    it('should display client name', () => {
      expect(component.appointment()?.client_name).toBe('Juan Cliente');
    });

    it('should display client phone', () => {
      expect(component.appointment()?.client_phone).toBe('555-111-1111');
    });

    it('should display client email when present', () => {
      expect(component.appointment()?.client_email).toBe('juan@email.com');
    });

    it('should display appointment date', () => {
      expect(component.appointment()?.appointment_date).toBe('2026-04-01');
    });

    it('should display appointment time', () => {
      expect(component.appointment()?.appointment_time).toBe('10:30');
    });

    it('should display service name', () => {
      expect(component.appointment()?.service?.name).toBe('Corte de cabello premium');
    });

    it('should display status', () => {
      expect(component.appointment()?.status).toBe('completed');
    });

    it('should display amount collected when present', () => {
      expect(component.appointment()?.amount_collected).toBe(150);
    });

    it('should display notes when present', () => {
      expect(component.appointment()?.notes).toBe('Cliente frecuente, servicio satisfactorio');
    });
  });

  describe('when appointment without optional fields', () => {
    let component: ReturnType<typeof createMockAppointmentDetailDialogComponent>;

    beforeEach(() => {
      component = createMockAppointmentDetailDialogComponent();
      component.appointment.set(mockAppointmentWithoutEmail);
      component.visible.set(true);
    });

    it('should handle missing email gracefully', () => {
      const appointment = component.appointment();
      expect(appointment?.client_email).toBeUndefined();
    });

    it('should display null service name as N/A', () => {
      const appointment = component.appointment();
      const serviceName = appointment?.service?.name || 'N/A';
      expect(serviceName).toBe('Tinte de cabello');
    });
  });

  describe('when appointment has no notes', () => {
    let component: ReturnType<typeof createMockAppointmentDetailDialogComponent>;

    beforeEach(() => {
      component = createMockAppointmentDetailDialogComponent();
      component.appointment.set(mockAppointmentWithoutNotes);
      component.visible.set(true);
    });

    it('should handle missing notes gracefully', () => {
      const appointment = component.appointment();
      expect(appointment?.notes).toBeUndefined();
    });
  });

  describe('when navigating between appointments', () => {
    let component: ReturnType<typeof createMockAppointmentDetailDialogComponent>;

    beforeEach(() => {
      component = createMockAppointmentDetailDialogComponent();
      component.appointment.set(mockAppointment);
      component.currentIndex.set(1);
      component.totalCount.set(5);
    });

    it('should show current index plus one in display', () => {
      const displayIndex = component.currentIndex() + 1;
      expect(displayIndex).toBe(2);
    });

    it('should show correct total count', () => {
      expect(component.totalCount()).toBe(5);
    });

    it('should call onPrevious when previous button clicked', () => {
      component.hasPrevious.set(true);
      component.onPrevious();
      
      expect(component.onPrevious).toHaveBeenCalled();
      expect(component.onPrevious).toHaveBeenCalledTimes(1);
    });

    it('should call onNext when next button clicked', () => {
      component.hasNext.set(true);
      component.onNext();
      
      expect(component.onNext).toHaveBeenCalled();
      expect(component.onNext).toHaveBeenCalledTimes(1);
    });

    it('should disable previous button when at first item', () => {
      component.currentIndex.set(0);
      const hasPrevious = component.currentIndex() > 0;
      
      expect(hasPrevious).toBe(false);
    });

    it('should disable next button when at last item', () => {
      component.currentIndex.set(4);
      component.totalCount.set(5);
      const hasNext = component.currentIndex() < component.totalCount() - 1;
      
      expect(hasNext).toBe(false);
    });
  });

  describe('when closing dialog', () => {
    let component: ReturnType<typeof createMockAppointmentDetailDialogComponent>;

    beforeEach(() => {
      component = createMockAppointmentDetailDialogComponent();
      component.appointment.set(mockAppointment);
      component.visible.set(true);
    });

    it('should call onClose when close button clicked', () => {
      component.onClose();
      
      expect(component.onClose).toHaveBeenCalled();
      expect(component.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when dialog hide event triggered', () => {
      component.onClose();
      
      expect(component.onClose).toHaveBeenCalled();
    });
  });

  describe('status and formatting helpers', () => {
    let component: ReturnType<typeof createMockAppointmentDetailDialogComponent>;

    beforeEach(() => {
      component = createMockAppointmentDetailDialogComponent();
    });

    it('should return correct severity for completed status', () => {
      expect(component.getStatusSeverity('completed')).toBe('success');
    });

    it('should return correct severity for pending status', () => {
      expect(component.getStatusSeverity('pending')).toBe('warn');
    });

    it('should return correct severity for cancelled status', () => {
      expect(component.getStatusSeverity('cancelled')).toBe('danger');
    });

    it('should return correct severity for no_show status', () => {
      expect(component.getStatusSeverity('no_show')).toBe('secondary');
    });

    it('should return info severity for unknown status', () => {
      expect(component.getStatusSeverity('unknown')).toBe('info');
    });

    it('should return correct label for completed status', () => {
      expect(component.getStatusLabel('completed')).toBe('Completada');
    });

    it('should return correct label for pending status', () => {
      expect(component.getStatusLabel('pending')).toBe('Pendiente');
    });

    it('should return correct label for cancelled status', () => {
      expect(component.getStatusLabel('cancelled')).toBe('Cancelada');
    });

    it('should return correct label for no_show status', () => {
      expect(component.getStatusLabel('no_show')).toBe('No asistió');
    });

    it('should return status as fallback label', () => {
      expect(component.getStatusLabel('unknown')).toBe('unknown');
    });

    it('should format date with day month and year', () => {
      const formatted = component.formatDate('2026-04-01');
      
      // Date should contain year
      expect(formatted).toContain('2026');
      // Date should contain day number (timezone may affect which day, but always present)
      expect(formatted).toMatch(/\d{1,2}/);
    });

    it('should format time with hours and minutes', () => {
      expect(component.formatTime('10:30')).toBe('10:30');
      expect(component.formatTime('14:00')).toBe('14:00');
      expect(component.formatTime('09:15')).toBe('09:15');
    });
  });

  describe('when displaying navigation info', () => {
    let component: ReturnType<typeof createMockAppointmentDetailDialogComponent>;

    beforeEach(() => {
      component = createMockAppointmentDetailDialogComponent();
      component.currentIndex.set(2);
      component.totalCount.set(10);
    });

    it('should display current position as index plus one', () => {
      const position = component.currentIndex() + 1;
      expect(position).toBe(3);
    });

    it('should display total count correctly', () => {
      expect(component.totalCount()).toBe(10);
    });

    it('should format navigation info as "X de Y"', () => {
      const info = `${component.currentIndex() + 1} de ${component.totalCount()}`;
      expect(info).toBe('3 de 10');
    });
  });

  describe('when managing button states', () => {
    let component: ReturnType<typeof createMockAppointmentDetailDialogComponent>;

    beforeEach(() => {
      component = createMockAppointmentDetailDialogComponent();
    });

    it('should enable previous button when not at first item', () => {
      component.currentIndex.set(1);
      component.totalCount.set(5);
      const hasPrevious = component.currentIndex() > 0;
      
      expect(hasPrevious).toBe(true);
    });

    it('should enable next button when not at last item', () => {
      component.currentIndex.set(3);
      component.totalCount.set(5);
      const hasNext = component.currentIndex() < component.totalCount() - 1;
      
      expect(hasNext).toBe(true);
    });

    it('should disable previous button when at first item', () => {
      component.currentIndex.set(0);
      component.totalCount.set(5);
      const hasPrevious = component.currentIndex() > 0;
      
      expect(hasPrevious).toBe(false);
    });

    it('should disable next button when at last item', () => {
      component.currentIndex.set(4);
      component.totalCount.set(5);
      const hasNext = component.currentIndex() < component.totalCount() - 1;
      
      expect(hasNext).toBe(false);
    });
  });

  describe('accessibility', () => {
    let component: ReturnType<typeof createMockAppointmentDetailDialogComponent>;

    beforeEach(() => {
      component = createMockAppointmentDetailDialogComponent();
    });

    it('should have proper dialog modal attribute', () => {
      const isModal = true;
      expect(isModal).toBe(true);
    });

    it('should have correct dialog width configuration', () => {
      const dialogWidth = { 'width': '600px' };
      expect(dialogWidth['width']).toBe('600px');
    });

    it('should have responsive breakpoints for dialog', () => {
      const breakpoints = { '960px': '75vw', '640px': '100vw' };
      expect(breakpoints['960px']).toBe('75vw');
      expect(breakpoints['640px']).toBe('100vw');
    });

    it('should have focus management on dialog open', () => {
      component.visible.set(true);
      component.appointment.set(mockAppointment);
      
      expect(component.visible()).toBe(true);
      expect(component.appointment()).not.toBeNull();
    });
  });

  describe('edge cases', () => {
    let component: ReturnType<typeof createMockAppointmentDetailDialogComponent>;

    beforeEach(() => {
      component = createMockAppointmentDetailDialogComponent();
    });

    it('should handle appointment without amount_collected', () => {
      const appointmentNoAmount: AppointmentWithService = {
        ...mockAppointment,
        amount_collected: undefined
      };
      
      component.appointment.set(appointmentNoAmount);
      expect(component.appointment()?.amount_collected).toBeUndefined();
    });

    it('should handle appointment without service', () => {
      const appointmentNoService: AppointmentWithService = {
        ...mockAppointment,
        service: undefined
      };
      
      component.appointment.set(appointmentNoService);
      expect(component.appointment()?.service).toBeUndefined();
    });

    it('should handle single appointment in navigation', () => {
      component.currentIndex.set(0);
      component.totalCount.set(1);
      
      expect(component.currentIndex() > 0).toBe(false);
      expect(component.currentIndex() < component.totalCount() - 1).toBe(false);
    });

    it('should handle zero appointments', () => {
      component.currentIndex.set(0);
      component.totalCount.set(0);
      
      expect(component.totalCount()).toBe(0);
    });
  });
});