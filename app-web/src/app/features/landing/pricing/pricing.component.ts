import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, BadgeModule, DividerModule, AvatarModule, PanelModule],
  template: `
    <section class="pricing-header py-20 px-4 bg-gradient-to-br from-surface-50 to-white">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-primary mb-6">
          Planes simples y transparentes
        </h1>
        <p class="text-xl text-surface-600 max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a tu negocio. Sin sorpresas, sin contratos de permanencia.
        </p>
      </div>
    </section>

    <section class="pricing-section py-12 px-4 bg-white">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Basic Plan -->
          <p-card styleClass="h-full pricing-card">
            <ng-template pTemplate="header">
              <div class="p-6 text-center border-b border-surface-200">
                <h2 class="text-2xl font-bold text-surface-700 mb-2">Básico</h2>
                <div class="flex items-baseline justify-center gap-2">
                  <span class="text-5xl font-bold text-primary">$25</span>
                  <span class="text-surface-500">/mes</span>
                </div>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <ul class="space-y-4 mb-8">
                <li class="flex items-center gap-3">
                  <p-avatar icon="pi pi-check" styleClass="bg-green-500 text-white" size="small" shape="circle"></p-avatar>
                  <span>10 usuarios (1 manager + 9 empleados)</span>
                </li>
                <li class="flex items-center gap-3">
                  <p-avatar icon="pi pi-check" styleClass="bg-green-500 text-white" size="small" shape="circle"></p-avatar>
                  <span>1 empresa</span>
                </li>
                <li class="flex items-center gap-3">
                  <p-avatar icon="pi pi-check" styleClass="bg-green-500 text-white" size="small" shape="circle"></p-avatar>
                  <span>Citas públicas ilimitadas</span>
                </li>
                <li class="flex items-center gap-3">
                  <p-avatar icon="pi pi-check" styleClass="bg-green-500 text-white" size="small" shape="circle"></p-avatar>
                  <span>Cierre diario con PDF</span>
                </li>
                <li class="flex items-center gap-3">
                  <p-avatar icon="pi pi-check" styleClass="bg-green-500 text-white" size="small" shape="circle"></p-avatar>
                  <span>Soporte por email</span>
                </li>
              </ul>
            </ng-template>
            <ng-template pTemplate="footer">
              <p-button 
                label="Comenzar" 
                styleClass="w-full p-button-primary"
                [routerLink]="['/contact']"
              />
            </ng-template>
          </p-card>

          <!-- Medium Plan (Featured) -->
          <p-card styleClass="h-full pricing-card featured border-2 border-primary shadow-xl">
            <ng-template pTemplate="header">
              <div class="p-6 text-center border-b border-surface-200 relative">
                <p-badge 
                  value="Más popular" 
                  severity="success" 
                  styleClass="absolute -top-3 left-1/2 transform -translate-x-1/2"
                ></p-badge>
                <h2 class="text-2xl font-bold text-surface-700 mb-2">Medio</h2>
                <div class="flex items-baseline justify-center gap-2">
                  <span class="text-5xl font-bold text-primary">$60</span>
                  <span class="text-surface-500">/mes</span>
                </div>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <ul class="space-y-4 mb-8">
                <li class="flex items-center gap-3">
                  <p-avatar icon="pi pi-check" styleClass="bg-green-500 text-white" size="small" shape="circle"></p-avatar>
                  <span>20 usuarios (1 manager + 19 empleados)</span>
                </li>
                <li class="flex items-center gap-3">
                  <p-avatar icon="pi pi-check" styleClass="bg-green-500 text-white" size="small" shape="circle"></p-avatar>
                  <span>2 empresas</span>
                </li>
                <li class="flex items-center gap-3">
                  <p-avatar icon="pi pi-check" styleClass="bg-green-500 text-white" size="small" shape="circle"></p-avatar>
                  <span>Citas públicas ilimitadas</span>
                </li>
                <li class="flex items-center gap-3">
                  <p-avatar icon="pi pi-check" styleClass="bg-green-500 text-white" size="small" shape="circle"></p-avatar>
                  <span>Cierre diario con PDF</span>
                </li>
                <li class="flex items-center gap-3">
                  <p-avatar icon="pi pi-check" styleClass="bg-green-500 text-white" size="small" shape="circle"></p-avatar>
                  <span>Soporte prioritario</span>
                </li>
                <li class="flex items-center gap-3">
                  <p-avatar icon="pi pi-check" styleClass="bg-green-500 text-white" size="small" shape="circle"></p-avatar>
                  <span>Reportes avanzados</span>
                </li>
              </ul>
            </ng-template>
            <ng-template pTemplate="footer">
              <p-button 
                label="Comenzar" 
                styleClass="w-full p-button-primary"
                [routerLink]="['/contact']"
              />
            </ng-template>
          </p-card>

          <!-- Custom Plan -->
          <p-card styleClass="h-full pricing-card">
            <ng-template pTemplate="header">
              <div class="p-6 text-center border-b border-surface-200">
                <h2 class="text-2xl font-bold text-surface-700 mb-2">Custom</h2>
                <div class="flex items-baseline justify-center gap-2">
                  <span class="text-5xl font-bold text-primary">Negociado</span>
                </div>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <ul class="space-y-4 mb-8">
                <li class="flex items-center gap-3">
                  <p-avatar icon="pi pi-check" styleClass="bg-green-500 text-white" size="small" shape="circle"></p-avatar>
                  <span>Usuarios ilimitados</span>
                </li>
                <li class="flex items-center gap-3">
                  <p-avatar icon="pi pi-check" styleClass="bg-green-500 text-white" size="small" shape="circle"></p-avatar>
                  <span>Empresas ilimitadas</span>
                </li>
                <li class="flex items-center gap-3">
                  <p-avatar icon="pi pi-check" styleClass="bg-green-500 text-white" size="small" shape="circle"></p-avatar>
                  <span>Todas las funcionalidades</span>
                </li>
                <li class="flex items-center gap-3">
                  <p-avatar icon="pi pi-check" styleClass="bg-green-500 text-white" size="small" shape="circle"></p-avatar>
                  <span>Soporte dedicado 24/7</span>
                </li>
                <li class="flex items-center gap-3">
                  <p-avatar icon="pi pi-check" styleClass="bg-green-500 text-white" size="small" shape="circle"></p-avatar>
                  <span>Personalización completa</span>
                </li>
              </ul>
            </ng-template>
            <ng-template pTemplate="footer">
              <p-button 
                label="Contactar" 
                styleClass="w-full p-button-outlined p-button-secondary"
                [routerLink]="['/contact']"
              />
            </ng-template>
          </p-card>
        </div>
      </div>
    </section>

    <p-divider></p-divider>

    <!-- FAQ Section -->
    <section class="faq-section py-20 px-4 bg-surface-50">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-primary text-center mb-12">Preguntas frecuentes</h2>
        
        <div class="space-y-6">
          <p-panel header="¿Puedo cambiar de plan en cualquier momento?" [toggleable]="true" collapsed>
            <p class="m-0 text-surface-600">
              Sí, puedes actualizar o cambiar tu plan en cualquier momento. Los cambios se aplicarán en tu próximo ciclo de facturación.
            </p>
          </p-panel>

          <p-panel header="¿Hay contrato de permanencia?" [toggleable]="true" collapsed>
            <p class="m-0 text-surface-600">
              No. Puedes cancelar tu suscripción en cualquier momento sin penalizaciones.
            </p>
          </p-panel>

          <p-panel header="¿Qué métodos de pago aceptan?" [toggleable]="true" collapsed>
            <p class="m-0 text-surface-600">
              Aceptamos tarjetas de crédito/débito (Visa, Mastercard, Amex) y transferencias bancarias para planes empresariales.
            </p>
          </p-panel>

          <p-panel header="¿Puedo probar antes de pagar?" [toggleable]="true" collapsed>
            <p class="m-0 text-surface-600">
              Sí, ofrecemos 14 días de prueba gratuita en el plan Básico. Sin tarjeta de crédito requerida.
            </p>
          </p-panel>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host ::ng-deep .pricing-card .p-card-content {
      padding: 1.5rem;
    }
    
    :host ::ng-deep .featured {
      transform: scale(1.05);
    }
    
    :host ::ng-deep .pricing-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    :host ::ng-deep .pricing-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    
    :host ::ng-deep .featured:hover {
      transform: translateY(-8px) scale(1.05);
    }
  `]
})
export class PricingComponent {}
