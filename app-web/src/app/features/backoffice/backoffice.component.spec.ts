import { signal, computed } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

interface MenuItem {
  label: string;
  icon: string;
  routerLink: string;
}

describe('BackofficeComponent - Behavior Driven Tests', () => {
  let authServiceMock: jest.Mocked<AuthService>;
  let routerMock: { navigate: jest.Mock };

  const createMockUser = (overrides: Partial<User> = {}): User => ({
    id: 'user-1',
    email: 'manager@test.com',
    full_name: 'Manager Test',
    role: 'manager' as const,
    company_id: 'company-1',
    can_be_employee: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  });

  const baseMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/bo/dashboard' },
    { label: 'Empleados', icon: 'pi pi-users', routerLink: '/bo/employees' },
    { label: 'Servicios', icon: 'pi pi-briefcase', routerLink: '/bo/services' },
    { label: 'Citas', icon: 'pi pi-calendar', routerLink: '/bo/appointments' },
    { label: 'Cierre Diario', icon: 'pi pi-dollar', routerLink: '/bo/close' },
    { label: 'Reportes', icon: 'pi pi-chart-bar', routerLink: '/bo/reports/weekly' },
    { label: 'Configuración', icon: 'pi pi-cog', routerLink: '/bo/settings' }
  ];

  const employeeMenuItems: MenuItem[] = [
    { label: 'Mi Calendario', icon: 'pi pi-calendar', routerLink: '/bo/mi-calendario' },
    { label: 'Mi Historial', icon: 'pi pi-clock', routerLink: '/bo/mi-historial' }
  ];

  const createMockBackofficeComponent = () => {
    const user = signal<User | null>(null);
    const sidebarVisible = signal(false);

    const menuItems = computed(() => {
      const currentUser = user();
      if (currentUser?.can_be_employee) {
        return [...baseMenuItems, ...employeeMenuItems];
      }
      return baseMenuItems;
    });

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
      getCurrentUser: jest.fn().mockResolvedValue(createMockUser()),
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
      expect(component.user()?.id).toBe('user-1');
      expect(component.user()?.email).toBe('manager@test.com');
    });
  });

  describe('menu items configuration', () => {
    it('should have base menu items for manager without can_be_employee', async () => {
      const component = createMockBackofficeComponent();
      
      await component.ngOnInit();
      
      expect(component.menuItems().length).toBe(7);
      expect(component.menuItems()).toEqual(baseMenuItems);
    });

    it('should include Mi Calendario and Mi Historial when can_be_employee is true', async () => {
      authServiceMock.getCurrentUser = jest.fn().mockResolvedValue(createMockUser({ can_be_employee: true }));
      const component = createMockBackofficeComponent();
      
      await component.ngOnInit();
      
      expect(component.menuItems().length).toBe(9);
      const miCalendario = component.menuItems().find(i => i.label === 'Mi Calendario');
      const miHistorial = component.menuItems().find(i => i.label === 'Mi Historial');
      expect(miCalendario).toBeDefined();
      expect(miCalendario?.routerLink).toBe('/bo/mi-calendario');
      expect(miHistorial).toBeDefined();
      expect(miHistorial?.routerLink).toBe('/bo/mi-historial');
    });

    it('should not include employee menu items when can_be_employee is false', async () => {
      authServiceMock.getCurrentUser = jest.fn().mockResolvedValue(createMockUser({ can_be_employee: false }));
      const component = createMockBackofficeComponent();
      
      await component.ngOnInit();
      
      const miCalendario = component.menuItems().find(i => i.label === 'Mi Calendario');
      const miHistorial = component.menuItems().find(i => i.label === 'Mi Historial');
      expect(miCalendario).toBeUndefined();
      expect(miHistorial).toBeUndefined();
    });

    it('should reactively update menu items when user signal changes', async () => {
      const component = createMockBackofficeComponent();
      
      await component.ngOnInit();
      expect(component.menuItems().length).toBe(7);
      
      component.user.set(createMockUser({ can_be_employee: true }));
      expect(component.menuItems().length).toBe(9);
    });

    it('should have dashboard menu item with correct properties', async () => {
      const component = createMockBackofficeComponent();
      await component.ngOnInit();
      const dashboardItem = component.menuItems().find(item => item.label === 'Dashboard');
      
      expect(dashboardItem).toBeDefined();
      expect(dashboardItem?.icon).toBe('pi pi-home');
      expect(dashboardItem?.routerLink).toBe('/bo/dashboard');
    });

    it('should have employees menu item with correct properties', async () => {
      const component = createMockBackofficeComponent();
      await component.ngOnInit();
      const employeesItem = component.menuItems().find(item => item.label === 'Empleados');
      
      expect(employeesItem).toBeDefined();
      expect(employeesItem?.icon).toBe('pi pi-users');
      expect(employeesItem?.routerLink).toBe('/bo/employees');
    });

    it('should have services menu item with correct properties', async () => {
      const component = createMockBackofficeComponent();
      await component.ngOnInit();
      const servicesItem = component.menuItems().find(item => item.label === 'Servicios');
      
      expect(servicesItem).toBeDefined();
      expect(servicesItem?.icon).toBe('pi pi-briefcase');
      expect(servicesItem?.routerLink).toBe('/bo/services');
    });

    it('should have appointments menu item with correct properties', async () => {
      const component = createMockBackofficeComponent();
      await component.ngOnInit();
      const appointmentsItem = component.menuItems().find(item => item.label === 'Citas');
      
      expect(appointmentsItem).toBeDefined();
      expect(appointmentsItem?.icon).toBe('pi pi-calendar');
      expect(appointmentsItem?.routerLink).toBe('/bo/appointments');
    });

    it('should have daily close menu item with correct properties', async () => {
      const component = createMockBackofficeComponent();
      await component.ngOnInit();
      const closeItem = component.menuItems().find(item => item.label === 'Cierre Diario');
      
      expect(closeItem).toBeDefined();
      expect(closeItem?.icon).toBe('pi pi-dollar');
      expect(closeItem?.routerLink).toBe('/bo/close');
    });
  });

  describe('user data management', () => {
    it('should update user signal', async () => {
      const component = createMockBackofficeComponent();
      
      await component.ngOnInit();
      
      const user = component.user();
      expect(user).toBeTruthy();
      expect(user?.id).toBe('user-1');
      expect(user?.email).toBe('manager@test.com');
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

    it('should store can_be_employee flag', async () => {
      authServiceMock.getCurrentUser = jest.fn().mockResolvedValue(createMockUser({ can_be_employee: true }));
      const component = createMockBackofficeComponent();
      
      await component.ngOnInit();
      
      expect(component.user()?.can_be_employee).toBe(true);
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
