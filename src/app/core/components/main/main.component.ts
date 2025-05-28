import { Component } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-main',
  imports: [MenuComponent, HeaderComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
}
