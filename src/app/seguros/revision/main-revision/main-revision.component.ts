import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { DocumentacionComponent } from "../documentacion/documentacion.component";

@Component({
  selector: 'app-main-revision',
  imports: [ButtonModule, RouterLink, AccordionModule, DocumentacionComponent],
  templateUrl: './main-revision.component.html',
  styleUrl: './main-revision.component.css'
})
export class MainRevisionComponent {

}
