import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { managerGuard, employeeGuard } from './core/guards/role.guard';
import { superadminGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Landing pages (public)
  {
    path: '',
    loadChildren: () => import('./features/landing/landing.routes')
      .then(m => m.LANDING_ROUTES)
  },
  // Legacy routes for landing (for SEO/backward compatibility)
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/components/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'appointments',
    loadComponent: () => import('./features/appointments/appointments.component')
      .then(m => m.AppointmentsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component')
      .then(m => m.AdminComponent),
    canActivate: [authGuard, superadminGuard]
  },
  {
    path: 'companies',
    loadComponent: () => import('./features/companies/companies.component')
      .then(m => m.CompaniesComponent),
    canActivate: [authGuard, managerGuard]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/unauthorized/unauthorized.component')
      .then(m => m.UnauthorizedComponent)
  },
  {
    path: 'not-found',
    loadComponent: () => import('./features/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  },
  {
    path: 'c/:companySlug',
    loadComponent: () => import('./features/public/company-list/company-list.component')
      .then(m => m.CompanyListComponent)
  },
  {
    path: 'c/:companySlug/e/:employeeId',
    loadComponent: () => import('./features/public/employee-calendar/employee-calendar.component')
      .then(m => m.EmployeeCalendarComponent)
  },
  {
    path: 'c/:companySlug/e/:employeeId/book',
    loadComponent: () => import('./features/public/booking-form/booking-form.component')
      .then(m => m.BookingFormComponent)
  },
  // Back Office Manager routes
  {
    path: 'bo',
    loadComponent: () => import('./features/backoffice/backoffice.component')
      .then(m => m.BackofficeComponent),
    canActivate: [authGuard, managerGuard],
    loadChildren: () => import('./features/backoffice/manager/manager.routes')
      .then(m => m.MANAGER_ROUTES)
  },
  // Back Office Employee routes
  {
    path: 'emp',
    loadComponent: () => import('./features/backoffice/employee/employee-layout.component')
      .then(m => m.EmployeeLayoutComponent),
    canActivate: [authGuard, employeeGuard],
    loadChildren: () => import('./features/backoffice/employee/employee.routes')
      .then(m => m.EMPLOYEE_ROUTES)
  },
  // Back Office Superadmin routes
  {
    path: 'sa',
    loadComponent: () => import('./features/backoffice/superadmin/superadmin-layout.component')
      .then(m => m.SuperadminLayoutComponent),
    canActivate: [authGuard, superadminGuard],
    loadChildren: () => import('./features/backoffice/superadmin/superadmin.routes')
      .then(m => m.SUPERADMIN_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'not-found'
  }
];
