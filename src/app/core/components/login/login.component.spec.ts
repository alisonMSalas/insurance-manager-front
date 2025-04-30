import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { PLATFORM_ID } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let jwtHelperSpy: jasmine.SpyObj<JwtHelperService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    jwtHelperSpy = jasmine.createSpyObj('JwtHelperService', ['isTokenExpired']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
        { provide: JwtHelperService, useValue: jwtHelperSpy },
        { provide: PLATFORM_ID, useValue: 'browser' } // Simula ejecución en el navegador
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not login with invalid form', () => {
    component.loginForm.setValue({ email: '', password: '' });
    component.onLogin();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should login successfully and navigate', fakeAsync(() => {
    const token = 'mock-token';
    authServiceSpy.login.and.returnValue(of(token));

    component.loginForm.setValue({ email: 'test@example.com', password: '123456' });

    component.onLogin();
    tick();

    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBe(token);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/insurance']);
    expect(messageServiceSpy.add).toHaveBeenCalled();
  }));

  it('should handle login error gracefully', fakeAsync(() => {
    const error = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      url: '/auth/login',
      error: { message: 'Invalid credentials' }
    });

    authServiceSpy.login.and.returnValue(throwError(() => error));

    component.loginForm.setValue({ email: 'test@example.com', password: 'wrongpass' });
    component.onLogin();
    tick();

    // Este test no espera una acción concreta, pero asegura que no explota.
    expect(authServiceSpy.login).toHaveBeenCalled();
  }));
});
