import { Routes } from '@angular/router';

export const MANAGER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'employees',
    loadComponent: () => import('./employees/employees.component').then(m => m.EmployeesComponent)
  },
  {
    path: 'employees/:id',
    loadComponent: () => import('./employees/employee-form/employee-form.component').then(m => m.EmployeeFormComponent)
  },
  {
    path: 'services',
    loadComponent: () => import('./services/services.component').then(m => m.ServicesComponent)
  },
  {
    path: 'services/:id',
    loadComponent: () => import('./services/service-form/service-form.component').then(m => m.ServiceFormComponent)
  },
  {
    path: 'appointments',
    loadComponent: () => import('./appointments/appointments.component').then(m => m.AppointmentsComponent)
  },
  {
    path: 'close',
    loadComponent: () => import('./daily-close/daily-close.component').then(m => m.DailyCloseComponent)
  },
  {
    path: 'reports/weekly',
    loadComponent: () => import('./reports/weekly/weekly-report.component').then(m => m.WeeklyReportComponent)
  }
];
