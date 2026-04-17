import { ComponentFixture, TestBed, waitForAsync, NO_ERRORS_SCHEMA } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ServiceFormComponent } from './service-form.component';
import { AuthService } from '../../../../../core/services/auth.service';
import { ServiceService } from '../../../../../core/services/service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ReactiveFormsModule } from '@angular/forms';

describe('ServiceFormComponent - Behavior Driven Tests', () => {
  let component: ServiceFormComponent;
  let fixture: ComponentFixture<ServiceFormComponent>;
  let authServiceMock: jest.Mocked<AuthService>;
  let serviceServiceMock: jest.Mocked<ServiceService>;
  let router: Router;

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
    commission_percentage: 60,
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
          MessageService
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      router = TestBed.inject(Router);
      jest.spyOn(router, 'navigate').mockResolvedValue(true);

      fixture = TestBed.createComponent(ServiceFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      await fixture.whenStable();
    }));

    it('should display "Nuevo Servicio" title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Nuevo Servicio');
    });

    it('should have empty form fields initially', () => {
      expect(component.form.get('name')?.value).toBe('');
      expect(component.form.get('duration_minutes')?.value).toBe(30);
      expect(component.form.get('price')?.value).toBeNull();
      expect(component.form.get('commission_percentage')?.value).toBe(50);
    });

    it('should validate that name is required', () => {
      component.form.patchValue({ name: '', duration_minutes: 30 });
      component.markAllAsTouched();
      
      expect(component.form.valid).toBe(false);
      expect(component.nameError).toBe('El nombre es requerido');
    });

    it('should validate name minimum length', () => {
      component.form.patchValue({ name: 'A', duration_minutes: 30 });
      component.markAllAsTouched();
      
      expect(component.nameError).toBe('El nombre debe tener al menos 2 caracteres');
    });

    it('should validate that duration is required', () => {
      component.form.patchValue({ name: 'Test Service', duration_minutes: null });
      component.markAllAsTouched();
      
      expect(component.durationError).toBe('La duración es requerida');
    });

    it('should validate minimum duration', () => {
      component.form.patchValue({ name: 'Test Service', duration_minutes: 3 });
      component.markAllAsTouched();
      
      expect(component.durationError).toBe('La duración mínima es 5 minutos');
    });

    it('should allow creating service without price', async () => {
      component.form.patchValue({
        name: 'Consulta gratuita',
        duration_minutes: 15,
        price: null
      });

      await component.onSubmit();

      expect(serviceServiceMock.create).toHaveBeenCalled();
      const createCall = serviceServiceMock.create.mock.calls[0][0];
      expect(createCall.price).toBeNull();
    });

    it('should show loading state while saving', async () => {
      component.form.patchValue({
        name: 'New Service',
        duration_minutes: 30,
        price: 25
      });

      const savePromise = component.onSubmit();
      
      expect(component.saving()).toBe(true);
      
      await savePromise;
    });

    it('should navigate to services list after successful creation', async () => {
      component.form.patchValue({
        name: 'New Service',
        duration_minutes: 30,
        price: 25
      });

      await component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['/bo/services']);
    });

    it('should associate service with manager company', async () => {
      component.form.patchValue({
        name: 'New Service',
        duration_minutes: 30,
        price: 25
      });

      await component.onSubmit();

      const createCall = serviceServiceMock.create.mock.calls[0][0];
      expect(createCall.company_id).toBe('company-1');
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
          MessageService
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      router = TestBed.inject(Router);
      jest.spyOn(router, 'navigate').mockResolvedValue(true);

      fixture = TestBed.createComponent(ServiceFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      await fixture.whenStable();
    }));

    it('should display "Editar Servicio" title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Editar Servicio');
    });

    it('should load existing service data into form', async () => {
      await component.ngOnInit();

      expect(component.form.get('name')?.value).toBe('Corte de cabello');
      expect(component.form.get('duration_minutes')?.value).toBe(30);
      expect(component.form.get('price')?.value).toBe(25);
    });

    it('should update service with modified data', async () => {
      component.form.patchValue({
        name: 'Corte de cabello actualizado',
        duration_minutes: 45,
        price: 30
      });

      await component.onSubmit();

      expect(serviceServiceMock.update).toHaveBeenCalledWith('srv-1', expect.any(Object));
    });

    it('should navigate to services list after successful update', async () => {
      component.form.patchValue({ name: 'Updated Name' });

      await component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['/bo/services']);
    });

    it('should navigate to list when service not found', async () => {
      serviceServiceMock.getById = jest.fn().mockResolvedValue(null);
      
      await component.ngOnInit();

      expect(router.navigate).toHaveBeenCalledWith(['/bo/services']);
    });
  });
});
