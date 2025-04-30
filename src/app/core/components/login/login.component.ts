import { Component, inject, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
// import { handleError } from '../../../shared/utils/error.utils';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CardModule,
    CommonModule,
    ButtonModule,
    ReactiveFormsModule,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private router = inject(Router);
  private messageService = inject(MessageService);
  loginForm!: FormGroup;
  authService = inject(AuthService);

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      this.authService.login(credentials).subscribe({
        next: (token: string) => {
          localStorage.setItem('token', token);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Inicio de sesión exitoso'
          });
          this.router.navigate(['/seguros']);
        },
        error: (error: HttpErrorResponse) => {
          
        }
      });
    }
  }
}
