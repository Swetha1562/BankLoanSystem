import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  role = 'Customer';
  message = '';
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister(): void {
    this.message = '';
    this.errorMessage = '';
    this.isSubmitting = true;

    const userData = {
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      role: this.role
    };

    this.authService.register(userData).subscribe({
      next: (res) => {
        console.log('Register success:', res);
        this.isSubmitting = false;
        this.message = res?.message || 'Registration successful.';
        alert(this.message);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Register error:', err);
        this.isSubmitting = false;
        this.errorMessage =
          err?.error?.message ||
          err?.error ||
          'Registration failed.';
        alert(this.errorMessage);
      }
    });
  }
}