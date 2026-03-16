import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, InputText, Password, Button, Card],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="text-3xl font-bold">CitasYa</h1>
          <p class="mt-2">Gestión de citas para tu negocio</p>
        </div>
        
        <p-card>
          <ng-template pTemplate="header">
            <div class="card-header">
              <h2>Iniciar Sesión</h2>
            </div>
          </ng-template>
          
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-container">
              <div class="form-group">
                <label for="email">Correo Electrónico</label>
                <input 
                  pInputText 
                  id="email" 
                  type="email" 
                  formControlName="email"
                  placeholder="tu@email.com"
                  class="w-full"
                />
                @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                  <small class="error-text">Correo electrónico requerido</small>
                }
              </div>
              
              <div class="form-group">
                <label for="password">Contraseña</label>
                <p-password 
                  id="password" 
                  formControlName="password"
                  placeholder="Tu contraseña"
                  [feedback]="false"
                  [toggleMask]="true"
                  styleClass="w-full"
                  inputStyleClass="w-full"
                />
                @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                  <small class="error-text">Contraseña requerida</small>
                }
              </div>
              
              @if (error()) {
                <div class="error-box">
                  <small>{{ error() }}</small>
                </div>
              }
              
              <p-button 
                type="submit" 
                label="Iniciar Sesión" 
                [loading]="loading()"
                styleClass="w-full"
              />
            </div>
          </form>
          
          <ng-template pTemplate="footer">
            <div class="footer-text">
              ¿No tienes cuenta? <a href="/register">Regístrate</a>
            </div>
          </ng-template>
        </p-card>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  loading = signal(false);
  error = signal<string | null>(null);
  
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  
  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    
    this.loading.set(true);
    this.error.set(null);
    
    try {
      const user = await this.authService.signIn(
        this.loginForm.get('email')!.value!,
        this.loginForm.get('password')!.value!
      );
      
      this.redirectByRole(user.role);
    } catch (err: any) {
      this.error.set(err.message || 'Error al iniciar sesión');
    } finally {
      this.loading.set(false);
    }
  }
  
  private redirectByRole(role: string) {
    switch (role) {
      case 'superadmin':
        this.router.navigate(['/admin']);
        break;
      case 'manager':
        this.router.navigate(['/dashboard']);
        break;
      case 'employee':
        this.router.navigate(['/appointments']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }
}
