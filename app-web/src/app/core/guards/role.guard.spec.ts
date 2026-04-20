import { canBeEmployeeGuard, roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { TestBed } from '@angular/core/testing';

describe('Role Guards - canBeEmployeeGuard', () => {
  let authServiceMock: jest.Mocked<AuthService>;
  let routerMock: { navigate: jest.Mock };

  const managerWithFlag: User = {
    id: 'user-1',
    email: 'manager@test.com',
    full_name: 'Manager Test',
    role: 'manager',
    company_id: 'company-1',
    can_be_employee: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const managerWithoutFlag: User = {
    id: 'user-2',
    email: 'manager2@test.com',
    full_name: 'Manager No Emp',
    role: 'manager',
    company_id: 'company-1',
    can_be_employee: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const employeeUser: User = {
    id: 'user-3',
    email: 'emp@test.com',
    full_name: 'Empleado Test',
    role: 'employee',
    company_id: 'company-1',
    can_be_employee: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  beforeEach(() => {
    authServiceMock = {
      getCurrentUser: jest.fn()
    } as any;

    routerMock = {
      navigate: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  describe('canBeEmployeeGuard', () => {
    it('should allow access when user has can_be_employee=true', async () => {
      authServiceMock.getCurrentUser = jest.fn().mockResolvedValue(managerWithFlag);

      const result = await TestBed.runInInjectionContext(() => canBeEmployeeGuard(null!, null!));

      expect(result).toBe(true);
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to dashboard when user has can_be_employee=false', async () => {
      authServiceMock.getCurrentUser = jest.fn().mockResolvedValue(managerWithoutFlag);

      const result = await TestBed.runInInjectionContext(() => canBeEmployeeGuard(null!, null!));

      expect(result).toBe(false);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/bo/dashboard']);
    });

    it('should redirect to login when user is null', async () => {
      authServiceMock.getCurrentUser = jest.fn().mockResolvedValue(null);

      const result = await TestBed.runInInjectionContext(() => canBeEmployeeGuard(null!, null!));

      expect(result).toBe(false);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should deny access for employee without can_be_employee', async () => {
      authServiceMock.getCurrentUser = jest.fn().mockResolvedValue(employeeUser);

      const result = await TestBed.runInInjectionContext(() => canBeEmployeeGuard(null!, null!));

      expect(result).toBe(false);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/bo/dashboard']);
    });
  });
});
