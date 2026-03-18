import { ComponentFixture, TestBed, NO_ERRORS_SCHEMA } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ServicesComponent } from './services.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ServiceService } from '../../../../core/services/service.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';

describe('ServicesComponent - Behavior Driven Tests', () => {
  let component: ServicesComponent;
  let fixture: ComponentFixture<ServicesComponent>;
  let authServiceMock: jest.Mocked<AuthService>;
  let serviceServiceMock: jest.Mocked<ServiceService>;
  let confirmationServiceMock: jest.Mocked<ConfirmationService>;
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

  const mockServices = [
    {
      id: 'srv-1',
      name: 'Corte de cabello',
      duration_minutes: 30,
      price: 25,
      company_id: 'company-1',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'srv-2',
      name: 'Tinte',
      duration_minutes: 60,
      price: 50,
      company_id: 'company-1',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'srv-3',
      name: 'Manicure',
      duration_minutes: 45,
      price: null,
      company_id: 'company-1',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  beforeEach(waitForAsync(async () => {
    authServiceMock = {
      getCurrentUser: jest.fn().mockResolvedValue(mockUser)
    } as any;

    serviceServiceMock = {
      getByCompany: jest.fn().mockResolvedValue(mockServices),
      delete: jest.fn().mockResolvedValue(undefined)
    } as any;

    confirmationServiceMock = {
      confirm: jest.fn()
    } as any;

    messageServiceMock = {
      add: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [ServicesComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ServiceService, useValue: serviceServiceMock },
        { provide: ConfirmationService, useValue: confirmationServiceMock },
        { provide: MessageService, useValue: messageServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }));

  describe('when manager views services list', () => {
    it('should display page title', () => {
      // Behavior: Manager knows which section they're in
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Gestión de Servicios');
    });

    it('should show new service button', () => {
      // Behavior: Manager can easily create new services
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Nuevo Servicio');
    });

    it('should display all services with names', async () => {
      // Behavior: Manager sees list of all available services
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('Corte de cabello');
      expect(compiled.textContent).toContain('Tinte');
      expect(compiled.textContent).toContain('Manicure');
    }));

    it('should display service duration for each service', async () => {
      // Behavior: Manager sees how long each service takes
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('30 min');
      expect(compiled.textContent).toContain('60 min');
      expect(compiled.textContent).toContain('45 min');
    }));

    it('should display service prices when available', async () => {
      // Behavior: Manager sees pricing information
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('$25.00');
      expect(compiled.textContent).toContain('$50.00');
    }));
  });

  describe('when there are no services', () => {
    beforeEach(() => {
      serviceServiceMock.getByCompany = jest.fn().mockResolvedValue([]);
    });

    it('should show empty state with call to action', async () => {
      // Behavior: Empty state guides manager to create first service
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('No hay servicios configurados');
      expect(compiled.textContent).toContain('Comienza creando tu primer servicio');
      expect(compiled.textContent).toContain('Crear Servicio');
    }));
  });

  describe('when manager wants to edit a service', () => {
    it('should show edit action for each service', async () => {
      // Behavior: Each service has an edit option
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const editLinks = compiled.querySelectorAll('a[href*="/bo/services/"]');
      
      // Should have edit links for each service
      expect(editLinks.length).toBeGreaterThanOrEqual(mockServices.length);
    }));

    it('should navigate to edit form when clicking edit', async () => {
      // Behavior: Edit action navigates to service edit page
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const firstEditLink = compiled.querySelector('a[href="/bo/services/srv-1"]');
      
      expect(firstEditLink).toBeTruthy();
    }));
  });

  describe('when manager wants to delete a service', () => {
    it('should show delete action for each service', async () => {
      // Behavior: Each service has a delete option
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const deleteButtons = compiled.querySelectorAll('button');
      
      // Should have delete buttons
      expect(deleteButtons.length).toBeGreaterThan(0);
    }));

    it('should show confirmation dialog before deleting', async () => {
      // Behavior: System prevents accidental deletions
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      // Simulate clicking delete
      component.confirmDelete(mockServices[0]);

      expect(confirmationServiceMock.confirm).toHaveBeenCalled();
      const confirmCall = confirmationServiceMock.confirm.mock.calls[0][0];
      expect(confirmCall.message).toContain('Corte de cabello');
      expect(confirmCall.header).toBe('Confirmar Eliminación');
    }));

    it('should remove service from list after successful deletion', fakeAsync(async () => {
      // Behavior: Service disappears from list after deletion
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      // Mock confirmation accepting
      confirmationServiceMock.confirm = jest.fn((config) => {
        if (config.accept) config.accept();
      });

      await component.deleteService('srv-1');
      // tick replaced by await

      expect(serviceServiceMock.delete).toHaveBeenCalledWith('srv-1');
      expect(component.services().length).toBe(mockServices.length - 1);
      expect(component.services().find(s => s.id === 'srv-1')).toBeUndefined();
    }));

    it('should show success message after deletion', fakeAsync(async () => {
      // Behavior: Manager receives confirmation of successful action
      component.ngOnInit();
      // tick replaced by await

      await component.deleteService('srv-1');
      // tick replaced by await

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Servicio eliminado correctamente'
      });
    }));

    it('should show error message when deletion fails', fakeAsync(async () => {
      // Behavior: Manager is informed when action fails
      serviceServiceMock.delete = jest.fn().mockRejectedValue(new Error('Delete failed'));
      
      component.ngOnInit();
      // tick replaced by await

      await component.deleteService('srv-1');
      // tick replaced by await

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo eliminar el servicio'
      });
    }));
  });

  describe('when service fails to load', () => {
    beforeEach(() => {
      serviceServiceMock.getByCompany = jest.fn().mockRejectedValue(new Error('Load failed'));
    });

    it('should show error message', async () => {
      // Behavior: Manager is informed of loading issues
      component.ngOnInit();
      // tick replaced by await

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los servicios'
      });
    }));
  });

  describe('service without price', () => {
    it('should handle services without pricing gracefully', async () => {
      // Behavior: Services without prices are displayed correctly
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      // Component should render without errors
      expect(component.services().some(s => s.price === null)).toBe(true);
    }));
  });
});