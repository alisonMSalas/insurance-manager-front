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
    { title: 'Usuarios', url: '/main/users', icon: 'pi pi-user' },
    { title: 'Seguros', url: '/main/insurance', icon: 'pi pi-shield' },
  ];

  getMenu(): IMenu[] {
    return [...this.listMenu];
  }

  getMenuByURL(url: string): IMenu {
    return this.listMenu.find(menu => menu.url.toLowerCase() === url.toLowerCase()) as IMenu;
  }
}
