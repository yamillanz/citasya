import { ComponentFixture, TestBed, waitForAsync, NO_ERRORS_SCHEMA } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ServicesComponent } from './services.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ServiceService } from '../../../../core/services/service.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

describe('ServicesComponent - Behavior Driven Tests', () => {
  let component: ServicesComponent;
  let fixture: ComponentFixture<ServicesComponent>;
  let authServiceMock: jest.Mocked<AuthService>;
  let serviceServiceMock: jest.Mocked<ServiceService>;

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

    await TestBed.configureTestingModule({
      imports: [ServicesComponent, RouterTestingModule, TooltipModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ServiceService, useValue: serviceServiceMock },
        ConfirmationService,
        MessageService,
        provideNoopAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ServicesComponent);
    component = fixture.componentInstance;
  }));

  describe('when manager views services list', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should display page title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Gestión de Servicios');
    });

    it('should show new service button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Nuevo Servicio');
    });

    it('should load services into component state', () => {
      expect(component.services().length).toBe(3);
      expect(component.services()[0].name).toBe('Corte de cabello');
    });

    it('should display all service names in template', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('Corte de cabello');
      expect(compiled.textContent).toContain('Tinte');
      expect(compiled.textContent).toContain('Manicure');
    });

    it('should display service durations', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('30 min');
      expect(compiled.textContent).toContain('60 min');
      expect(compiled.textContent).toContain('45 min');
    });

    it('should display service prices when available', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('$25.00');
      expect(compiled.textContent).toContain('$50.00');
    });
  });

  describe('when there are no services', () => {
    beforeEach(() => {
      serviceServiceMock.getByCompany = jest.fn().mockResolvedValue([]);
    });

    it('should show empty state with call to action', async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('No hay servicios configurados');
      expect(compiled.textContent).toContain('Comienza creando tu primer servicio');
    });
  });

  describe('when manager deletes a service', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should remove service from list after successful deletion', async () => {
      await component.deleteService('srv-1');

      expect(serviceServiceMock.delete).toHaveBeenCalledWith('srv-1');
      expect(component.services().length).toBe(mockServices.length - 1);
      expect(component.services().find(s => s.id === 'srv-1')).toBeUndefined();
    });

    it('should keep service in list when deletion fails', async () => {
      serviceServiceMock.delete = jest.fn().mockRejectedValue(new Error('Delete failed'));
      
      const initialCount = component.services().length;
      await component.deleteService('srv-1');

      expect(serviceServiceMock.delete).toHaveBeenCalledWith('srv-1');
      expect(component.services().length).toBe(initialCount);
    });
  });

  describe('when service fails to load', () => {
    beforeEach(() => {
      serviceServiceMock.getByCompany = jest.fn().mockRejectedValue(new Error('Load failed'));
    });

    it('should set loading to false after error', async () => {
      await component.ngOnInit();
      await fixture.whenStable();

      expect(component.loading()).toBe(false);
    });

    it('should have empty services list after error', async () => {
      await component.ngOnInit();
      await fixture.whenStable();

      expect(component.services().length).toBe(0);
    });
  });

  describe('service without price', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should handle services without pricing gracefully', () => {
      expect(component.services().some(s => s.price === null)).toBe(true);
    });
  });
});
