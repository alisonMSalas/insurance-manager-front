import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { DocumentacionComponent } from "../documentacion/documentacion.component";
import { ResumenComponent } from "../resumen/resumen.component";
import { ContratacionesService } from '../../../core/services/contrataciones.service';
import { Subscription } from 'rxjs';
import { Contract } from '../../../shared/interfaces/contract';
import { CommonModule } from '@angular/common';
import { Attachment } from '../../../shared/interfaces/attachment';

@Component({
  selector: 'app-main-revision',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterLink, AccordionModule, DocumentacionComponent, ResumenComponent],
  templateUrl: './main-revision.component.html',
  styleUrl: './main-revision.component.css'
})
export class MainRevisionComponent implements OnInit, OnDestroy {
  contractInfo: Contract | null = null;
  contratoId: string = '';
  clientId: string = '';
  contractService = inject(ContratacionesService);
  esDesdeRuta: boolean = false;
  private subscription: Subscription | undefined;
  private route = inject(ActivatedRoute);
  attatchments:Attachment[] = [];

  ngOnInit() {
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    if (idFromRoute) {
      this.contratoId = idFromRoute;
      this.esDesdeRuta = true;
      console.log('Contrato ID desde la URL:', this.contratoId);
      this.cargarContrato(this.contratoId);
    } else {
      this.subscription = this.contractService.contratoId$.subscribe(id => {
        this.contratoId = id;
        this.esDesdeRuta = false;
        this.cargarContrato(this.contratoId);
      });
    }
  }

  private cargarContrato(id: string) {
    this.contractService.getById(id).subscribe({
      next: (contrato) => {
        this.contractInfo = contrato;
        this.clientId = contrato.clientId || ''; 
        this.attatchments = contrato.clientAttachments||  [];

      },
      error: (err) => {
        console.error('Error al cargar contrato:', err);
        this.contractInfo = null;
        this.clientId = ''; 
      }
    });
  }



  ngOnDestroy() {
    
    this.subscription?.unsubscribe();
  }
}
