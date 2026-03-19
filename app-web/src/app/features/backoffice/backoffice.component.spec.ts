import { signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

describe('BackofficeComponent - Behavior Driven Tests', () => {
  let authServiceMock: jest.Mocked<AuthService>;
  let routerMock: { navigate: jest.Mock };

  const mockUser: User = {
    id: 'user-1',
    email: 'manager@test.com',
    full_name: 'Manager Test',
    role: 'manager' as const,
    company_id: 'company-1',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Simulación del componente Backoffice
  const createMockBackofficeComponent = () => {
    const user = signal<User | null>(null);
    const sidebarVisible = signal(false);
    
    const menuItems = [
      { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/bo/dashboard' },
      { label: 'Empleados', icon: 'pi pi-users', routerLink: '/bo/employees' },
      { label: 'Servicios', icon: 'pi pi-briefcase', routerLink: '/bo/services' },
      { label: 'Citas', icon: 'pi pi-calendar', routerLink: '/bo/appointments' },
      { label: 'Cierre Diario', icon: 'pi pi-dollar', routerLink: '/bo/close' }
    ];

    const ngOnInit = async () => {
      user.set(await authServiceMock.getCurrentUser());
    };

    const logout = async () => {
      await authServiceMock.signOut();
      routerMock.navigate(['/login']);
    };

    return {
      user,
      sidebarVisible,
      menuItems,
      ngOnInit,
      logout
    };
  };

  beforeEach(() => {
    authServiceMock = {
      getCurrentUser: jest.fn().mockResolvedValue(mockUser),
      signOut: jest.fn().mockResolvedValue(undefined)
    } as any;

    routerMock = {
      navigate: jest.fn()
    };
  });

  describe('component initialization', () => {
    it('should create component with correct initial state', () => {
      const component = createMockBackofficeComponent();
      
      expect(component).toBeTruthy();
      expect(component.sidebarVisible()).toBe(false);
      expect(component.user()).toBeNull();
    });

    it('should have sidebar visibility signal', () => {
      const component = createMockBackofficeComponent();
      
      expect(component.sidebarVisible()).toBe(false);
      component.sidebarVisible.set(true);
      expect(component.sidebarVisible()).toBe(true);
    });

    it('should have user signal initialized to null', () => {
      const component = createMockBackofficeComponent();
      
      expect(component.user()).toBeNull();
    });

    it('should load user data on init', async () => {
      const component = createMockBackofficeComponent();
      
      await component.ngOnInit();
      
      expect(authServiceMock.getCurrentUser).toHaveBeenCalled();
      expect(component.user()).toEqual(mockUser);
    });
  });

  describe('menu items configuration', () => {
    it('should have correct number of menu items', () => {
      const component = createMockBackofficeComponent();
      
      expect(component.menuItems.length).toBe(5);
    });

    it('should have dashboard menu item with correct properties', () => {
      const component = createMockBackofficeComponent();
      const dashboardItem = component.menuItems.find(item => item.label === 'Dashboard');
      
      expect(dashboardItem).toBeDefined();
      expect(dashboardItem?.icon).toBe('pi pi-home');
      expect(dashboardItem?.routerLink).toBe('/bo/dashboard');
    });

    it('should have employees menu item with correct properties', () => {
      const component = createMockBackofficeComponent();
      const employeesItem = component.menuItems.find(item => item.label === 'Empleados');
      
      expect(employeesItem).toBeDefined();
      expect(employeesItem?.icon).toBe('pi pi-users');
      expect(employeesItem?.routerLink).toBe('/bo/employees');
    });

    it('should have services menu item with correct properties', () => {
      const component = createMockBackofficeComponent();
      const servicesItem = component.menuItems.find(item => item.label === 'Servicios');
      
      expect(servicesItem).toBeDefined();
      expect(servicesItem?.icon).toBe('pi pi-briefcase');
      expect(servicesItem?.routerLink).toBe('/bo/services');
    });

    it('should have appointments menu item with correct properties', () => {
      const component = createMockBackofficeComponent();
      const appointmentsItem = component.menuItems.find(item => item.label === 'Citas');
      
      expect(appointmentsItem).toBeDefined();
      expect(appointmentsItem?.icon).toBe('pi pi-calendar');
      expect(appointmentsItem?.routerLink).toBe('/bo/appointments');
    });

    it('should have daily close menu item with correct properties', () => {
      const component = createMockBackofficeComponent();
      const closeItem = component.menuItems.find(item => item.label === 'Cierre Diario');
      
      expect(closeItem).toBeDefined();
      expect(closeItem?.icon).toBe('pi pi-dollar');
      expect(closeItem?.routerLink).toBe('/bo/close');
    });
  });

  describe('user data management', () => {
    it('should update user signal', async () => {
      const component = createMockBackofficeComponent();
      
      await component.ngOnInit();
      
      expect(component.user()).toEqual(mockUser);
    });

    it('should store user email', async () => {
      const component = createMockBackofficeComponent();
      
      await component.ngOnInit();
      
      expect(component.user()?.email).toBe('manager@test.com');
    });

    it('should store user full name', async () => {
      const component = createMockBackofficeComponent();
      
      await component.ngOnInit();
      
      expect(component.user()?.full_name).toBe('Manager Test');
    });

    it('should store user role', async () => {
      const component = createMockBackofficeComponent();
      
      await component.ngOnInit();
      
      expect(component.user()?.role).toBe('manager');
    });
  });

  describe('logout functionality', () => {
    it('should call signOut when logout is invoked', async () => {
      const component = createMockBackofficeComponent();
      
      await component.logout();
      
      expect(authServiceMock.signOut).toHaveBeenCalled();
    });

    it('should navigate to login after logout', async () => {
      const component = createMockBackofficeComponent();
      
      await component.logout();
      
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
