import { Component, inject, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    CardModule,
    CommonModule,
    ButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private router = inject(Router);
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  authService = inject(AuthService);

  isLoginActive: boolean = true;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }


  toggleForm() {
    this.isLoginActive = !this.isLoginActive;
  }

  onLogin() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      this.authService.login(credentials).subscribe({
        next: (response) => {
          localStorage.setItem('token', response); // Guardar el token en el almacenamiento local
          this.router.navigate(['/home']); // Redirigir a la página de inicio después de iniciar sesión
        },
        error: (err) => {
          console.error('Error al iniciar sesión', err); // Manejo de errores
          // Aquí puedes mostrar un mensaje de error o realizar alguna otra acción
        }
      });
    }
  }
  

}
