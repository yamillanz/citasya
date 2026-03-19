import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-landing-header',
  standalone: true,
  imports: [RouterLink, ButtonModule, MenuModule, DialogModule, DividerModule],
  templateUrl: './landing-header.component.html',
  styleUrl: './landing-header.component.scss'
})
export class LandingHeaderComponent {
  mobileMenuVisible = false;

  menuItems: MenuItem[] = [
    { label: 'Inicio', routerLink: '/' },
    { label: 'Características', fragment: 'features' },
    { label: 'Precios', routerLink: '/pricing' },
    { label: 'Sobre nosotros', routerLink: '/about' },
    { label: 'FAQ', routerLink: '/faq' },
    { label: 'Contacto', routerLink: '/contact' }
  ];
}
