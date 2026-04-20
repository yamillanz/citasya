import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return async () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    const user = await authService.getCurrentUser();
    if (!user) {
      router.navigate(['/login']);
      return false;
    }
    
    if (allowedRoles.includes(user.role)) {
      return true;
    }
    
    router.navigate(['/unauthorized']);
    return false;
  };
};

export const managerGuard: CanActivateFn = roleGuard(['manager', 'superadmin']);
export const employeeGuard: CanActivateFn = roleGuard(['employee', 'manager', 'superadmin']);
export const superadminGuard: CanActivateFn = roleGuard(['superadmin']);

export const canBeEmployeeGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = await authService.getCurrentUser();
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (user.can_be_employee) {
    return true;
  }

  router.navigate(['/bo/dashboard']);
  return false;
};
