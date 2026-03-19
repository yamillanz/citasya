import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { LandingHeaderComponent } from '../../../shared/components/landing-header/landing-header.component';

@Component({
  selector: 'app-landing-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, DividerModule, AvatarModule, LandingHeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class LandingHomeComponent {
  steps = [
    {
      title: 'Crea tu cuenta',
      description: 'Regístrate en menos de 2 minutos y configura tu empresa.'
    },
    {
      title: 'Agrega servicios',
      description: 'Define los servicios que ofreces, duración y precios.'
    },
    {
      title: 'Invita empleados',
      description: 'Añade a tu equipo y asigna los servicios que pueden realizar.'
    },
    {
      title: 'Comparte tu enlace',
      description: 'Los clientes reservan directamente sin necesidad de registro.'
    }
  ];
}
