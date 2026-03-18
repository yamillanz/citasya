import { ComponentFixture, TestBed, NO_ERRORS_SCHEMA } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ServiceFormComponent } from './service-form.component';
import { AuthService } from '../../../../../core/services/auth.service';
import { ServiceService } from '../../../../../core/services/service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

describe('ServiceFormComponent - Behavior Driven Tests', () => {
  let component: ServiceFormComponent;
  let fixture: ComponentFixture<ServiceFormComponent>;
  let authServiceMock: jest.Mocked<AuthService>;
  let serviceServiceMock: jest.Mocked<ServiceService>;
  let routerMock: jest.Mocked<Router>;
  let messageServiceMock: jest.Mocked<MessageService>;

  const mockUser = {
    id: 'user-1',
    email: 'manager@test.com',
    full_name: 'Manager Test',
    role: 'manager' as const,
    company_id: 'company-1',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const mockService = {
    id: 'srv-1',
    name: 'Corte de cabello',
    duration_minutes: 30,
    price: 25,
    company_id: 'company-1',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  beforeEach(waitForAsync(async () => {
    authServiceMock = {
      getCurrentUser: jest.fn().mockResolvedValue(mockUser)
    } as any;

    serviceServiceMock = {
      getById: jest.fn(),
      create: jest.fn().mockResolvedValue({ ...mockService, id: 'new-srv' }),
      update: jest.fn().mockResolvedValue(mockService)
    } as any;


    messageServiceMock = {
      add: jest.fn()
    } as any;
  }));

  describe('when creating a new service', () => {
    beforeEach(waitForAsync(async () => {
      const activatedRouteMock = {
        snapshot: {
          paramMap: {
            get: jest.fn().mockReturnValue('new')
          }
        }
      };

      await TestBed.configureTestingModule({
        imports: [ServiceFormComponent, ReactiveFormsModule, RouterTestingModule],
        providers: [
          { provide: AuthService, useValue: authServiceMock },
          { provide: ServiceService, useValue: serviceServiceMock },
          { provide: ActivatedRoute, useValue: activatedRouteMock },
          { provide: MessageService, useValue: messageServiceMock }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(ServiceFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      await fixture.whenStable();
    }));

    it('should display "Nuevo Servicio" title', () => {
      // Behavior: Manager knows they are creating a new service
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Nuevo Servicio');
    });

    it('should have empty form fields initially', () => {
      // Behavior: Form starts fresh for new service
      expect(component.form.get('name')?.value).toBe('');
      expect(component.form.get('duration_minutes')?.value).toBe(30);
      expect(component.form.get('price')?.value).toBeNull();
    });

    it('should validate that name is required', () => {
      // Behavior: System prevents saving without service name
      component.form.patchValue({ name: '', duration_minutes: 30 });
      component.markAllAsTouched();
      
      expect(component.form.valid).toBe(false);
      expect(component.nameError).toBe('El nombre es requerido');
    });

    it('should validate name minimum length', () => {
      // Behavior: Service names must be meaningful
      component.form.patchValue({ name: 'A', duration_minutes: 30 });
      component.markAllAsTouched();
      
      expect(component.nameError).toBe('El nombre debe tener al menos 2 caracteres');
    });

    it('should validate that duration is required', () => {
      // Behavior: Duration is essential for scheduling
      component.form.patchValue({ name: 'Test Service', duration_minutes: null });
      component.markAllAsTouched();
      
      expect(component.durationError).toBe('La duración es requerida');
    });

    it('should validate minimum duration', () => {
      // Behavior: Services must take at least 5 minutes
      component.form.patchValue({ name: 'Test Service', duration_minutes: 3 });
      component.markAllAsTouched();
      
      expect(component.durationError).toBe('La duración mínima es 5 minutos');
    });

    it('should allow creating service without price', fakeAsync(async () => {
      // Behavior: Price is optional for services
      component.form.patchValue({
        name: 'Consulta gratuita',
        duration_minutes: 15,
        price: null
      });

      await component.onSubmit();
      // tick replaced by await

      expect(serviceServiceMock.create).toHaveBeenCalled();
      const createCall = serviceServiceMock.create.mock.calls[0][0];
      expect(createCall.price).toBeNull();
    }));

    it('should show loading state while saving', fakeAsync(async () => {
      // Behavior: Manager sees feedback that save is in progress
      component.form.patchValue({
        name: 'New Service',
        duration_minutes: 30,
        price: 25
      });

      const savePromise = component.onSubmit();
      
      expect(component.saving()).toBe(true);
      
      await savePromise;
      // tick replaced by await
    }));

    it('should navigate to services list after successful creation', fakeAsync(async () => {
      // Behavior: Manager returns to list after creating service
      component.form.patchValue({
        name: 'New Service',
        duration_minutes: 30,
        price: 25
      });

      await component.onSubmit();
      // tick replaced by await

      expect(routerMock.navigate).toHaveBeenCalledWith(['/bo/services']);
    }));

    it('should show success message after creation', fakeAsync(async () => {
      // Behavior: Manager receives confirmation
      component.form.patchValue({
        name: 'New Service',
        duration_minutes: 30,
        price: 25
      });

      await component.onSubmit();
      // tick replaced by await

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Servicio creado correctamente'
      });
    }));

    it('should associate service with manager company', fakeAsync(async () => {
      // Behavior: New service belongs to manager's company
      component.form.patchValue({
        name: 'New Service',
        duration_minutes: 30,
        price: 25
      });

      await component.onSubmit();
      // tick replaced by await

      const createCall = serviceServiceMock.create.mock.calls[0][0];
      expect(createCall.company_id).toBe('company-1');
    }));

    it('should show error message when creation fails', fakeAsync(async () => {
      // Behavior: Manager is informed of errors
      serviceServiceMock.create = jest.fn().mockRejectedValue(new Error('Creation failed'));
      
      component.form.patchValue({
        name: 'New Service',
        duration_minutes: 30,
        price: 25
      });

      await component.onSubmit();
      // tick replaced by await

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Creation failed'
      });
    }));

    it('should allow canceling and return to list', () => {
      // Behavior: Manager can cancel without saving
      const compiled = fixture.nativeElement as HTMLElement;
      const cancelButton = compiled.querySelector('button[label="Cancelar"]');
      
      expect(cancelButton).toBeTruthy();
    });
  });

  describe('when editing an existing service', () => {
    beforeEach(waitForAsync(async () => {
      serviceServiceMock.getById = jest.fn().mockResolvedValue(mockService);
      
      const activatedRouteMock = {
        snapshot: {
          paramMap: {
            get: jest.fn().mockReturnValue('srv-1')
          }
        }
      };

      await TestBed.configureTestingModule({
        imports: [ServiceFormComponent, ReactiveFormsModule, RouterTestingModule],
        providers: [
          { provide: AuthService, useValue: authServiceMock },
          { provide: ServiceService, useValue: serviceServiceMock },
          { provide: ActivatedRoute, useValue: activatedRouteMock },
          { provide: MessageService, useValue: messageServiceMock }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(ServiceFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      await fixture.whenStable();
    }));

    it('should display "Editar Servicio" title', () => {
      // Behavior: Manager knows they are editing
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Editar Servicio');
    });

    it('should load existing service data into form', async () => {
      // Behavior: Form is pre-filled with current data
      component.ngOnInit();
      // tick replaced by await

      expect(component.form.get('name')?.value).toBe('Corte de cabello');
      expect(component.form.get('duration_minutes')?.value).toBe(30);
      expect(component.form.get('price')?.value).toBe(25);
    }));

    it('should update service with modified data', fakeAsync(async () => {
      // Behavior: Changes are saved to existing service
      component.form.patchValue({
        name: 'Corte de cabello actualizado',
        duration_minutes: 45,
        price: 30
      });

      await component.onSubmit();
      // tick replaced by await

      expect(serviceServiceMock.update).toHaveBeenCalledWith('srv-1', expect.any(Object));
    }));

    it('should show success message after update', fakeAsync(async () => {
      // Behavior: Manager receives confirmation of update
      component.form.patchValue({ name: 'Updated Name' });

      await component.onSubmit();
      // tick replaced by await

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Servicio actualizado correctamente'
      });
    }));

    it('should navigate to services list after successful update', fakeAsync(async () => {
      // Behavior: Manager returns to list after editing
      component.form.patchValue({ name: 'Updated Name' });

      await component.onSubmit();
      // tick replaced by await

      expect(routerMock.navigate).toHaveBeenCalledWith(['/bo/services']);
    }));

    it('should show error when service not found', async () => {
      // Behavior: Manager is informed if service doesn't exist
      serviceServiceMock.getById = jest.fn().mockResolvedValue(null);
      
      component.ngOnInit();
      // tick replaced by await

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Servicio no encontrado'
      });
      expect(routerMock.navigate).toHaveBeenCalledWith(['/bo/services']);
    }));
  });
});