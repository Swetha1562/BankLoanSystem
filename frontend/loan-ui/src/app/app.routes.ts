import { Routes } from '@angular/router';
 
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.HomeComponent)
  },

  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then(m => m.ContactComponent)
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
  {
    path: 'customer-dashboard',
    loadComponent: () =>
      import('./customer-dashboard/customer-dashboard').then(m => m.CustomerDashboardComponent)
  },
  {
    path: 'officer-dashboard',
    loadComponent: () =>
      import('./officer-dashboard/officer-dashboard').then(m => m.OfficerDashboardComponent)
  },
  {
    path: 'apply-loan',
    loadComponent: () =>
      import('./apply-loan/apply-loan').then(m => m.ApplyLoanComponent)
  },
  {
    path: 'my-loans',
    loadComponent: () =>
      import('./my-loans/my-loans').then(m => m.MyLoansComponent)
  },
  {
    path: 'all-loans',
    loadComponent: () =>
      import('./all-loans/all-loans').then(m => m.AllLoansComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./reset-password/reset-password').then(m => m.ResetPasswordComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
 


/*import { Routes } from '@angular/router';
 
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.HomeComponent)
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
  {
    path: 'customer-dashboard',
    loadComponent: () =>
      import('./customer-dashboard/customer-dashboard').then(m => m.CustomerDashboardComponent)
  },
  {
    path: 'officer-dashboard',
    loadComponent: () =>
      import('./officer-dashboard/officer-dashboard').then(m => m.OfficerDashboardComponent)
  },
  {
    path: 'apply-loan',
    loadComponent: () =>
      import('./apply-loan/apply-loan').then(m => m.ApplyLoanComponent)
  },
  {
    path: 'my-loans',
    loadComponent: () =>
      import('./my-loans/my-loans').then(m => m.MyLoansComponent)
  },
  {
    path: 'all-loans',
    loadComponent: () =>
      import('./all-loans/all-loans').then(m => m.AllLoansComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./reset-password/reset-password').then(m => m.ResetPasswordComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];*/