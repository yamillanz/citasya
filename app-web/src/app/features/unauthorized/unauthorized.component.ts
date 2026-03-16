import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-unauthorized',
  imports: [Button, Card],
  template: `
    <div class="unauthorized-container">
      <p-card styleClass="text-center">
        <ng-template pTemplate="header">
          <div class="lock-icon">
            <i class="pi pi-lock"></i>
          </div>
        </ng-template>
        
        <h1 class="title">Acceso Denegado</h1>
        <p class="subtitle">No tienes permiso para acceder a esta página.</p>
        
        <ng-template pTemplate="footer">
          <p-button 
            label="Volver al Inicio" 
            (onClick)="goHome()"
            styleClass="p-button-primary"
          />
        </ng-template>
      </p-card>
    </div>
  `
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}
  
  goHome() {
    this.router.navigate(['/dashboard']);
  }
}
