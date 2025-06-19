import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuComponent } from './menu.component';  
import { MenuService, IMenu } from '../../services/menu.service';
import { MenubarModule } from 'primeng/menubar';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let mockMenuService: jasmine.SpyObj<MenuService>;

  const mockMenuItems: IMenu[] = [
    { title: 'Seguros', url: '/insurance', icon: 'pi pi-shield', roles: ['ADMIN', 'AGENT'] },
    { title: 'Usuarios', url: '/users', icon: 'pi pi-user', roles: ['ADMIN'] },
    { title: 'Clientes', url: '/clients', icon: 'pi pi-user-plus', roles: ['ADMIN', 'AGENT'] }
  ];

  beforeEach(async () => {
    mockMenuService = jasmine.createSpyObj('MenuService', ['getMenu', 'getMenuByURL']);

    await TestBed.configureTestingModule({
      imports: [
        MenuComponent, 
        MenubarModule, 
        CommonModule, 
        RouterModule,
        RouterTestingModule
      ],  
      providers: [
        { provide: MenuService, useValue: mockMenuService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    mockMenuService.getMenu.and.returnValue(mockMenuItems);
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();  
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with menu items from service', () => {
    expect(mockMenuService.getMenu).toHaveBeenCalled();
    expect(component.listMenu).toEqual(mockMenuItems);
  });

  it('should have correct menu items structure', () => {
    expect(component.listMenu.length).toBe(3);
    expect(component.listMenu[0]).toEqual({
      title: 'Seguros',
      url: '/insurance',
      icon: 'pi pi-shield',
      roles: ['ADMIN', 'AGENT']
    });
  });

  it('should return current URL from window.location.pathname', () => {
    // Mock window.location.pathname
    const originalPathname = window.location.pathname;
    Object.defineProperty(window.location, 'pathname', {
      value: '/test-path',
      writable: true
    });

    expect(component.currentUrl).toBe('/test-path');

    // Restore original
    Object.defineProperty(window.location, 'pathname', {
      value: originalPathname,
      writable: true
    });
  });

  it('should return empty string when window.location.pathname is empty', () => {
    const originalPathname = window.location.pathname;
    Object.defineProperty(window.location, 'pathname', {
      value: '',
      writable: true
    });

    expect(component.currentUrl).toBe('');

    Object.defineProperty(window.location, 'pathname', {
      value: originalPathname,
      writable: true
    });
  });

  it('should return root path when window.location.pathname is /', () => {
    const originalPathname = window.location.pathname;
    Object.defineProperty(window.location, 'pathname', {
      value: '/',
      writable: true
    });

    expect(component.currentUrl).toBe('/');

    Object.defineProperty(window.location, 'pathname', {
      value: originalPathname,
      writable: true
    });
  });

  it('should handle menu service returning empty array', () => {
    mockMenuService.getMenu.and.returnValue([]);
    
    // Recreate component to test constructor with empty menu
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.listMenu).toEqual([]);
    expect(component.listMenu.length).toBe(0);
  });

  it('should handle menu service returning null', () => {
    mockMenuService.getMenu.and.returnValue(null as any);
    
    // Recreate component to test constructor with null menu
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.listMenu).toBeNull();
  });

  it('should handle menu service returning undefined', () => {
    mockMenuService.getMenu.and.returnValue(undefined as any);
    
    // Recreate component to test constructor with undefined menu
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.listMenu).toBeUndefined();
  });

  it('should have menuSrv injected correctly', () => {
    expect(component.menuSrv).toBeDefined();
    expect(component.menuSrv).toBe(mockMenuService);
  });

  it('should call getMenu only once during initialization', () => {
    expect(mockMenuService.getMenu).toHaveBeenCalledTimes(1);
  });

  it('should handle complex URL paths', () => {
    const originalPathname = window.location.pathname;
    Object.defineProperty(window.location, 'pathname', {
      value: '/insurance/details/123',
      writable: true
    });

    expect(component.currentUrl).toBe('/insurance/details/123');

    Object.defineProperty(window.location, 'pathname', {
      value: originalPathname,
      writable: true
    });
  });

  it('should handle URL with query parameters', () => {
    const originalPathname = window.location.pathname;
    Object.defineProperty(window.location, 'pathname', {
      value: '/users?page=1&size=10',
      writable: true
    });

    expect(component.currentUrl).toBe('/users?page=1&size=10');

    Object.defineProperty(window.location, 'pathname', {
      value: originalPathname,
      writable: true
    });
  });

  it('should handle special characters in URL', () => {
    const originalPathname = window.location.pathname;
    Object.defineProperty(window.location, 'pathname', {
      value: '/clients/123%20test',
      writable: true
    });

    expect(component.currentUrl).toBe('/clients/123%20test');

    Object.defineProperty(window.location, 'pathname', {
      value: originalPathname,
      writable: true
    });
  });

  it('should handle very long URLs', () => {
    const originalPathname = window.location.pathname;
    const longUrl = '/very/long/url/path/with/many/segments/that/goes/on/and/on/and/on';
    Object.defineProperty(window.location, 'pathname', {
      value: longUrl,
      writable: true
    });

    expect(component.currentUrl).toBe(longUrl);

    Object.defineProperty(window.location, 'pathname', {
      value: originalPathname,
      writable: true
    });
  });
});
