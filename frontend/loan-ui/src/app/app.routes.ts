import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard';
import { OfficerDashboardComponent } from './officer-dashboard/officer-dashboard';
import { ApplyLoanComponent } from './apply-loan/apply-loan';
import { MyLoansComponent } from './my-loans/my-loans';
import { AllLoansComponent } from './all-loans/all-loans';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'customer-dashboard', component: CustomerDashboardComponent },
  { path: 'officer-dashboard', component: OfficerDashboardComponent },
  { path: 'apply-loan', component: ApplyLoanComponent },
  { path: 'my-loans', component: MyLoansComponent },
  { path: 'all-loans', component: AllLoansComponent },
  { path: '**', redirectTo: 'login' }
];