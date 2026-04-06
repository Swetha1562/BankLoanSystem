import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../shared/toast/toast.service';
 

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  registerData = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Customer'
  };
 
  submitted = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
 
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}
 
  isStrongPassword(password: string): boolean {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_\-+=])[A-Za-z\d@$!%*?&.#^()_\-+=]{8,}$/;
    return strongPasswordRegex.test(password);
  }
 
  register(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';
 
    if (
      !this.registerData.fullName.trim() ||
      !this.registerData.email.trim() ||
      !this.registerData.password.trim() ||
      !this.registerData.confirmPassword.trim() ||
      !this.registerData.role.trim()
    ) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }
 
    if (!this.isStrongPassword(this.registerData.password)) {
      this.errorMessage =
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';
      return;
    }
 
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
 
    this.isLoading = true;
 
    const payload = {
      fullName: this.registerData.fullName.trim(),
      email: this.registerData.email.trim(),
      password: this.registerData.password,
      role: this.registerData.role
    };
 
    this.authService.register(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.successMessage = res?.message || 'Registration successful. You can now log in.';
        this.errorMessage = '';
        this.toastService.show(this.successMessage, 'success');
 
        this.registerData = {
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'Customer'
        };
 
        this.submitted = false;
        this.showPassword = false;
        this.showConfirmPassword = false;
 
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.successMessage = '';
 
        this.errorMessage =
          typeof err.error === 'string'
            ? err.error
            : err.error?.message || 'Registration failed. Please try again.';
            this.toastService.show(this.errorMessage, 'error');
      }
    });
  }
}