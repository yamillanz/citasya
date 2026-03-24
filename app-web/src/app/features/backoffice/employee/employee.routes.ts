import { Routes } from '@angular/router';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'calendar',
    pathMatch: 'full'
  },
  {
    path: 'calendar',
    loadComponent: () => import('./calendar/employee-calendar.component').then(m => m.EmployeeCalendarComponent)
  },
  {
    path: 'history',
    loadComponent: () => import('./history/employee-history.component').then(m => m.EmployeeHistoryComponent)
  }
];
