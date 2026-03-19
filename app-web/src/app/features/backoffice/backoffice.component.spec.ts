import { ComponentFixture, TestBed, waitForAsync, NO_ERRORS_SCHEMA } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BackofficeComponent } from './backoffice.component';
import { AuthService } from '../../core/services/auth.service';

describe('BackofficeComponent - Behavior Driven Tests', () => {
  let component: BackofficeComponent;
  let authServiceMock: jest.Mocked<AuthService>;

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

  beforeEach(waitForAsync(async () => {
    authServiceMock = {
      getCurrentUser: jest.fn().mockResolvedValue(mockUser),
      signOut: jest.fn().mockResolvedValue(undefined)
    } as any;

    // Create component instance without full TestBed
    // This avoids PrimeNG module resolution issues
    component = new BackofficeComponent();
    // Manually set the authService
    Object.defineProperty(component, 'authService', {
      value: authServiceMock,
      writable: true
    });
  }));

  describe('component initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should have sidebar visibility signal', () => {
      expect(component.sidebarVisible()).toBe(false);
      component.sidebarVisible.set(true);
      expect(component.sidebarVisible()).toBe(true);
    });

    it('should have user signal initialized to null', () => {
      expect(component.user()).toBeNull();
    });
  });

  describe('menu items configuration', () => {
    it('should have correct number of menu items', () => {
      expect(component.menuItems.length).toBe(5);
    });

    it('should have dashboard menu item with correct properties', () => {
      const dashboardItem = component.menuItems.find(item => item.label === 'Dashboard');
      expect(dashboardItem).toBeDefined();
      expect(dashboardItem?.icon).toBe('pi pi-home');
      expect(dashboardItem?.routerLink).toBe('/bo/dashboard');
    });

    it('should have employees menu item with correct properties', () => {
      const employeesItem = component.menuItems.find(item => item.label === 'Empleados');
      expect(employeesItem).toBeDefined();
      expect(employeesItem?.icon).toBe('pi pi-users');
      expect(employeesItem?.routerLink).toBe('/bo/employees');
    });

    it('should have services menu item with correct properties', () => {
      const servicesItem = component.menuItems.find(item => item.label === 'Servicios');
      expect(servicesItem).toBeDefined();
      expect(servicesItem?.icon).toBe('pi pi-briefcase');
      expect(servicesItem?.routerLink).toBe('/bo/services');
    });

    it('should have appointments menu item with correct properties', () => {
      const appointmentsItem = component.menuItems.find(item => item.label === 'Citas');
      expect(appointmentsItem).toBeDefined();
      expect(appointmentsItem?.icon).toBe('pi pi-calendar');
      expect(appointmentsItem?.routerLink).toBe('/bo/appointments');
    });

    it('should have daily close menu item with correct properties', () => {
      const closeItem = component.menuItems.find(item => item.label === 'Cierre Diario');
      expect(closeItem).toBeDefined();
      expect(closeItem?.icon).toBe('pi pi-dollar');
      expect(closeItem?.routerLink).toBe('/bo/close');
    });
  });

  describe('user data management', () => {
    it('should update user signal', () => {
      component.user.set(mockUser);
      expect(component.user()).toEqual(mockUser);
    });

    it('should store user email', () => {
      component.user.set(mockUser);
      expect(component.user()?.email).toBe('manager@test.com');
    });

    it('should store user full name', () => {
      component.user.set(mockUser);
      expect(component.user()?.full_name).toBe('Manager Test');
    });

    it('should store user role', () => {
      component.user.set(mockUser);
      expect(component.user()?.role).toBe('manager');
    });
  });

  describe('logout functionality', () => {
    it('should call signOut when logout is invoked', async () => {
      Object.defineProperty(component, 'router', {
        value: { navigate: jest.fn() },
        writable: true
      });
      
      await component.logout();
      expect(authServiceMock.signOut).toHaveBeenCalled();
    });
  });
});
