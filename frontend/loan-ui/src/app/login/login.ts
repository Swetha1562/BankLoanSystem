import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../shared/toast/toast.service';
 
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  message = '';
  showPassword = false;
 
  showForgotPopup = false;
  forgotEmail = '';
  forgotError = '';
 
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}
 
  login(): void {
    this.message = '';
 
    const payload = {
      email: this.email.trim().toLowerCase(),
      password: this.password
    };
 
    this.authService.login(payload).subscribe({
      next: (res: any) => {
        this.authService.saveToken(res.token);
        this.toastService.show('Login successful', 'success');
 
        const role = this.authService.getUserRole();
 
        if (role === 'Officer') {
          this.router.navigate(['/officer-dashboard']);
        } else {
          this.router.navigate(['/customer-dashboard']);
        }
      },
      error: (err: any) => {
        this.message = err?.error?.message || 'Login failed. Please try again.';
        this.toastService.show(this.message, 'error');
      }
    });
  }
 
  openForgotPopup(): void {
    this.showForgotPopup = true;
    this.forgotEmail = '';
    this.forgotError = '';
  }
 
  closeForgotPopup(): void {
    this.showForgotPopup = false;
    this.forgotEmail = '';
    this.forgotError = '';
  }
 
  verifyForgotEmail(): void {
    this.forgotError = '';
 
    const normalizedEmail = this.forgotEmail.trim().toLowerCase();
 
    if (!normalizedEmail) {
      this.forgotError = 'Please enter your registered email.';
      return;
    }
 
    this.authService.forgotPassword({ email: normalizedEmail }).subscribe({
      next: (res: any) => {
        const verifiedEmail = res?.email || normalizedEmail;
        this.closeForgotPopup();
 
        this.router.navigate(['/reset-password'], {
          queryParams: { email: verifiedEmail }
        });
      },
      error: (err: any) => {
        this.forgotError = err?.error?.message || 'No account found with this email.';
      }
    });
  }
}
 






/*import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../shared/toast/toast.service';
 
 
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  message = '';
  showPassword = false;
 
  showForgotPopup = false;
  forgotEmail = '';
  forgotError = '';
 
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
 
  ) {}
 
  login(): void {
    this.message = '';
 
    const payload = {
      email: this.email.trim().toLowerCase(),
      password: this.password
    };
 
    this.authService.login(payload).subscribe({
      next: (res: any) => {
        this.authService.saveToken(res.token);
        this.toastService.show('Login successful', 'success');
 
        const role = this.authService.getUserRole();
 
        if (role === 'Officer') {
          this.router.navigate(['/officer-dashboard']);
        } else {
          this.router.navigate(['/customer-dashboard']);
        }
      },
      error: (err: any) => {
        this.message = err?.error || 'Login failed. Please try again.';
        this.toastService.show(this.message, 'error');
      }
    });
  }
 
  openForgotPopup(): void {
    this.showForgotPopup = true;
    this.forgotEmail = '';
    this.forgotError = '';
  }
 
  closeForgotPopup(): void {
    this.showForgotPopup = false;
    this.forgotEmail = '';
    this.forgotError = '';
  }
 
  verifyForgotEmail(): void {
    this.forgotError = '';
 
    const normalizedEmail = this.forgotEmail.trim().toLowerCase();
 
    if (!normalizedEmail) {
      this.forgotError = 'Please enter your registered email.';
      return;
    }
 
    this.authService.forgotPassword({ email: normalizedEmail }).subscribe({
      next: (res: any) => {
        const verifiedEmail = res?.email || normalizedEmail;
        this.closeForgotPopup();
 
        this.router.navigate(['/reset-password'], {
          queryParams: { email: verifiedEmail }
        });
      },
      error: (err: any) => {
        this.forgotError = err?.error?.message || 'No account found with this email.';
      }
    });
  }
}*/