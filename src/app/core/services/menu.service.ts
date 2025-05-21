import { Injectable } from '@angular/core';
export interface IMenu {
  title: string;
  url: string;
  icon: string;
}
@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private listMenu: IMenu[] = [
    { title: 'Seguros', url: '/insurance', icon: 'pi pi-shield' },
    { title: 'Usuarios', url: '/users', icon: 'pi pi-user' },
    { title: 'Contratación Seguros', url: '/contratacion', icon: 'pi pi-shield' }
  ];

  getMenu(): IMenu[] {
    return [...this.listMenu];
  }

  getMenuByURL(url: string): IMenu {
    return this.listMenu.find(menu => menu.url.toLowerCase() === url.toLowerCase()) as IMenu;
  }
}
