import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ListSegurosComponent } from './seguros/list-seguros/list-seguros.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ListSegurosComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'insurance-manager-front';
}
