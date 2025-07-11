import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { handleError } from '../../../shared/utils/error.utils';
import { ToastModule } from 'primeng/toast';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CardModule,
    CommonModule,
    ButtonModule,
    ReactiveFormsModule,
    ToastModule
  ],
  providers: [MessageService, { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    JwtHelperService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private  readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  loginForm!: FormGroup;
  authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private  readonly jwtHelper = inject(JwtHelperService);

  constructor(private readonly fb: FormBuilder) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token && !this.jwtHelper.isTokenExpired(token)) {
        this.router.navigate(['/']);
        return;
      }
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLogin() {
    if (!this.loginForm.valid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: (token: string) => {
        localStorage.setItem('token', token);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Inicio de sesión exitoso' });
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        let payload: any = err.error;
        if (typeof payload === 'string') {
          try {
            payload = JSON.parse(payload);
          } catch {
            if (err.status === 200) {
              localStorage.setItem('token', payload);
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Inicio de sesión exitoso' });
              this.router.navigate(['/']);
              return;
            }
          }
        }
        const fakeError = new HttpErrorResponse({
          error: payload,
          headers: err.headers,
          status: err.status,
          statusText: err.statusText,
          url: err.url ?? undefined
        });
        handleError(fakeError, this.messageService);
      }
    });
  }
}