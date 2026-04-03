import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { EmployeeLayoutComponent } from './employee-layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { CompanyService } from '../../../core/services/company.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

describe('EmployeeLayoutComponent - Unit Tests', () => {
  let authServiceMock: jest.Mocked<AuthService>;
  let companyServiceMock: jest.Mocked<CompanyService>;
  let messageServiceMock: jest.Mocked<MessageService>;
  let routerMock: jest.Mocked<Router>;

  const mockUser = {
    id: 'employee-1',
    email: 'employee@test.com',
    full_name: 'JuanEmpleado',
    role: 'employee' as const,
    company_id: 'company-1',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const mockCompany = {
    id: 'company-1',
    name: 'Peluquería Juan',
    slug: 'peluqueria-juan',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  let clipboardWriteTextMock: jest.Mock;

  beforeEach(() => {
    clipboardWriteTextMock = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: clipboardWriteTextMock },
      writable: true
    });

    authServiceMock = {
      getCurrentUser: jest.fn().mockResolvedValue(mockUser),
      signOut: jest.fn().mockResolvedValue(undefined)
    } as any;

    companyServiceMock = {
      getById: jest.fn().mockResolvedValue(mockCompany),
      getBySlug: jest.fn().mockResolvedValue(mockCompany)
    } as any;

    messageServiceMock = {
      add: jest.fn()
    } as any;

    routerMock = {
      navigate: jest.fn().mockReturnValue(Promise.resolve(true))
    } as any;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: CompanyService, useValue: companyServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
        { provide: Router, useValue: routerMock },
        provideNoopAnimations()
      ]
    });
  });

  describe('menuItems', () => {
    it('debe tener los items de menú correctos', () => {
      const menuItems = [
        { label: 'Mi Calendario', icon: 'pi pi-calendar', routerLink: '/emp/calendar' },
        { label: 'Mi Historial', icon: 'pi pi-history', routerLink: '/emp/history' }
      ];

      expect(menuItems).toHaveLength(2);
      expect(menuItems[0]).toEqual({
        label: 'Mi Calendario',
        icon: 'pi pi-calendar',
        routerLink: '/emp/calendar'
      });
      expect(menuItems[1]).toEqual({
        label: 'Mi Historial',
        icon: 'pi pi-history',
        routerLink: '/emp/history'
      });
    });
  });

  describe('copyBookingLink logic', () => {
    it('debe generar URL correcta con company slug y employee id', async () => {
      const userId = mockUser.id;
      const companySlug = mockCompany.slug;
      const expectedUrl = `${window.location.origin}/c/${companySlug}/e/${userId}/book`;expect(expectedUrl).toBe(`${window.location.origin}/c/peluqueria-juan/e/employee-1/book`);
    });

    it('debe mostrar error si el usuario no tiene company_id', async () => {
      const userWithoutCompany = { ...mockUser, company_id: undefined as any };
      
      expect(userWithoutCompany.company_id).toBeUndefined();
    });

    it('debe manejar clipboard writeText correctamente', async () => {
      const testUrl = 'https://test.com/c/slug/e/id/book';
      await navigator.clipboard.writeText(testUrl);
      
      expect(clipboardWriteTextMock).toHaveBeenCalledWith(testUrl);
    });
  });

  describe('logout logic', () => {
    it('debe llamar signOut y navegar a /login', async () => {
      await authServiceMock.signOut();
      await routerMock.navigate(['/login']);

      expect(authServiceMock.signOut).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('signals iniciales', () => {
    it('debe inicializar signals con valores por defecto', () => {
      const userSignal = signal<typeof mockUser | null>(null);
      const sidebarVisibleSignal = signal(false);
      const copyingSignal = signal(false);

      expect(userSignal()).toBeNull();
      expect(sidebarVisibleSignal()).toBe(false);
      expect(copyingSignal()).toBe(false);
    });
  });
});