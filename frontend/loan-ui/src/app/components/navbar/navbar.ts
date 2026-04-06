import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
 
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  currentUrl = '';
 
  constructor(public router: Router) {
    this.currentUrl = this.router.url;
 
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects;
      });
  }
 
  get showNavbar(): boolean {
    const visibleRoutes = [
      '/',
      '/home',
      '/about',
      '/contact',
      '/login',
      '/register',
      '/customer-dashboard',
      '/officer-dashboard',
      '/apply-loan',
      '/my-loans',
      '/all-loans'
    ];
 
    return visibleRoutes.includes(this.currentUrl);
  }
 
  get showAuthButtons(): boolean {
    return this.currentUrl === '/' || this.currentUrl === '/home';
  }
 
  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}