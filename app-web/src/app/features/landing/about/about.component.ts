import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { PanelModule } from 'primeng/panel';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, CardModule, DividerModule, AvatarModule, PanelModule, TimelineModule, TagModule],
  template: `
    <!-- Hero Section -->
    <section class="about-hero py-20 px-4 bg-gradient-to-br from-surface-50 to-white">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-primary mb-6">
          Sobre CitasYa
        </h1>
        <p class="text-xl text-surface-600 max-w-3xl mx-auto">
          Nuestra misión es simplificar la gestión de citas para profesionales independientes y pequeños negocios de servicios.
        </p>
      </div>
    </section>

    <!-- Story Section -->
    <section class="story-section py-20 px-4 bg-white">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl font-bold text-primary mb-6">Nuestra Historia</h2>
            <div class="space-y-4 text-surface-600 leading-relaxed">
              <p>
                CitasYa nació de la frustración de ver cómo pequeños negocios perdían clientes por procesos de agendamiento complicados. Un peluquero perdía citas porque los clientes no querían crear cuentas. Un dentista pasaba horas al final del día calculando ingresos manualmente.
              </p>
              <p>
                En 2024, decidimos crear una solución simple pero poderosa. Una plataforma que permita a los profesionales enfocarse en lo que mejor saben hacer: atender a sus clientes.
              </p>
              <p>
                Hoy, cientos de negocios confían en CitasYa para gestionar sus citas, y seguimos creciendo con una filosofía clara: la tecnología debe ser accesible y simple para todos.
              </p>
            </div>
          </div>
          <div class="flex justify-center">
            <div class="relative">
              <div class="w-80 h-80 bg-primary/10 rounded-full flex items-center justify-center">
                <div class="w-64 h-64 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                  <div class="text-center p-6">
                    <p-avatar icon="pi pi-heart" styleClass="bg-primary text-white text-3xl mb-4" size="xlarge" shape="circle"></p-avatar>
                    <p class="text-lg font-semibold text-primary">Hecho con pasión</p>
                    <p class="text-surface-500">para profesionales</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <p-divider></p-divider>

    <!-- Values Section -->
    <section class="values-section py-20 px-4 bg-surface-50">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-primary text-center mb-12">Nuestros Valores</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <p-card styleClass="h-full text-center">
            <ng-template pTemplate="header">
              <div class="pt-6">
                <p-avatar icon="pi pi-bolt" styleClass="bg-primary text-white text-2xl" size="xlarge" shape="circle"></p-avatar>
              </div>
            </ng-template>
            <ng-template pTemplate="title">
              <h3 class="text-xl font-semibold">Simplicidad</h3>
            </ng-template>
            <ng-template pTemplate="content">
              <p class="text-surface-600 m-0">
                Si algo necesita un manual, no está bien diseñado. Priorizamos la experiencia del usuario sobre las funciones innecesarias.
              </p>
            </ng-template>
          </p-card>

          <p-card styleClass="h-full text-center">
            <ng-template pTemplate="header">
              <div class="pt-6">
                <p-avatar icon="pi pi-shield" styleClass="bg-primary text-white text-2xl" size="xlarge" shape="circle"></p-avatar>
              </div>
            </ng-template>
            <ng-template pTemplate="title">
              <h3 class="text-xl font-semibold">Confianza</h3>
            </ng-template>
            <ng-template pTemplate="content">
              <p class="text-surface-600 m-0">
                Los datos de tu negocio y clientes son sagrados. Seguridad y privacidad en cada línea de código.
              </p>
            </ng-template>
          </p-card>

          <p-card styleClass="h-full text-center">
            <ng-template pTemplate="header">
              <div class="pt-6">
                <p-avatar icon="pi pi-users" styleClass="bg-primary text-white text-2xl" size="xlarge" shape="circle"></p-avatar>
              </div>
            </ng-template>
            <ng-template pTemplate="title">
              <h3 class="text-xl font-semibold">Empatía</h3>
            </ng-template>
            <ng-template pTemplate="content">
              <p class="text-surface-600 m-0">
                Escuchamos a nuestros usuarios. Cada función nace de una necesidad real de profesionales como tú.
              </p>
            </ng-template>
          </p-card>

          <p-card styleClass="h-full text-center">
            <ng-template pTemplate="header">
              <div class="pt-6">
                <p-avatar icon="pi pi-globe" styleClass="bg-primary text-white text-2xl" size="xlarge" shape="circle"></p-avatar>
              </div>
            </ng-template>
            <ng-template pTemplate="title">
              <h3 class="text-xl font-semibold">Accesibilidad</h3>
            </ng-template>
            <ng-template pTemplate="content">
              <p class="text-surface-600 m-0">
                Tecnología de calidad empresarial al alcance de pequeños negocios. Precios justos, valor real.
              </p>
            </ng-template>
          </p-card>
        </div>
      </div>
    </section>

    <p-divider></p-divider>

    <!-- Team Section -->
    <section class="team-section py-20 px-4 bg-white">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-primary text-center mb-4">Equipo Fundador</h2>
        <p class="text-xl text-surface-600 text-center mb-12 max-w-2xl mx-auto">
          Las personas detrás de CitasYa
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <p-card styleClass="text-center">
            <ng-template pTemplate="header">
              <div class="pt-8">
                <p-avatar 
                  image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" 
                  styleClass="border-4 border-primary" 
                  size="xlarge" 
                  shape="circle"
                ></p-avatar>
              </div>
            </ng-template>
            <ng-template pTemplate="title">
              <h3 class="text-2xl font-bold">Nombre del Fundador</h3>
            </ng-template>
            <ng-template pTemplate="subtitle">
              <p-tag value="CEO & Fundador" severity="success"></p-tag>
            </ng-template>
            <ng-template pTemplate="content">
              <p class="text-surface-600 m-0">
                Emprendedor con 10+ años en tecnología. Apasionado por simplificar procesos complejos y ayudar a pequeños negocios a crecer con tecnología accesible.
              </p>
            </ng-template>
          </p-card>

          <p-card styleClass="text-center">
            <ng-template pTemplate="header">
              <div class="pt-8">
                <p-avatar 
                  image="https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png" 
                  styleClass="border-4 border-primary" 
                  size="xlarge" 
                  shape="circle"
                ></p-avatar>
              </div>
            </ng-template>
            <ng-template pTemplate="title">
              <h3 class="text-2xl font-bold">Nombre del Co-fundador</h3>
            </ng-template>
            <ng-template pTemplate="subtitle">
              <p-tag value="CTO" severity="info"></p-tag>
            </ng-template>
            <ng-template pTemplate="content">
              <p class="text-surface-600 m-0">
                Ingeniero de software especializado en productos SaaS y UX. Convencido de que la mejor tecnología es la que no se nota, solo funciona.
              </p>
            </ng-template>
          </p-card>
        </div>
      </div>
    </section>

    <!-- Mission & Vision -->
    <section class="mission-section py-20 px-4 bg-surface-50">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <p-panel header="Misión" styleClass="h-full">
            <div class="flex items-start gap-4">
              <p-avatar icon="pi pi-flag" styleClass="bg-primary text-white" shape="circle"></p-avatar>
              <p class="m-0 text-surface-600 leading-relaxed">
                Democratizar el acceso a herramientas de gestión profesional para pequeños negocios de servicios. Queremos que cualquier profesional independiente, sin importar su tamaño, tenga acceso a tecnología de clase mundial para gestionar su tiempo y clientes.
              </p>
            </div>
          </p-panel>

          <p-panel header="Visión" styleClass="h-full">
            <div class="flex items-start gap-4">
              <p-avatar icon="pi pi-eye" styleClass="bg-primary text-white" shape="circle"></p-avatar>
              <p class="m-0 text-surface-600 leading-relaxed">
                Ser la plataforma de citas líder en Latinoamérica para profesionales independientes. Queremos que cuando alguien piense en gestionar citas para su negocio, lo primero que venga a su mente sea CitasYa.
              </p>
            </div>
          </p-panel>
        </div>
      </div>
    </section>

    <p-divider></p-divider>

    <!-- Stats Section -->
    <section class="stats-section py-20 px-4 bg-white">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p class="text-5xl font-bold text-primary mb-2">500+</p>
            <p class="text-surface-600">Negocios activos</p>
          </div>
          <div>
            <p class="text-5xl font-bold text-primary mb-2">50K+</p>
            <p class="text-surface-600">Citas gestionadas</p>
          </div>
          <div>
            <p class="text-5xl font-bold text-primary mb-2">15+</p>
            <p class="text-surface-600">Países</p>
          </div>
          <div>
            <p class="text-5xl font-bold text-primary mb-2">99.9%</p>
            <p class="text-surface-600">Uptime</p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class AboutComponent {}
