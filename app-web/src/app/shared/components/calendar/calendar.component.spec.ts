import { TestBed } from '@angular/core/testing';
import { SharedCalendarComponent, AppointmentWithService } from './calendar.component';

describe('SharedCalendarComponent', () => {
  let component: SharedCalendarComponent;

  const mockAppointments: AppointmentWithService[] = [
    {
      id: 'apt-1',
      company_id: 'company-1',
      employee_id: 'emp-1',
      service_id: 'srv-1',
      client_name: 'María García',
      client_phone: '12345678',
      client_email: 'maria@test.com',
      appointment_date: '2026-03-15',
      appointment_time: '10:00',
      status: 'completed',
      amount_collected: 25,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      service: { name: 'Corte de cabello' }
    },
    {
      id: 'apt-2',
      company_id: 'company-1',
      employee_id: 'emp-1',
      service_id: 'srv-2',
      client_name: 'Carlos López',
      client_phone: '87654321',
      appointment_date: '2026-03-15',
      appointment_time: '11:30',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      service: { name: 'Manicure' }
    },
    {
      id: 'apt-3',
      company_id: 'company-1',
      employee_id: 'emp-1',
      service_id: 'srv-3',
      client_name: 'Ana Rodríguez',
      client_phone: '55555555',
      appointment_date: '2026-03-16',
      appointment_time: '15:00',
      status: 'cancelled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      service: { name: 'Tintura' }
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    component = TestBed.createComponent(SharedCalendarComponent).componentInstance;
  });

  describe('component initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should have default view as dayGridMonth', () => {
      expect(component.initialView()).toBe('dayGridMonth');
    });

    it('should have empty appointments by default', () => {
      expect(component.appointments()).toEqual([]);
    });

    it('should have no selected date initially', () => {
      expect(component.selectedDate()).toBeNull();
    });
  });

  describe('view toggling', () => {
    it('should switch to timeGridWeek', () => {
      component.currentView.set('dayGridMonth');
      component.currentView.set('timeGridWeek');
      expect(component.currentView()).toBe('timeGridWeek');
    });

    it('should switch back to dayGridMonth', () => {
      component.currentView.set('timeGridWeek');
      component.currentView.set('dayGridMonth');
      expect(component.currentView()).toBe('dayGridMonth');
    });
  });

  describe('status helper methods', () => {
    it('should return correct color for completed status', () => {
      expect(component.getStatusColor('completed')).toBe('#9DC183');
    });

    it('should return correct color for pending status', () => {
      expect(component.getStatusColor('pending')).toBe('#F4D03F');
    });

    it('should return correct color for cancelled status', () => {
      expect(component.getStatusColor('cancelled')).toBe('#E74C3C');
    });

    it('should return correct color for no_show status', () => {
      expect(component.getStatusColor('no_show')).toBe('#95A5A6');
    });

    it('should return default color for unknown status', () => {
      expect(component.getStatusColor('unknown')).toBe('#3498DB');
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
  });

  describe('format methods', () => {
    it('should format time correctly', () => {
      expect(component.formatTime('10:00')).toBe('10:00');
      expect(component.formatTime('14:30')).toBe('14:30');
    });

    it('should format date in Spanish', () => {
      const date = new Date('2026-03-15T12:00:00');
      const formatted = component.formatDate(date);
      expect(formatted).toContain('marzo');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2026');
    });
  });

  describe('event emission', () => {
    it('should call dateClicked output when handleDateClick is invoked', () => {
      const spy = jest.spyOn(component.dateClicked, 'emit');
      component.handleDateClick({ dateStr: '2026-03-15' });
      expect(spy).toHaveBeenCalled();
    });

    it('should set selectedDate when handleDateClick is invoked', () => {
      component.handleDateClick({ dateStr: '2026-03-15' });
      expect(component.selectedDate()).not.toBeNull();
    });

    it('should emit appointmentClicked when handleEventClick finds appointment', () => {
      const spy = jest.spyOn(component.appointmentClicked, 'emit');
      component.handleEventClick({ event: { id: 'apt-1' } });
    });
  });

  describe('calendarOptions computed', () => {
    it('should have valid calendarOptions structure', () => {
      const options = component.calendarOptions();
      expect(options).toBeDefined();
      expect(options.plugins).toBeDefined();
      expect(Array.isArray(options.plugins)).toBe(true);
    });
  });
});
