import { ComponentFixture, TestBed, NO_ERRORS_SCHEMA } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { BackofficeComponent } from './backoffice.component';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

describe('BackofficeComponent - Behavior Driven Tests', () => {
  let component: BackofficeComponent;
  let fixture: ComponentFixture<BackofficeComponent>;
  let authServiceMock: jest.Mocked<AuthService>;
  let routerMock: jest.Mocked<Router>;

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


    await TestBed.configureTestingModule({
      imports: [BackofficeComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BackofficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }));

  describe('when manager accesses backoffice', () => {
    it('should display brand name', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('CitasYa');
    });

    it('should show manager role indicator', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Manager');
    });

    it('should load current user information', async () => {
      expect(authServiceMock.getCurrentUser).toHaveBeenCalled();
      expect(component.user()).toEqual(mockUser);
    }));

    it('should display user name in sidebar', async () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Manager Test');
    }));

    it('should display user email in sidebar', async () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('manager@test.com');
    }));
  });

  describe('navigation menu', () => {
    it('should display dashboard navigation item', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Dashboard');
    });

    it('should display employees navigation item', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Empleados');
    });

    it('should display services navigation item', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Servicios');
    });

    it('should display appointments navigation item', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Citas');
    });

    it('should display daily close navigation item', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Cierre Diario');
    });

    it('should have navigation links to all sections', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.querySelector('a[href="/bo/dashboard"]')).toBeTruthy();
      expect(compiled.querySelector('a[href="/bo/employees"]')).toBeTruthy();
      expect(compiled.querySelector('a[href="/bo/services"]')).toBeTruthy();
      expect(compiled.querySelector('a[href="/bo/appointments"]')).toBeTruthy();
      expect(compiled.querySelector('a[href="/bo/close"]')).toBeTruthy();
    });

    it('should highlight active navigation item', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      // Check that RouterLinkActive directive is present
      const navItems = compiled.querySelectorAll('a[routerlinkactive]');
      expect(navItems.length).toBeGreaterThan(0);
    });
  });

  describe('logout functionality', () => {
    it('should display logout button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Cerrar Sesión');
    });

    it('should call signOut when clicking logout', fakeAsync(async () => {
      await component.logout();
      // tick replaced by await

      expect(authServiceMock.signOut).toHaveBeenCalled();
    }));

    it('should navigate to login after logout', fakeAsync(async () => {
      await component.logout();
      // tick replaced by await

      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    }));
  });

  describe('mobile responsiveness', () => {
    it('should have sidebar visibility toggle', () => {
      expect(component.sidebarVisible()).toBeDefined();
    });

    it('should toggle sidebar visibility', () => {
      component.sidebarVisible.set(true);
      expect(component.sidebarVisible()).toBe(true);

      component.sidebarVisible.set(false);
      expect(component.sidebarVisible()).toBe(false);
    });
  });

  describe('router outlet', () => {
    it('should contain router outlet for child routes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('router-outlet')).toBeTruthy();
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
});