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

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockApiClient: jasmine.SpyObj<ApiClientService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockApiClient = jasmine.createSpyObj('ApiClientService', ['getCurrentUserEmail']);  

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
        { provide: Router, useValue: mockRouter },
        { provide: ApiClientService, useValue: mockApiClient }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default title and subtitle', () => {
    expect(component.pageTitle).toBe('Gestión de Seguros');
    expect(component.pageSubtitle).toBe('Administra y revisa todas las pólizas de seguros');
  });

  it('should have default search query as empty string', () => {
    expect(component.searchQuery).toBe('');
  });

  it('should have default user information', () => {
    expect(component.user).toBeDefined();
    expect(component.user.name).toBe('Usuario');
    expect(component.user.role).toBe('Agente de Seguros');
    expect(component.user.icon).toBe('pi pi-user');
  });

  it('should update user name with email from ApiClientService', () => {
    const testEmail = 'test@example.com';
    mockApiClient.getCurrentUserEmail.and.returnValue(testEmail);
    component.ngOnInit();
    expect(component.user.name).toBe(testEmail);
  });

  it('should have menu items', () => {
    expect(component.menuItems).toBeDefined();
    expect(component.menuItems.length).toBe(1);
    expect(component.menuItems[0].label).toBe('Cerrar Sesión');
    expect(component.menuItems[0].icon).toBe('pi pi-sign-out');
  });

  it('should call router.navigate when logout is triggered', () => {
    component.logout();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should update search query when input changes', () => {
    const testQuery = 'test search';
    component.searchQuery = testQuery;
    expect(component.searchQuery).toBe(testQuery);
  });
});
