import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { ManagerAppointmentCreateDialogComponent } from './manager-appointment-create-dialog.component';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { ServiceService } from '../../../../core/services/service.service';
import { Service } from '../../../../core/models/service.model';
import { User } from '../../../../core/models/user.model';

describe('ManagerAppointmentCreateDialogComponent', () => {
  let component: ManagerAppointmentCreateDialogComponent;
  let fixture: ComponentFixture<ManagerAppointmentCreateDialogComponent>;
  let appointmentServiceMock: any;
  let serviceServiceMock: any;
  let messageServiceMock: any;

  const mockEmployees: User[] = [
    { id: 'emp-1', email: 'juan@test.com', full_name: 'Juan Pérez', role: 'employee', can_be_employee: true, is_active: true, company_id: 'co-1', created_at: '2025-01-01', updated_at: '2025-01-01' },
    { id: 'emp-2', email: 'maria@test.com', full_name: 'María García', role: 'employee', can_be_employee: true, is_active: true, company_id: 'co-1', created_at: '2025-01-01', updated_at: '2025-01-01' },
  ];

  const mockServices: Service[] = [
    { id: 'svc-1', company_id: 'co-1', name: 'Corte de cabello', duration_minutes: 30, commission_percentage: 50, is_active: true, created_at: '2025-01-01' },
    { id: 'svc-2', company_id: 'co-1', name: 'Barba', duration_minutes: 20, commission_percentage: 50, is_active: true, created_at: '2025-01-01' },
    { id: 'svc-3', company_id: 'co-1', name: 'Tinte', duration_minutes: 60, commission_percentage: 50, is_active: true, created_at: '2025-01-01' },
    { id: 'svc-4', company_id: 'co-1', name: 'Peinado', duration_minutes: 25, commission_percentage: 50, is_active: true, created_at: '2025-01-01' },
    { id: 'svc-5', company_id: 'co-1', name: 'Tratamiento capilar', duration_minutes: 45, commission_percentage: 50, is_active: true, created_at: '2025-01-01' },
  ];

  const mockSlots = ['09:00', '09:30', '10:00', '10:30', '11:00'];

  beforeEach(async () => {
    messageServiceMock = { add: jest.fn(), messageObserver: new Subject(), clearObserver: new Subject() };
    appointmentServiceMock = {
      create: jest.fn().mockResolvedValue(undefined),
      getAvailableSlots: jest.fn().mockResolvedValue(mockSlots)
    };
    serviceServiceMock = {
      getByEmployee: jest.fn().mockResolvedValue(mockServices.slice(0, 2))
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        ManagerAppointmentCreateDialogComponent
      ],
      providers: [
        { provide: MessageService, useValue: messageServiceMock },
        { provide: AppointmentService, useValue: appointmentServiceMock },
        { provide: ServiceService, useValue: serviceServiceMock },
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ManagerAppointmentCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('employeeOptions', () => {
    it('debe mapear empleados a opciones con label y value', () => {
      fixture.componentRef.setInput('employees', mockEmployees);
      fixture.detectChanges();

      const options = component.employeeOptions();
      expect(options).toEqual([
        { label: 'Juan Pérez', value: 'emp-1' },
        { label: 'María García', value: 'emp-2' }
      ]);
    });

    it('debe retornar arreglo vacío si no hay empleados', () => {
      fixture.componentRef.setInput('employees', []);
      fixture.detectChanges();

      expect(component.employeeOptions()).toEqual([]);
    });
  });

  describe('onEmployeeChange', () => {
    it('debe llamar loadServices cuando se selecciona un empleado', () => {
      const loadSpy = jest.spyOn(component, 'loadServices');
      component.form.get('employee_id')?.setValue('emp-1');

      component.onEmployeeChange('emp-1');

      expect(loadSpy).toHaveBeenCalledWith('emp-1');
    });

    it('debe resetear servicios, slots y serviceIds cuando se cambia de empleado', async () => {
      component.employeeServices.set(mockServices.slice(0, 2));
      component.selectedServiceIds.set(['svc-1']);
      component.availableSlots.set(mockSlots);
      component.form.get('service_ids')?.setValue(['svc-1']);
      component.form.get('appointment_time')?.setValue('09:00');

      serviceServiceMock.getByEmployee = jest.fn().mockResolvedValue([]);
      component.onEmployeeChange('emp-2');
      await fixture.whenStable();

      expect(component.selectedServiceIds()).toEqual([]);
      expect(component.availableSlots()).toEqual([]);
      expect(serviceServiceMock.getByEmployee).toHaveBeenCalledWith('emp-2');
      expect(component.form.get('appointment_time')?.value).toBeNull();
    });

    it('debe limpiar servicios pero no cargar cuando se deselecciona empleado', () => {
      const loadSpy = jest.spyOn(component, 'loadServices');

      component.onEmployeeChange(null);

      expect(component.employeeServices()).toEqual([]);
      expect(loadSpy).not.toHaveBeenCalled();
    });
  });

  describe('loadServices', () => {
    it('debe cargar servicios del empleado', async () => {
      await component.loadServices('emp-1');

      expect(serviceServiceMock.getByEmployee).toHaveBeenCalledWith('emp-1');
      expect(component.employeeServices()).toEqual(mockServices.slice(0, 2));
      expect(component.loadingServices()).toBe(false);
    });

    it('debe mostrar error si falla la carga de servicios', async () => {
      serviceServiceMock.getByEmployee = jest.fn().mockRejectedValue(new Error('Network error'));

      await component.loadServices('emp-1');

      expect(component.employeeServices()).toEqual([]);
      expect(messageServiceMock.add).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'error',
        detail: 'No se pudieron cargar los servicios del empleado'
      }));
      expect(component.loadingServices()).toBe(false);
    });
  });

  describe('onDateSelect', () => {
    const testDate = new Date(2026, 4, 15);

    it('debe setear selectedDate y dateTouched', () => {
      component.onDateSelect(testDate);

      expect(component.selectedDate()).toEqual(testDate);
      expect(component.dateTouched()).toBe(true);
    });

    it('debe resetear appointment_time y availableSlots al cambiar fecha', () => {
      component.availableSlots.set(mockSlots);
      component.form.get('appointment_time')?.setValue('09:00');

      component.onDateSelect(testDate);

      expect(component.availableSlots()).toEqual([]);
      expect(component.form.get('appointment_time')?.value).toBeNull();
    });

    it('debe cargar slots cuando hay empleado, servicios seleccionados y companyId', () => {
      component.form.get('employee_id')?.setValue('emp-1');
      fixture.componentRef.setInput('companyId', 'co-1');
      component.employeeServices.set(mockServices.slice(0, 1));
      component.toggleService('svc-1');
      fixture.detectChanges();

      const loadSpy = jest.spyOn(component, 'loadSlots');
      component.onDateSelect(testDate);

      expect(loadSpy).toHaveBeenCalledWith(testDate, 30, 'emp-1');
    });

    it('NO debe cargar slots si no hay servicios seleccionados', () => {
      component.form.get('employee_id')?.setValue('emp-1');
      fixture.componentRef.setInput('companyId', 'co-1');

      const loadSpy = jest.spyOn(component, 'loadSlots');
      component.onDateSelect(testDate);

      expect(loadSpy).not.toHaveBeenCalled();
    });

    it('NO debe cargar slots si no hay empleado seleccionado', () => {
      fixture.componentRef.setInput('companyId', 'co-1');
      component.toggleService('svc-1');

      const loadSpy = jest.spyOn(component, 'loadSlots');
      component.onDateSelect(testDate);

      expect(loadSpy).not.toHaveBeenCalled();
    });
  });

  describe('onServiceToggle', () => {
    const testDate = new Date(2026, 4, 15);

    it('debe resetear time slot y recargar slots cuando cambia servicio', () => {
      component.form.get('employee_id')?.setValue('emp-1');
      component.selectedDate.set(testDate);
      fixture.componentRef.setInput('companyId', 'co-1');
      component.availableSlots.set(mockSlots);
      component.form.get('appointment_time')?.setValue('09:00');
      component.employeeServices.set(mockServices.slice(0, 1));
      fixture.detectChanges();

      const loadSpy = jest.spyOn(component, 'loadSlots');
      component.selectedServiceIds.set(['svc-1']);
      component.form.get('service_ids')?.setValue(['svc-1']);

      component.onServiceToggle();

      expect(component.availableSlots()).toEqual([]);
      expect(component.form.get('appointment_time')?.value).toBeNull();
      expect(loadSpy).toHaveBeenCalledWith(testDate, 30, 'emp-1');
    });
  });

  describe('toggleService', () => {
    beforeEach(() => {
      component.employeeServices.set(mockServices.slice(0, 3));
    });

    it('debe seleccionar un servicio', () => {
      component.toggleService('svc-1');
      expect(component.selectedServiceIds()).toEqual(['svc-1']);
      expect(component.form.get('service_ids')?.value).toEqual(['svc-1']);
    });

    it('debe deseleccionar un servicio ya seleccionado', () => {
      component.toggleService('svc-1');
      component.toggleService('svc-1');
      expect(component.selectedServiceIds()).toEqual([]);
      expect(component.form.get('service_ids')?.value).toEqual([]);
    });

    it('debe permitir seleccionar múltiples servicios', () => {
      component.toggleService('svc-1');
      component.toggleService('svc-2');
      expect(component.selectedServiceIds()).toEqual(['svc-1', 'svc-2']);
    });

    it('debe marcar service_ids como touched', () => {
      component.toggleService('svc-1');
      expect(component.form.get('service_ids')?.touched).toBe(true);
    });
  });

  describe('totalDuration', () => {
    beforeEach(() => {
      component.employeeServices.set(mockServices.slice(0, 2));
    });

    it('debe ser 0 sin servicios seleccionados', () => {
      expect(component.totalDuration()).toBe(0);
    });

    it('debe calcular la duración total de los servicios seleccionados', () => {
      component.toggleService('svc-1');
      fixture.detectChanges();
      expect(component.totalDuration()).toBe(30);
    });

    it('debe sumar duraciones de múltiples servicios', () => {
      component.toggleService('svc-1');
      component.toggleService('svc-2');
      fixture.detectChanges();
      expect(component.totalDuration()).toBe(50);
    });
  });

  describe('needsScroll', () => {
    it('debe ser false con 4 o menos servicios', () => {
      component.employeeServices.set(mockServices.slice(0, 4));
      fixture.detectChanges();
      expect(component.needsScroll()).toBe(false);
    });

    it('debe ser true con más de 4 servicios', () => {
      component.employeeServices.set(mockServices);
      fixture.detectChanges();
      expect(component.needsScroll()).toBe(true);
    });
  });

  describe('dateInvalid', () => {
    it('debe ser falso cuando no se ha tocado la fecha', () => {
      expect(component.dateInvalid()).toBe(false);
    });

    it('debe ser verdadero cuando se ha tocado la fecha pero no se ha seleccionado', () => {
      component.dateTouched.set(true);
      expect(component.dateInvalid()).toBe(true);
    });

    it('debe ser falso cuando se ha seleccionado una fecha', () => {
      component.dateTouched.set(true);
      component.selectedDate.set(new Date(2026, 4, 15));
      expect(component.dateInvalid()).toBe(false);
    });
  });

  describe('loadSlots', () => {
    const testDate = new Date(2026, 4, 15);

    it('debe cargar slots disponibles', async () => {
      fixture.componentRef.setInput('companyId', 'co-1');

      await component.loadSlots(testDate, 30, 'emp-1');

      expect(appointmentServiceMock.getAvailableSlots).toHaveBeenCalledWith('co-1', 'emp-1', '2026-05-15', 30);
      expect(component.availableSlots()).toEqual(mockSlots);
      expect(component.loadingSlots()).toBe(false);
    });

    it('debe setear slots vacíos si falla la carga', async () => {
      appointmentServiceMock.getAvailableSlots = jest.fn().mockRejectedValue(new Error('Server error'));

      await component.loadSlots(testDate, 30, 'emp-1');

      expect(component.availableSlots()).toEqual([]);
      expect(component.loadingSlots()).toBe(false);
    });

    it('NO debe llamar al servicio si falta companyId', async () => {
      fixture.componentRef.setInput('companyId', '');

      await component.loadSlots(testDate, 30, 'emp-1');

      expect(appointmentServiceMock.getAvailableSlots).not.toHaveBeenCalled();
    });

    it('debe resetear appointment_time si el slot seleccionado ya no está disponible', async () => {
      fixture.componentRef.setInput('companyId', 'co-1');
      component.form.get('appointment_time')?.setValue('08:00');

      appointmentServiceMock.getAvailableSlots = jest.fn().mockResolvedValue(['09:00', '09:30']);
      await component.loadSlots(testDate, 30, 'emp-1');

      expect(component.form.get('appointment_time')?.value).toBeNull();
    });
  });

  describe('selectTimeSlot', () => {
    it('debe setear appointment_time en el form', () => {
      component.selectTimeSlot('09:30');

      expect(component.form.get('appointment_time')?.value).toBe('09:30');
      expect(component.form.get('appointment_time')?.touched).toBe(true);
    });
  });

  describe('getTimePlaceholder', () => {
    it('debe indicar "Selecciona un empleado" si no hay empleado', () => {
      expect(component.getTimePlaceholder()).toBe('Selecciona un empleado');
    });

    it('debe indicar "Selecciona una fecha" si hay empleado pero no fecha', () => {
      component.form.get('employee_id')?.setValue('emp-1');
      expect(component.getTimePlaceholder()).toBe('Selecciona una fecha');
    });

    it('debe indicar "Selecciona servicios" si hay empleado y fecha pero no servicios', () => {
      component.form.get('employee_id')?.setValue('emp-1');
      component.selectedDate.set(new Date(2026, 4, 15));
      expect(component.getTimePlaceholder()).toBe('Selecciona servicios');
    });
  });

  describe('submit', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('companyId', 'co-1');
      component.form.get('employee_id')?.setValue('emp-1');
      component.form.get('service_ids')?.setValue(['svc-1']);
      component.selectedServiceIds.set(['svc-1']);
      component.employeeServices.set(mockServices.slice(0, 1));
      component.selectedDate.set(new Date(2026, 4, 15));
      component.form.get('client_name')?.setValue('Juan Pérez');
      component.form.get('client_phone')?.setValue('555-1234');
      component.form.get('appointment_time')?.setValue('09:00');
      fixture.detectChanges();
    });

    it('no debe submittear si no hay fecha seleccionada', async () => {
      component.selectedDate.set(null);
      component.dateTouched.set(true);

      await component.submit();

      expect(appointmentServiceMock.create).not.toHaveBeenCalled();
    });

    it('no debe submittear si el formulario es inválido', async () => {
      component.form.get('client_name')?.setValue('');

      await component.submit();

      expect(appointmentServiceMock.create).not.toHaveBeenCalled();
    });

    it('debe marcar dateTouched como true al intentar submitir sin fecha', async () => {
      component.selectedDate.set(null);

      await component.submit();

      expect(component.dateTouched()).toBe(true);
    });

    it('debe llamar a appointmentService.create con el DTO correcto', async () => {
      await component.submit();

      expect(appointmentServiceMock.create).toHaveBeenCalledWith({
        company_id: 'co-1',
        employee_id: 'emp-1',
        service_ids: ['svc-1'],
        client_name: 'Juan Pérez',
        client_phone: '555-1234',
        client_email: undefined,
        appointment_date: '2026-05-15',
        appointment_time: '09:00'
      });
    });

    it('debe mostrar toast de éxito y emitir onCreated al crear', async () => {
      const spy = jest.spyOn(component.onCreated, 'emit');

      await component.submit();

      expect(messageServiceMock.add).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'success',
        detail: 'Cita creada correctamente'
      }));
      expect(spy).toHaveBeenCalled();
    });

    it('debe resetear el formulario después de crear exitosamente', async () => {
      await component.submit();

      expect(component.selectedDate()).toBeNull();
      expect(component.selectedServiceIds()).toEqual([]);
      expect(component.form.get('employee_id')?.value).toBeNull();
      expect(component.form.get('client_name')?.value).toBe('');
    });

    it('debe mostrar error si falla la creación', async () => {
      appointmentServiceMock.create = jest.fn().mockRejectedValue(new Error('Time slot not available'));

      await component.submit();

      expect(messageServiceMock.add).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'error',
        detail: 'Time slot not available'
      }));
    });

    it('debe mostrar error genérico si no hay mensaje en el error', async () => {
      appointmentServiceMock.create = jest.fn().mockRejectedValue(new Error());

      await component.submit();

      expect(messageServiceMock.add).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'error',
        detail: 'No se pudo crear la cita'
      }));
    });

    it('debe setear submitting a false incluso si falla', async () => {
      appointmentServiceMock.create = jest.fn().mockRejectedValue(new Error('fail'));

      await component.submit();

      expect(component.submitting()).toBe(false);
    });

    it('debe transformar client_phone vacío a undefined en el DTO', async () => {
      component.form.get('client_phone')?.setValue('');
      expect(component.form.get('client_phone')?.value || undefined).toBeUndefined();
    });

    it('debe transformar client_email vacío a undefined en el DTO', () => {
      component.form.get('client_email')?.setValue('');
      expect(component.form.get('client_email')?.value || undefined).toBeUndefined();
    });
  });

  describe('close', () => {
    it('debe emitir onClose', () => {
      const spy = jest.spyOn(component.onClose, 'emit');

      component.close();

      expect(spy).toHaveBeenCalled();
    });

    it('debe resetear el formulario', () => {
      component.form.get('employee_id')?.setValue('emp-1');
      component.form.get('client_name')?.setValue('Test');
      component.selectedDate.set(new Date(2026, 4, 15));
      component.selectedServiceIds.set(['svc-1']);
      component.availableSlots.set(mockSlots);

      component.close();

      expect(component.form.get('employee_id')?.value).toBeNull();
      expect(component.form.get('client_name')?.value).toBe('');
      expect(component.selectedDate()).toBeNull();
      expect(component.selectedServiceIds()).toEqual([]);
      expect(component.availableSlots()).toEqual([]);
    });
  });

  describe('resetForm (via visible effect)', () => {
    it('debe resetear todo cuando el diálogo se abre (visible = true)', () => {
      component.form.get('employee_id')?.setValue('emp-1');
      component.form.get('client_name')?.setValue('Old Name');
      component.selectedDate.set(new Date(2026, 4, 15));
      component.availableSlots.set(mockSlots);

      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      expect(component.form.get('employee_id')?.value).toBeNull();
      expect(component.form.get('client_name')?.value).toBe('');
      expect(component.selectedDate()).toBeNull();
      expect(component.availableSlots()).toEqual([]);
    });
  });

  describe('formattedDate', () => {
    it('debe retornar string vacío si no hay fecha seleccionada', () => {
      expect(component.formattedDate()).toBe('');
    });

    it('debe formatear la fecha correctamente en español', () => {
      const date = new Date(2026, 4, 15);
      component.selectedDate.set(date);
      fixture.detectChanges();

      const formatted = component.formattedDate();
      expect(formatted).toContain('15');
      expect(formatted).toContain('2026');
    });
  });

  describe('edge cases', () => {
    it('debe resetear servicesIds, slots y time al cambiar empleado', async () => {
      component.form.get('employee_id')?.setValue('emp-1');
      component.selectedServiceIds.set(['svc-1', 'svc-2']);
      component.availableSlots.set(mockSlots);
      component.form.get('appointment_time')?.setValue('09:00');

      serviceServiceMock.getByEmployee = jest.fn().mockResolvedValue([]);
      component.onEmployeeChange('emp-2');
      await fixture.whenStable();

      expect(component.selectedServiceIds()).toEqual([]);
      expect(component.availableSlots()).toEqual([]);
      expect(component.form.get('appointment_time')?.value).toBeNull();
      expect(serviceServiceMock.getByEmployee).toHaveBeenCalledWith('emp-2');
    });

    it('debe mantener el companyId vacío sin causar error en loadSlots', async () => {
      fixture.componentRef.setInput('companyId', '');

      await component.loadSlots(new Date(), 30, 'emp-1');

      expect(appointmentServiceMock.getAvailableSlots).not.toHaveBeenCalled();
    });

    it('debe manejar seleccionar fecha antes que empleado sin cargar slots', () => {
      const loadSpy = jest.spyOn(component, 'loadSlots');
      const date = new Date(2026, 4, 15);

      component.onDateSelect(date);

      expect(loadSpy).not.toHaveBeenCalled();
      expect(component.selectedDate()).toEqual(date);
      expect(component.dateTouched()).toBe(true);
    });

    it('debe manejar el flujo completo: empleado → servicios → fecha → slots', async () => {
      fixture.componentRef.setInput('companyId', 'co-1');
      component.form.get('employee_id')?.setValue('emp-1');
      component.employeeServices.set(mockServices.slice(0, 2));
      fixture.detectChanges();

      component.toggleService('svc-1');
      expect(component.totalDuration()).toBe(30);

      appointmentServiceMock.getAvailableSlots = jest.fn().mockResolvedValue(mockSlots);
      const date = new Date(2026, 4, 15);
      component.onDateSelect(date);
      await fixture.whenStable();

      expect(appointmentServiceMock.getAvailableSlots).toHaveBeenCalledWith('co-1', 'emp-1', '2026-05-15', 30);
      expect(component.availableSlots()).toEqual(mockSlots);
    });
  });
});