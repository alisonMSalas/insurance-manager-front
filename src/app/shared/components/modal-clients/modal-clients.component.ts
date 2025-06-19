import { Component, Output, EventEmitter, Input } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Client } from '../../interfaces/client';

@Component({
  selector: 'app-modal-clients',
  imports: [DialogModule, CalendarModule, DropdownModule, CommonModule, FormsModule, ButtonModule, InputIconModule, InputTextModule, PasswordModule],
  templateUrl: './modal-clients.component.html',
  styleUrls: ['./modal-clients.component.scss']
})
export class ModalClientsComponent {
  @Input() displayModal: boolean = false;
  @Input() cliente: Client | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Client>();

  cerrar() {
    this.onClose.emit();
  }
}
