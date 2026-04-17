import { Routes } from '@angular/router';

export const SUPERADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'management',
    pathMatch: 'full'
  },
  {
    path: 'management',
    loadComponent: () => import('./central-management/central-management.component').then(m => m.CentralManagementComponent)
  },
  {
    path: 'plans',
    loadComponent: () => import('./plans/superadmin-plans.component').then(m => m.SuperadminPlansComponent)
  },
  {
    path: 'transactions',
    loadComponent: () => import('./transactions/superadmin-transactions.component').then(m => m.SuperadminTransactionsComponent)
  }
];
