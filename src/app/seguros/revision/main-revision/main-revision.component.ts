import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { DocumentacionComponent } from "../documentacion/documentacion.component";
import { ResumenComponent } from "../resumen/resumen.component";
import { ContratacionesService } from '../../../core/services/contrataciones.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-revision',
  imports: [ButtonModule, RouterLink, AccordionModule, DocumentacionComponent, ResumenComponent],
  templateUrl: './main-revision.component.html',
  styleUrl: './main-revision.component.css'
})
export class MainRevisionComponent implements OnInit, OnDestroy {
  contratoId: string = '';
  contractService = inject(ContratacionesService);
  private subscription: Subscription | undefined;

  ngOnInit() {
    // Nos suscribimos para recibir actualizaciones del contratoId
    this.subscription = this.contractService.contratoId$.subscribe(id => {
      this.contratoId = id;
      // Aquí puedes hacer otras cosas cuando cambie el id
      console.log('MainRevisionComponent recibió contratoId:', id);
    });
  }

  ngOnDestroy() {
    // Limpiar la suscripción para evitar memory leaks
    this.subscription?.unsubscribe();
  }
}
