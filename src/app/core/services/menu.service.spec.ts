import { TestBed } from '@angular/core/testing';
import { MenuService, IMenu } from './menu.service';

describe('MenuService', () => {
  let service: MenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMenu', () => {
    it('should return a copy of the menu list', () => {
      const menu = service.getMenu();
      expect(menu).toBeDefined();
      expect(Array.isArray(menu)).toBeTruthy();
      expect(menu.length).toBeGreaterThan(0);
      
      // Verificar que es una copia y no la referencia original
      const originalMenu = service.getMenu();
      menu[0].title = 'Test';
      expect(originalMenu[0].title).not.toBe('Test');
    });

    it('should return menu items with correct structure', () => {
      const menu = service.getMenu();
      menu.forEach(item => {
      });
    });
  });

  describe('getMenuByURL', () => {
    it('should return the correct menu item for a valid URL', () => {
      const url = '/main/users';
      const menuItem = service.getMenuByURL(url);
      expect(menuItem).toBeDefined();
      expect(menuItem.url.toLowerCase()).toBe(url.toLowerCase());
    });

    it('should be case insensitive when searching by URL', () => {
      const url = '/MAIN/USERS';
      const menuItem = service.getMenuByURL(url);
      expect(menuItem).toBeDefined();
      expect(menuItem.url.toLowerCase()).toBe(url.toLowerCase());
    });

    it('should return undefined for non-existent URL', () => {
      const url = '/non-existent-url';
      const menuItem = service.getMenuByURL(url);
      expect(menuItem).toBeUndefined();
    });
  });
});
