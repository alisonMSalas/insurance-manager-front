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
  standalone: true,
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
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }


  toggleForm() {
    this.isLoginActive = !this.isLoginActive;
  }

  onLogin() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      this.authService.login(credentials).subscribe({
        next: (token: string) => {
          localStorage.setItem('token', token); // Guardar el token
          this.router.navigate(['main']);
        },
        error: (err) => {
          console.error('Error al iniciar sesión', err);
        }
      });
    }
  }
   

  onRegister() {
    if (this.registerForm.valid) {
      const user = this.registerForm.value;
      console.log('Datos de registro:', user); // Verifica en consola
      
      this.authService.register(user).subscribe({
        next: (response) => {
          console.log('Registro exitoso', response);
          this.toggleForm(); // Cambia a login si el registro es exitoso
        },
        error: (err) => {
          console.error('Error en registro:', err);
        }
      });
    } else {
      console.log('Formulario inválido', this.registerForm.errors);
      this.registerForm.markAllAsTouched(); // Marca los campos para mostrar errores
    }
  }

  

}
