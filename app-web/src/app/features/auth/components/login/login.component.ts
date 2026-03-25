import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,
    CheckboxModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);
  
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false]
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
  
  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }
  
  private redirectByRole(role: string) {
    switch (role) {
      case 'superadmin':
        this.router.navigate(['/admin']);
        break;
      case 'manager':
        this.router.navigate(['/bo/dashboard']);
        break;
      case 'employee':
        this.router.navigate(['/emp/calendar']);
        break;
      default:
        this.router.navigate(['/bo/dashboard']);
    }
  }
}
