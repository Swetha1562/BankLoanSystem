import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },

  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'customer-dashboard',
        loadComponent: () =>
          import('./customer-dashboard/customer-dashboard').then(
            m => m.CustomerDashboardComponent
          )
      },
      {
        path: 'officer-dashboard',
        loadComponent: () =>
          import('./officer-dashboard/officer-dashboard').then(
            m => m.OfficerDashboardComponent
          )
      },
      {
        path: 'apply-loan',
        loadComponent: () =>
          import('./apply-loan/apply-loan').then(
            m => m.ApplyLoanComponent
          )
      },
      {
        path: 'my-loans',
        loadComponent: () =>
          import('./my-loans/my-loans').then(
            m => m.MyLoansComponent
          )
      },
      {
        path: 'all-loans',
        loadComponent: () =>
          import('./all-loans/all-loans').then(
            m => m.AllLoansComponent
          )
      }
    ]
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register').then(m => m.RegisterComponent)
  },

  { path: '**', redirectTo: '' }
];