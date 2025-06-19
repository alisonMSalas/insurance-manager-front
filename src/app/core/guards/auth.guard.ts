import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private readonly jwtHelper = new JwtHelperService();

  constructor(private readonly router: Router) { }

  canActivate(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      this.router.navigate(['/login']);
      return false;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    if (this.jwtHelper.isTokenExpired(token)) {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
} 