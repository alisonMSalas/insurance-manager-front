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
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });

  it('should initialize form with empty values', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should not login with invalid form', () => {
    component.loginForm.setValue({ email: '', password: '' });
    component.onLogin();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should not login with invalid email', () => {
    component.loginForm.setValue({ email: 'invalid-email', password: '123456' });
    component.onLogin();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should not login with short password', () => {
    component.loginForm.setValue({ email: 'test@example.com', password: '12345' });
    component.onLogin();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should login successfully and navigate', fakeAsync(() => {
    const token = 'mock-token';
    authServiceSpy.login.and.returnValue(of(token));

    component.loginForm.setValue({ email: 'test@example.com', password: '123456' });
    component.onLogin();
    tick();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: '123456'
    });
    expect(localStorage.getItem('token')).toBe(token);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/insurance']);
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Inicio de sesión exitoso'
    });
  }));

  it('should handle login error with error message', fakeAsync(() => {
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

    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Invalid credentials'
    });
  }));

  it('should handle login error with string response', fakeAsync(() => {
    const token = 'mock-token';
    authServiceSpy.login.and.returnValue(throwError(() => token));

    component.loginForm.setValue({ email: 'test@example.com', password: '123456' });
    component.onLogin();
    tick();

    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBe(token);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/insurance']);
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Inicio de sesión exitoso'
    });
  }));

  it('should handle login error with invalid JSON string', fakeAsync(() => {
    const invalidJson = 'invalid-json';
    authServiceSpy.login.and.returnValue(throwError(() => invalidJson));

    component.loginForm.setValue({ email: 'test@example.com', password: '123456' });
    component.onLogin();
    tick();

    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error en el servidor'
    });
  }));

  it('should redirect to insurance if valid token exists', fakeAsync(() => {
    const validToken = 'valid-token';
    localStorage.setItem('token', validToken);
    jwtHelperSpy.isTokenExpired.and.returnValue(Promise.resolve(false));

    component.ngOnInit();
    tick();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/insurance']);
  }));

  it('should not redirect if token is expired', fakeAsync(() => {
    const expiredToken = 'expired-token';
    localStorage.setItem('token', expiredToken);
    jwtHelperSpy.isTokenExpired.and.returnValue(Promise.resolve(true));

    component.ngOnInit();
    tick();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  }));

  it('should not redirect if no token exists', () => {
    localStorage.removeItem('token');
    component.ngOnInit();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
 });
