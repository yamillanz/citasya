import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { AppointmentCreateDialogComponent } from './appointment-create-dialog.component';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { ServiceService } from '../../../../core/services/service.service';
import { Service } from '../../../../core/models/service.model';

describe('AppointmentCreateDialogComponent', () => {
  let component: AppointmentCreateDialogComponent;
  let fixture: ComponentFixture<AppointmentCreateDialogComponent>;
  let appointmentServiceMock: any;
  let serviceServiceMock: any;
  let messageServiceMock: any;

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
        AppointmentCreateDialogComponent
      ],
      providers: [
        { provide: MessageService, useValue: messageServiceMock },
        { provide: AppointmentService, useValue: appointmentServiceMock },
        { provide: ServiceService, useValue: serviceServiceMock },
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('loadServices', () => {
    it('debe cargar servicios del empleado al abrir el diálogo', async () => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('employeeId', 'emp-1');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(serviceServiceMock.getByEmployee).toHaveBeenCalledWith('emp-1');
      expect(component.employeeServices()).toEqual(mockServices.slice(0, 2));
    });

    it('debe mostrar error y cerrar si falla la carga de servicios', async () => {
      serviceServiceMock.getByEmployee = jest.fn().mockRejectedValue(new Error('Network error'));
      const spy = jest.spyOn(component.onClose, 'emit');
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('employeeId', 'emp-1');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(messageServiceMock.add).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'error',
        detail: 'No se pudieron cargar los servicios'
      }));
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('toggleService', () => {
    beforeEach(() => {
      component.employeeServices.set(mockServices.slice(0, 2));
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
    });

    it('debe permitir seleccionar múltiples servicios', () => {
      component.toggleService('svc-1');
      component.toggleService('svc-2');
      expect(component.selectedServiceIds()).toEqual(['svc-1', 'svc-2']);
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

  describe('loadSlots', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    beforeEach(() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      fixture.componentRef.setInput('date', tomorrow);
      fixture.componentRef.setInput('companyId', 'co-1');
      fixture.componentRef.setInput('employeeId', 'emp-1');
      component.employeeServices.set(mockServices.slice(0, 1));
      component.toggleService('svc-1');
      fixture.detectChanges();
    });

    it('debe cargar slots cuando se selecciona fecha y servicios', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

      await component.loadSlots(tomorrow, 30);
      fixture.detectChanges();

      expect(appointmentServiceMock.getAvailableSlots).toHaveBeenCalledWith('co-1', 'emp-1', dateStr, 30);
      expect(component.availableSlots()).toEqual(mockSlots);
    });
  });

  describe('form validation', () => {
    it('debe ser inválido con formulario vacío', () => {
      expect(component.form.invalid).toBe(true);
    });

    it('debe ser válido con todos los campos requeridos completos', () => {
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      fixture.componentRef.setInput('date', tomorrow);
      component.employeeServices.set(mockServices.slice(0, 1));
      fixture.componentRef.setInput('companyId', 'co-1');
      fixture.componentRef.setInput('employeeId', 'emp-1');
      component.toggleService('svc-1');
      component.form.get('client_name')?.setValue('Juan Pérez');
      component.form.get('client_phone')?.setValue('555-1234');
      component.form.get('appointment_time')?.setValue('10:00');
      fixture.detectChanges();

      expect(component.form.get('client_name')?.valid).toBe(true);
      expect(component.form.get('client_phone')?.valid).toBe(true);
      expect(component.form.get('appointment_time')?.valid).toBe(true);
      expect(component.form.get('service_ids')?.valid).toBe(true);
    });

    it('debe ser inválido sin servicios seleccionados', () => {
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      fixture.componentRef.setInput('date', tomorrow);
      component.form.get('client_name')?.setValue('Juan');
      component.form.get('client_phone')?.setValue('555-1234');
      component.form.get('appointment_time')?.setValue('10:00');
      fixture.detectChanges();

      expect(component.form.invalid).toBe(true);
    });
  });

  describe('submit', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    beforeEach(() => {
      fixture.componentRef.setInput('date', tomorrow);
      fixture.componentRef.setInput('companyId', 'co-1');
      fixture.componentRef.setInput('employeeId', 'emp-1');
      component.employeeServices.set(mockServices.slice(0, 1));
      component.toggleService('svc-1');
      component.form.get('client_name')?.setValue('Juan Pérez');
      component.form.get('client_phone')?.setValue('555-1234');
      component.form.get('appointment_time')?.setValue('10:00');
      fixture.detectChanges();
    });

    it('no debe submittear si el formulario es inválido', async () => {
      component.form.get('client_name')?.setValue('');
      fixture.detectChanges();

      await component.submit();

      expect(appointmentServiceMock.create).not.toHaveBeenCalled();
    });

    it('debe llamar a appointmentService.create con el DTO correcto', async () => {
      const dateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,'0')}-${String(tomorrow.getDate()).padStart(2,'0')}`;

      await component.submit();

      expect(appointmentServiceMock.create).toHaveBeenCalledWith({
        company_id: 'co-1',
        employee_id: 'emp-1',
        service_ids: ['svc-1'],
        client_name: 'Juan Pérez',
        client_phone: '555-1234',
        client_email: undefined,
        appointment_date: dateStr,
        appointment_time: '10:00'
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

    it('debe mostrar error si falla la creación', async () => {
      appointmentServiceMock.create = jest.fn().mockRejectedValue(new Error('Time slot not available'));

      await component.submit();

      expect(messageServiceMock.add).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'error',
        detail: 'Time slot not available'
      }));
    });
  });

  describe('close', () => {
    it('debe emitir onClose y resetear el formulario', () => {
      const spy = jest.spyOn(component.onClose, 'emit');
      component.form.get('client_name')?.setValue('Test');

      component.close();

      expect(spy).toHaveBeenCalled();
      expect(component.form.get('client_name')?.value).toBe('');
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

  describe('formattedDate', () => {
    it('debe retornar string vacío si no hay fecha', () => {
      expect(component.formattedDate()).toBe('');
    });

    it('debe formatear la fecha correctamente en español', () => {
      const date = new Date(2026, 4, 15); // May 15, 2026
      fixture.componentRef.setInput('date', date);
      fixture.detectChanges();

      expect(component.formattedDate()).toContain('mayo');
      expect(component.formattedDate()).toContain('15');
      expect(component.formattedDate()).toContain('2026');
    });
  });
});
