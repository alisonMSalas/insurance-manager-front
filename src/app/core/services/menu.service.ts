import { Injectable } from '@angular/core';
export interface IMenu {
  title: string;
  url: string;
  icon: string;
  roles: string[];
}
@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly listMenu: IMenu[] = [

    { title: 'Seguros', url: '/insurance', icon: 'pi pi-shield', roles: ['ADMIN', 'AGENT'] },

    { title: 'Usuarios', url: '/users', icon: 'pi pi-user', roles: ['CLIENT', 'ADMIN'] },
    { title: 'Clientes', url: '/clients', icon: 'pi pi-user-plus', roles: ['CLIENT', 'ADMIN'] },

  ];


  private getUserRole(): string | null {

    const token = localStorage.getItem('token');

    if (!token) return null;


    try {

      const payload = JSON.parse(atob(token.split('.')[1]));

      return payload.role || null;

    } catch (e) {

      console.error('Token inválido:', e);

      return null;

    }

  }


  getMenu(): IMenu[] {

    const role = this.getUserRole();

    if (!role) {

      return []; 

    }


    return this.listMenu

      .filter(menu => menu.roles.includes(role))

      .map(menu => ({ ...menu }));

  }


  getMenuByURL(url: string): IMenu | undefined {

    const role = this.getUserRole();

    if (!role) {

      return undefined;

    }


    return this.listMenu.find(menu =>

      menu.url.toLowerCase() === url.toLowerCase() &&

      menu.roles.includes(role)

    );

  }

}
