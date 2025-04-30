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
    { title: 'Seguros', url: '/main/policies', icon: 'fas fa-file-contract' },
    { title: 'Usuarios', url: '/main/users', icon: 'fas fa-users' }
  ];

 

  getMenu(): IMenu[] {
    return [...this.listMenu];
  }

  getMenuByURL(url: string): IMenu {
    return this.listMenu.find(menu => menu.url.toLowerCase() === url.toLowerCase()) as IMenu;
  }
  
}
