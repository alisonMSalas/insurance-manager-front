import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { ApiClientService } from '../../api/httpclient';
import { Menu } from 'primeng/menu';
import { By } from '@angular/platform-browser';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(async () => {
    const router = jasmine.createSpyObj('Router', ['navigate']);
    const apiClient = jasmine.createSpyObj('ApiClientService', ['getCurrentUserEmail']);
    const storage = jasmine.createSpyObj('localStorage', ['removeItem']);

    Object.defineProperty(window, 'localStorage', { value: storage });

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        AvatarModule,
        InputTextModule,
        MenuModule,
        ButtonModule,
        HeaderComponent
      ],
      providers: [
        { provide: Router, useValue: router },
        { provide: ApiClientService, useValue: apiClient }
      ]
    }).compileComponents();

    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    apiClientSpy = TestBed.inject(ApiClientService) as jasmine.SpyObj<ApiClientService>;
    localStorageSpy = window.localStorage as jasmine.SpyObj<Storage>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.pageTitle).toBe('Gestión de Seguros');
    expect(component.pageSubtitle).toBe('Administra y revisa todas las pólizas de seguros');
    expect(component.searchQuery).toBe('');
    expect(component.user).toEqual({
      name: 'Usuario',
      role: 'Agente de Seguros',
      icon: 'pi pi-user'
    });
  });

  it('should update user name when email is available', () => {
    const testEmail = 'test@example.com';
    apiClientSpy.getCurrentUserEmail.and.returnValue(testEmail);

    component.ngOnInit();

    expect(component.user.name).toBe(testEmail);
  });

  it('should keep default user name when email is not available', () => {
    apiClientSpy.getCurrentUserEmail.and.returnValue(null);

    component.ngOnInit();

    expect(component.user.name).toBe('Usuario');
  });

  it('should have logout menu item', () => {
    expect(component.menuItems.length).toBe(1);
    expect(component.menuItems[0].label).toBe('Cerrar Sesión');
    expect(component.menuItems[0].icon).toBe('pi pi-sign-out');
  });

  describe('logout', () => {
    it('should remove token from localStorage and navigate to login', () => {
      component.logout();

      expect(localStorageSpy.removeItem).toHaveBeenCalledWith('token');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('onKeydown', () => {
    it('should toggle menu on Enter key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      const menuSpy = jasmine.createSpyObj('Menu', ['toggle']);
      component.menu = menuSpy;

      component.onKeydown(event);

      expect(menuSpy.toggle).toHaveBeenCalledWith(event);
    });

    it('should toggle menu on Space key', () => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      const menuSpy = jasmine.createSpyObj('Menu', ['toggle']);
      component.menu = menuSpy;

      component.onKeydown(event);

      expect(menuSpy.toggle).toHaveBeenCalledWith(event);
    });

    it('should not toggle menu on other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'A' });
      const menuSpy = jasmine.createSpyObj('Menu', ['toggle']);
      component.menu = menuSpy;

      component.onKeydown(event);

      expect(menuSpy.toggle).not.toHaveBeenCalled();
    });
  });

  describe('Input properties', () => {
    it('should accept custom pageTitle', () => {
      const customTitle = 'Custom Title';
      component.pageTitle = customTitle;
      fixture.detectChanges();

      expect(component.pageTitle).toBe(customTitle);
    });

    it('should accept custom pageSubtitle', () => {
      const customSubtitle = 'Custom Subtitle';
      component.pageSubtitle = customSubtitle;
      fixture.detectChanges();

      expect(component.pageSubtitle).toBe(customSubtitle);
    });
  });
});

