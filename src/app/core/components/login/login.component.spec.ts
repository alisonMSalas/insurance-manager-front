import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import * as errorUtils from '../../../shared/utils/error.utils';

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
      imports: [ReactiveFormsModule, LoginComponent],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: JwtHelperService, useValue: jwtHelperSpy },
        { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
        { provide: 'PLATFORM_ID', useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize loginForm with empty values', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.value).toEqual({ email: '', password: '' });
  });

  it('should not call login if form is invalid', () => {
    component.loginForm.setValue({ email: '', password: '' });
    component.onLogin();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should login and navigate on success', fakeAsync(() => {
    component.loginForm.setValue({ email: 'test@mail.com', password: '123456' });
    authServiceSpy.login.and.returnValue(of('token123'));
    component.onLogin();
    tick();
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'token123');
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/insurance']);
  }));

  it('should handle error with string payload and status 200', fakeAsync(() => {
    component.loginForm.setValue({ email: 'test@mail.com', password: '123456' });
    const error = new HttpErrorResponse({ error: 'tokenString', status: 200 });
    authServiceSpy.login.and.returnValue(throwError(() => error));
    component.onLogin();
    tick();
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'tokenString');
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/insurance']);
  }));

  it('should handle error with JSON string payload', fakeAsync(() => {
    component.loginForm.setValue({ email: 'test@mail.com', password: '123456' });
    const errorPayload = JSON.stringify({ message: 'Invalid credentials' });
    const error = new HttpErrorResponse({ error: errorPayload, status: 401 });
    spyOn<any>(component, 'authService').and.returnValue(authServiceSpy);
    spyOn<any>(component, 'messageService').and.returnValue(messageServiceSpy);
    spyOn<any>(component, 'router').and.returnValue(routerSpy);
    spyOn<any>(component, 'jwtHelper').and.returnValue(jwtHelperSpy);
    spyOn<any>(component, 'platformId').and.returnValue('browser');
    spyOn<any>(component, 'fb').and.returnValue(new FormBuilder());
    spyOn<any>(component, 'loginForm').and.returnValue(component.loginForm);

   
    authServiceSpy.login.and.returnValue(throwError(() => error));
    component.onLogin();
    tick();
   
  }));

  it('should redirect if token exists and is not expired', () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue('token123');
  jwtHelperSpy.isTokenExpired.and.returnValue(Promise.resolve(false));

    component.ngOnInit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/insurance']);
  });

  it('should not redirect if token is expired', () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue('token123');
   jwtHelperSpy.isTokenExpired.and.returnValue(Promise.resolve(true));

    component.ngOnInit();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
  it('should handle error with JSON string payload', fakeAsync(() => {
  component.loginForm.setValue({ email: 'test@mail.com', password: '123456' });
  const errorPayload = JSON.stringify({ message: 'Invalid credentials' });
  const error = new HttpErrorResponse({ error: errorPayload, status: 401 });
  authServiceSpy.login.and.returnValue(throwError(() => error));
  spyOn(errorUtils, 'handleError');
  expect(errorUtils.handleError).toHaveBeenCalled();
  component.onLogin();
  tick();
  expect(errorUtils.handleError).toHaveBeenCalled();
}));

it('should redirect if token exists and is not expired', fakeAsync(() => {
  (localStorage.getItem as jasmine.Spy).and.returnValue('token123');
  jwtHelperSpy.isTokenExpired.and.returnValue(Promise.resolve(false));

  component.ngOnInit();
  tick();
  expect(routerSpy.navigate).toHaveBeenCalledWith(['/insurance']);
}));

it('should not redirect if token is expired', fakeAsync(() => {
  (localStorage.getItem as jasmine.Spy).and.returnValue('token123');
  jwtHelperSpy.isTokenExpired.and.returnValue(Promise.resolve(true));

  component.ngOnInit();
  tick();
  expect(routerSpy.navigate).not.toHaveBeenCalled();
}));

it('should create fakeError and call handleError for error with object payload', fakeAsync(() => {
  component.loginForm.setValue({ email: 'test@mail.com', password: '123456' });

  // Simular payload tipo objeto (no string ni status 200)
  const payloadObj = { message: 'Invalid credentials' };
  const originalError = new HttpErrorResponse({
    error: payloadObj,
    status: 401,
    statusText: 'Unauthorized',
    url: 'some-url'
  });

  authServiceSpy.login.and.returnValue(throwError(() => originalError));
  spyOn(errorUtils, 'handleError');

  component.onLogin();
  tick();

  // Verificar que handleError se haya llamado con un HttpErrorResponse que tenga el mismo payload
  expect(errorUtils.handleError).toHaveBeenCalled();

  // Opcional: para verificar el argumento exacto:
  const calledArg = (errorUtils.handleError as jasmine.Spy).calls.mostRecent().args[0];
  expect(calledArg instanceof HttpErrorResponse).toBeTrue();
  expect(calledArg.error).toEqual(payloadObj);
  expect(calledArg.status).toBe(401);
  expect(calledArg.statusText).toBe('Unauthorized');
  expect(calledArg.url).toBe('some-url');

  // Verificar que messageService haya sido pasado también
  expect((errorUtils.handleError as jasmine.Spy).calls.mostRecent().args[1]).toBe(messageServiceSpy);
}));
it('should redirect if token exists and is not expired', () => {
  // Simulamos que hay un token en localStorage
  (localStorage.getItem as jasmine.Spy).and.returnValue('token123');
  // Simulamos que el token NO está expirado
  jwtHelperSpy.isTokenExpired.and.returnValue(Promise.resolve(false));


  component.ngOnInit();

  expect(routerSpy.navigate).toHaveBeenCalledWith(['/insurance']);
});
it('should initialize loginForm if token does not exist or is expired', () => {
  (localStorage.getItem as jasmine.Spy).and.returnValue(null);
jwtHelperSpy.isTokenExpired.and.returnValue(Promise.resolve(true));
 // token expirado o no existe

  component.ngOnInit();

  expect(routerSpy.navigate).not.toHaveBeenCalled();
  expect(component.loginForm).toBeDefined();
});


});