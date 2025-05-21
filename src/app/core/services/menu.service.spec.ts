import { TestBed } from '@angular/core/testing';
import { MenuService } from './menu.service';

describe('MenuService', () => {
  let service: MenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a copy of the menu list', () => {
    const menu = service.getMenu();
    expect(menu).toBeDefined();
    expect(Array.isArray(menu)).toBeTrue();
    expect(menu.length).toBeGreaterThan(0);
  
    const originalMenu = service.getMenu();
    expect(menu).not.toBe(originalMenu); 
  
    expect(menu[0].title).toBe(originalMenu[0].title);
  });
  

  describe('getMenuByURL', () => {
    // it('should return the correct menu item for a valid URL', () => {
    //   const url = '/main/users';
    //   const menuItem = service.getMenuByURL(url);
    //   expect(menuItem).toBeDefined();
    //   expect(menuItem.url.toLowerCase()).toBe(url.toLowerCase());
    // });

    // it('should be case insensitive when searching by URL', () => {
    //   const url = '/MAIN/USERS';
    //   const menuItem = service.getMenuByURL(url);
    //   expect(menuItem).toBeDefined();
    //   expect(menuItem.url.toLowerCase()).toBe(url.toLowerCase());
    // });

    it('should return undefined for non-existent URL', () => {
      const url = '/non-existent-url';
      const menuItem = service.getMenuByURL(url);
      expect(menuItem).toBeUndefined();
    });
  });
});
