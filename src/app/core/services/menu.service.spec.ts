import { TestBed } from '@angular/core/testing';
import { MenuService, IMenu } from './menu.service';

describe('MenuService', () => {
  let service: MenuService;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6IkFETUlOIn0.signature';
  const mockAdminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6IkFETUlOIn0.signature';
  const mockAgentToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6IkFHRU5UIn0.signature';
  const mockClientToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6IkNMSUVOVCJ9.signature';

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('localStorage', ['getItem']);
    localStorageSpy = storageSpy;
    Object.defineProperty(window, 'localStorage', { value: storageSpy });

    TestBed.configureTestingModule({
      providers: [MenuService]
    });

    service = TestBed.inject(MenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserRole', () => {
    it('should return null when no token exists', () => {
      localStorageSpy.getItem.and.returnValue(null);
      expect(service['getUserRole']()).toBeNull();
    });

    it('should return null when token is invalid', () => {
      localStorageSpy.getItem.and.returnValue('invalid-token');
      expect(service['getUserRole']()).toBeNull();
    });

    it('should return role from valid token', () => {
      localStorageSpy.getItem.and.returnValue(mockAdminToken);
      expect(service['getUserRole']()).toBe('ADMIN');
    });
  });

  describe('getMenu', () => {
    it('should return empty array when no role exists', () => {
      localStorageSpy.getItem.and.returnValue(null);
      expect(service.getMenu()).toEqual([]);
    });

    it('should return admin menu items', () => {
      localStorageSpy.getItem.and.returnValue(mockAdminToken);
      const menu = service.getMenu();
      expect(menu.length).toBeGreaterThan(0);
      expect(menu.every(item => item.roles.includes('ADMIN'))).toBeTrue();
    });

    it('should return agent menu items', () => {
      localStorageSpy.getItem.and.returnValue(mockAgentToken);
      const menu = service.getMenu();
      expect(menu.length).toBeGreaterThan(0);
      expect(menu.every(item => item.roles.includes('AGENT'))).toBeTrue();
    });

    it('should return client menu items', () => {
      localStorageSpy.getItem.and.returnValue(mockClientToken);
      const menu = service.getMenu();
      expect(menu.length).toBeGreaterThan(0);
      expect(menu.every(item => item.roles.includes('CLIENT'))).toBeTrue();
    });

    it('should return a new array instance', () => {
      localStorageSpy.getItem.and.returnValue(mockAdminToken);
      const menu1 = service.getMenu();
      const menu2 = service.getMenu();
      expect(menu1).not.toBe(menu2);
    });
  });

  describe('getMenuByURL', () => {
    it('should return undefined when no role exists', () => {
      localStorageSpy.getItem.and.returnValue(null);
      expect(service.getMenuByURL('/insurance')).toBeUndefined();
    });

    it('should return menu item for valid URL and role', () => {
      localStorageSpy.getItem.and.returnValue(mockAdminToken);
      const menuItem = service.getMenuByURL('/insurance');
      expect(menuItem).toBeDefined();
      expect(menuItem?.url).toBe('/insurance');
      expect(menuItem?.roles).toContain('ADMIN');
    });

    it('should return undefined for invalid URL', () => {
      localStorageSpy.getItem.and.returnValue(mockAdminToken);
      expect(service.getMenuByURL('/invalid-url')).toBeUndefined();
    });

    it('should be case insensitive for URL matching', () => {
      localStorageSpy.getItem.and.returnValue(mockAdminToken);
      const menuItem = service.getMenuByURL('/INSURANCE');
      expect(menuItem).toBeDefined();
      expect(menuItem?.url).toBe('/insurance');
    });

    it('should return undefined for URL with role mismatch', () => {
      localStorageSpy.getItem.and.returnValue(mockClientToken);
      const menuItem = service.getMenuByURL('/users');
      expect(menuItem).toBeUndefined();
    });
  });
});
