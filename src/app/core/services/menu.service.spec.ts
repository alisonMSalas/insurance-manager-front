import { TestBed } from '@angular/core/testing';
import { MenuService } from './menu.service';

describe('MenuService', () => {
  let service: MenuService;

  const mockToken = (role: string): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ role }));
    const signature = 'test-signature';
    return `${header}.${payload}.${signature}`;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuService);
    localStorage.clear();
  });

  describe('getMenu', () => {
    it('debería retornar el menú para el rol ADMIN', () => {
      localStorage.setItem('token', mockToken('ADMIN'));

      const menu = service.getMenu();
      const titles = menu.map(m => m.title);

      expect(titles).toContain('Seguros');
      expect(titles).toContain('Usuarios');
      expect(titles).toContain('Clientes');
    });

    it('debería retornar el menú para el rol CLIENT', () => {
      localStorage.setItem('token', mockToken('CLIENT'));

      const menu = service.getMenu();
      const titles = menu.map(m => m.title);

      expect(titles).toContain('Usuarios');
      expect(titles).toContain('Clientes');
      expect(titles).not.toContain('Seguros');
    });

    it('debería retornar un array vacío si no hay token', () => {
      const menu = service.getMenu();
      expect(menu).toEqual([]);
    });

    it('debería retornar un array vacío si el token es inválido', () => {
      localStorage.setItem('token', 'invalid.token.value');
      const menu = service.getMenu();
      expect(menu).toEqual([]);
    });
  });

  describe('getMenuByURL', () => {
    it('debería retornar el menú correcto si la URL y rol coinciden', () => {
      localStorage.setItem('token', mockToken('ADMIN'));
      const menu = service.getMenuByURL('/insurance');
      expect(menu).toBeTruthy();
      expect(menu?.title).toBe('Seguros');
    });

    it('debería retornar undefined si el rol no tiene acceso a la URL', () => {
      localStorage.setItem('token', mockToken('CLIENT'));
      const menu = service.getMenuByURL('/insurance');
      expect(menu).toBeUndefined();
    });

    it('debería retornar undefined si no hay token', () => {
      const menu = service.getMenuByURL('/insurance');
      expect(menu).toBeUndefined();
    });
  });
});
