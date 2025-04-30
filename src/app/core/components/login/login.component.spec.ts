import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login', 'register']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with login form active', () => {
    expect(component.isLoginActive).toBeTrue();
  });

  it('should toggle between login and register forms', () => {
    expect(component.isLoginActive).toBeTrue();
    component.toggleForm();
    expect(component.isLoginActive).toBeFalse();
    component.toggleForm();
    expect(component.isLoginActive).toBeTrue();
  });

  describe('Login Form', () => {
    it('should be invalid when empty', () => {
      expect(component.loginForm.valid).toBeFalsy();
    });

    it('should be invalid with invalid email', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.valid).toBeFalsy();
    });

    it('should be invalid with short password', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('12345');
      expect(passwordControl?.valid).toBeFalsy();
    });

    it('should be valid with correct credentials', () => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: '123456'
      });
      expect(component.loginForm.valid).toBeTrue();
    });

    it('should call login service and navigate on successful login', fakeAsync(() => {
      const mockToken = 'fake-jwt-token';
      authServiceSpy.login.and.returnValue(of(mockToken));

      component.loginForm.setValue({
        email: 'test@example.com',
        password: '123456'
      });

      component.onLogin();
      tick();

      expect(authServiceSpy.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: '123456'
      });
      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['main']);
    }));

    it('should handle login error', fakeAsync(() => {
      const consoleSpy = spyOn(console, 'error');
      authServiceSpy.login.and.returnValue(throwError(() => new Error('Login failed')));

      component.loginForm.setValue({
        email: 'test@example.com',
        password: '123456'
      });

      component.onLogin();
      tick();

      expect(consoleSpy).toHaveBeenCalled();
    }));

    it('should not call login service when form is invalid', () => {
      component.loginForm.setValue({
        email: 'invalid-email',
        password: '123'
      });

      component.onLogin();

      expect(authServiceSpy.login).not.toHaveBeenCalled();
    });

    it('should not mark form controls as touched when submitting invalid form', () => {
      const emailControl = component.loginForm.get('email');
      const passwordControl = component.loginForm.get('password');

      component.onLogin();

      expect(emailControl?.touched).toBeFalse();
      expect(passwordControl?.touched).toBeFalse();
    });
  });

  describe('Register Form', () => {
    it('should be invalid when empty', () => {
      expect(component.registerForm.valid).toBeFalsy();
    });

    it('should be valid with correct data', () => {
      component.registerForm.setValue({
        name: 'Test User',
        email: 'test@example.com',
        password: '123456'
      });
      expect(component.registerForm.valid).toBeTrue();
    });

    it('should call register service and toggle form on successful registration', fakeAsync(() => {
      authServiceSpy.register.and.returnValue(of({}));
      const consoleSpy = spyOn(console, 'log');

      // Establecer el formulario de registro como activo
      component.toggleForm();
      expect(component.isLoginActive).toBeFalse();

      component.registerForm.setValue({
        name: 'Test User',
        email: 'test@example.com',
        password: '123456'
      });

      component.onRegister();
      tick();

      expect(authServiceSpy.register).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: '123456'
      });
      expect(consoleSpy).toHaveBeenCalledWith('Registro exitoso', {});
      expect(component.isLoginActive).toBeTrue();
    }));

    it('should handle registration error', fakeAsync(() => {
      const consoleSpy = spyOn(console, 'error');
      authServiceSpy.register.and.returnValue(throwError(() => new Error('Registration failed')));

      component.registerForm.setValue({
        name: 'Test User',
        email: 'test@example.com',
        password: '123456'
      });

      component.onRegister();
      tick();

      expect(consoleSpy).toHaveBeenCalled();
    }));

    it('should not call register service when form is invalid', () => {
      component.registerForm.setValue({
        name: '',
        email: 'invalid-email',
        password: '123'
      });

      component.onRegister();

      expect(authServiceSpy.register).not.toHaveBeenCalled();
    });

    it('should mark form controls as touched when submitting invalid form', () => {
      const nameControl = component.registerForm.get('name');
      const emailControl = component.registerForm.get('email');
      const passwordControl = component.registerForm.get('password');

      component.onRegister();

      expect(nameControl?.touched).toBeTrue();
      expect(emailControl?.touched).toBeTrue();
      expect(passwordControl?.touched).toBeTrue();
    });

    it('should validate email format in register form', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.valid).toBeFalsy();
      expect(emailControl?.errors?.['email']).toBeTruthy();
    });

    it('should validate password length in register form', () => {
      const passwordControl = component.registerForm.get('password');
      passwordControl?.setValue('12345');
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.errors?.['minlength']).toBeTruthy();
    });
  });
});