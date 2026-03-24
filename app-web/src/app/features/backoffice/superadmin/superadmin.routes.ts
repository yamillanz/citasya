import { Routes } from '@angular/router';

export const SUPERADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'companies',
    pathMatch: 'full'
  },
  {
    path: 'companies',
    loadComponent: () => import('./companies/superadmin-companies.component').then(m => m.SuperadminCompaniesComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./users/superadmin-users.component').then(m => m.SuperadminUsersComponent)
  },
  {
    path: 'plans',
    loadComponent: () => import('./plans/superadmin-plans.component').then(m => m.SuperadminPlansComponent)
  }
];
