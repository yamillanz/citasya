import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  template: `
    <div class="not-found-page">
      <div class="not-found-bg">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
      </div>

      <div class="not-found-container">
        <div class="not-found-card">
          <div class="error-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="40" fill="#FEF2F2"/>
              <path d="M40 20C31.1634 20 24 27.1634 24 36C24 40.4183 25.8219 44.3734 28.8 47.2L26.8 54H53.2L51.2 47.2C54.1781 44.3734 56 40.4183 56 36C56 27.1634 48.8366 20 40 20ZM32.8 36C32.8 31.4624 36.4624 27.8 41 27.8C45.5376 27.8 49.2 31.4624 49.2 36C49.2 40.5376 45.5376 44.2 41 44.2C36.4624 44.2 32.8 40.5376 32.8 36ZM38.4 34.6V39.2C38.4 40.738 39.662 42 41.2 42C42.738 42 44 40.738 44 39.2V34.6C46.3340 33.9458 48 32.0184 48 29.8C48 26.9891 45.7109 24.7 42.9 24.7C40.0891 24.7 38.4 26.9891 38.4 29.8C38.4 32.0184 40.0658 33.9458 42.4 34.6Z" fill="#E07A5F"/>
            </svg>
          </div>

          <div class="error-content">
            <h1>404</h1>
            <h2>Página no encontrada</h2>
            <p>La página que buscas no existe o ha sido movida.</p>
          </div>

          <div class="error-actions">
            <p-button 
              label="Volver al Dashboard" 
              icon="pi pi-home"
              styleClass="primary-btn"
              (onClick)="goHome()"
            />
            <p-button 
              label="Ir al Inicio" 
              styleClass="secondary-btn"
              [routerLink]="['/']"
            />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
      position: relative;
      overflow: hidden;
    }
    .not-found-bg {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }
    .blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.5;
    }
    .blob-1 {
      width: 400px;
      height: 400px;
      background: #9DC183;
      top: -100px;
      right: -100px;
    }
    .blob-2 {
      width: 300px;
      height: 300px;
      background: #5D6D7E;
      bottom: -50px;
      left: -50px;
    }
    .not-found-container {
      position: relative;
      z-index: 1;
    }
    .not-found-card {
      background: white;
      border-radius: 16px;
      padding: 3rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 450px;
    }
    .error-icon {
      margin-bottom: 1.5rem;
    }
    .error-content h1 {
      font-size: 4rem;
      font-weight: 700;
      color: #5D6D7E;
      margin: 0;
      line-height: 1;
    }
    .error-content h2 {
      font-size: 1.5rem;
      color: #2c3e50;
      margin: 0.5rem 0 1rem;
    }
    .error-content p {
      color: #5D6D7E;
      margin: 0 0 2rem;
    }
    .error-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    :host ::ng-deep .primary-btn {
      background: #9DC183 !important;
      border-color: #9DC183 !important;
    }
    :host ::ng-deep .primary-btn:hover {
      background: #8ab06f !important;
      border-color: #8ab06f !important;
    }
    :host ::ng-deep .secondary-btn {
      background: #5D6D7E !important;
      border-color: #5D6D7E !important;
    }
    :host ::ng-deep .secondary-btn:hover {
      background: #4a5a6a !important;
      border-color: #4a5a6a !important;
    }
  `]
})
export class NotFoundComponent {
  private router = inject(Router);
  
  goHome() {
    this.router.navigate(['/dashboard']);
  }
}
