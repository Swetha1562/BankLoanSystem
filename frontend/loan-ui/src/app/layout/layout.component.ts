import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent implements OnInit {
  isCustomer = false;
  isOfficer = false;

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        const role =
          payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
          payload['role'];

        this.isCustomer = role === 'Customer';
        this.isOfficer = role === 'Officer';
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }
}