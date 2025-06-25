import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { JWT_OPTIONS } from '@auth0/angular-jwt';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Validators } from '@angular/forms';
import { fakeAsync, tick } from '@angular/core/testing';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockJwtHelper: jasmine.SpyObj<JwtHelperService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);
    mockJwtHelper = jasmine.createSpyObj('JwtHelperService', ['isTokenExpired']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule
      ],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: MessageService, useValue: mockMessageService },
        { provide: JwtHelperService, useValue: mockJwtHelper },
        { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem');
    
    // Inicializar el formulario antes de detectar cambios
    component.loginForm = new FormBuilder().group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar el formulario correctamente', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')).toBeDefined();
    expect(component.loginForm.get('password')).toBeDefined();
  });

  it('debe validar email requerido', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBeTrue();
  });

  it('debe validar formato de email', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTrue();
  });

  it('debe validar password requerido', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('');
    expect(passwordControl?.hasError('required')).toBeTrue();
  });

  it('debe validar longitud mínima de password', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('12345');
    expect(passwordControl?.hasError('minlength')).toBeTrue();
  });

  it('debe navegar a home si ya hay token válido', () => {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    (localStorage.getItem as jasmine.Spy).and.returnValue(validToken);
    mockJwtHelper.isTokenExpired.and.returnValue(Promise.resolve(false));

    // Recrear el componente para que se ejecute ngOnInit
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    
    // Inicializar el formulario
    component.loginForm = new FormBuilder().group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    
    fixture.detectChanges();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('debe hacer login exitoso', fakeAsync(() => {
    const mockToken = 'mock-jwt-token';
    mockAuthService.login.and.returnValue(of(mockToken));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onLogin();
    tick();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Inicio de sesión exitoso'
    });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('debe manejar error de login', () => {
    const errorResponse = new HttpErrorResponse({
      error: { message: 'Credenciales inválidas' },
      status: 401,
      statusText: 'Unauthorized'
    });
    mockAuthService.login.and.returnValue(throwError(() => errorResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'wrongpassword'
    });

    component.onLogin();

    expect(mockAuthService.login).toHaveBeenCalled();
  });

  it('debe manejar respuesta exitosa como string', fakeAsync(() => {
    const mockToken = 'mock-jwt-token';
    const errorResponse = new HttpErrorResponse({
      error: mockToken,
      status: 200,
      statusText: 'OK'
    });
    mockAuthService.login.and.returnValue(throwError(() => errorResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onLogin();
    tick();

    expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Inicio de sesión exitoso'
    });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('debe manejar error de parsing JSON', () => {
    const errorResponse = new HttpErrorResponse({
      error: 'invalid json string',
      status: 400,
      statusText: 'Bad Request'
    });
    mockAuthService.login.and.returnValue(throwError(() => errorResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onLogin();

    expect(mockAuthService.login).toHaveBeenCalled();
  });

  it('no debe hacer login si el formulario es inválido', () => {
    component.loginForm.patchValue({
      email: 'invalid-email',
      password: '123'
    });

    component.onLogin();

    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('debe manejar error con payload complejo', () => {
    const complexError = {
      message: 'Error complejo',
      details: ['detalle1', 'detalle2'],
      code: 'AUTH_001'
    };
    const errorResponse = new HttpErrorResponse({
      error: complexError,
      status: 500,
      statusText: 'Internal Server Error'
    });
    mockAuthService.login.and.returnValue(throwError(() => errorResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onLogin();

    expect(mockAuthService.login).toHaveBeenCalled();
  });

  it('debe manejar error con status 200 pero payload no parseable', fakeAsync(() => {
    const errorResponse = new HttpErrorResponse({
      error: 'not a valid token',
      status: 200,
      statusText: 'OK'
    });
    mockAuthService.login.and.returnValue(throwError(() => errorResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onLogin();
    tick();

    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'not a valid token');
  }));

  it('debe manejar error con payload JSON válido', () => {
    const jsonError = JSON.stringify({ message: 'Error JSON válido' });
    const errorResponse = new HttpErrorResponse({
      error: jsonError,
      status: 400,
      statusText: 'Bad Request'
    });
    mockAuthService.login.and.returnValue(throwError(() => errorResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onLogin();

    expect(mockAuthService.login).toHaveBeenCalled();
  });

  it('debe manejar error con headers y URL', () => {
    const errorResponse = new HttpErrorResponse({
      error: { message: 'Error con headers' },
      status: 403,
      statusText: 'Forbidden',
      headers: new HttpHeaders({ 'content-type': 'application/json' }),
      url: 'http://localhost:3000/api/auth/login'
    });
    mockAuthService.login.and.returnValue(throwError(() => errorResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onLogin();

    expect(mockAuthService.login).toHaveBeenCalled();
  });

  it('debe manejar error con URL undefined', () => {
    const errorResponse = new HttpErrorResponse({
      error: { message: 'Error sin URL' },
      status: 500,
      statusText: 'Internal Server Error',
      url: undefined
    });
    mockAuthService.login.and.returnValue(throwError(() => errorResponse));

    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onLogin();

    expect(mockAuthService.login).toHaveBeenCalled();
  });

  it('debe manejar token expirado en ngOnInit', () => {
    const expiredToken = 'expired-token';
    (localStorage.getItem as jasmine.Spy).and.returnValue(expiredToken);
    mockJwtHelper.isTokenExpired.and.returnValue(Promise.resolve(true));

    // Recrear el componente para que se ejecute ngOnInit
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    
    // Inicializar el formulario
    component.loginForm = new FormBuilder().group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    
    fixture.detectChanges();

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('debe manejar plataforma no browser en ngOnInit', () => {
    // Cambiar PLATFORM_ID a 'server'
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    
    // Recrear el componente
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    
    // Inicializar el formulario
    component.loginForm = new FormBuilder().group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    
    fixture.detectChanges();

    expect(localStorage.getItem).not.toHaveBeenCalled();
  });
});