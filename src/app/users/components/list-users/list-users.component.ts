import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';

interface User {
  id: string;
  name: string;
  email: string;
  rol: string;
  active: boolean;
}
@Component({
  selector: 'app-list-users',
  imports: [TableModule, ButtonModule, CommonModule, ToggleSwitchModule, FormsModule, SelectModule, FloatLabel, InputTextModule],
  templateUrl: './list-users.component.html',
  styleUrl: './list-users.component.css'
})
export class ListUsersComponent {
  users: User[] = [
    { id: '21044270-74a5-477a-b1ad-0c3811b2609b', name: 'Andres', email: 'raansopro324@gmail.com', rol: 'ADMIN', active: true },
    { id: 'f5b7e9a1-3c2d-4e5f-8a9b-0c1d2e3f4a5b', name: 'Sofía Ramírez', email: 'sofia.ramirez@example.com', rol: 'USER', active: true },
    { id: 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', name: 'Luis González', email: 'luis.gonzalez@example.com', rol: 'AGENT', active: false },
    { id: 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', name: 'María Sánchez', email: 'maria.sanchez@example.com', rol: 'USER', active: true },
    { id: 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', name: 'Jorge Martínez', email: 'jorge.martinez@example.com', rol: 'ADMIN', active: false }
  ];

  viewUser(user: User) {
    console.log('Ver usuario:', user);
  }
}
