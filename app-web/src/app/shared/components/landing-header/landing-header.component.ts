import { Component, inject } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { DrawerModule } from 'primeng/drawer';
import { DividerModule } from 'primeng/divider';
import { MenuItem } from 'primeng/api';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-landing-header',
  standalone: true,
  imports: [RouterLink, ButtonModule, MenuModule, DrawerModule, DividerModule],
  templateUrl: './landing-header.component.html',
  styleUrl: './landing-header.component.scss'
})
export class LandingHeaderComponent {
  private router = inject(Router);
  mobileMenuVisible = false;
  currentUrl = '';

  menuItems: MenuItem[] = [
    { label: 'Inicio', routerLink: '/' },
    { label: 'Características', routerLink: '/', fragment: 'features' },
    { label: 'Precios', routerLink: '/pricing' },
    { label: 'Sobre nosotros', routerLink: '/about' },
    { label: 'Contacto', routerLink: '/contact' }
  ];

  constructor() {
    this.currentUrl = this.router.url;
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.urlAfterRedirects;
      });
  }

  isActive(item: MenuItem): boolean {
    const url = this.currentUrl;
    const path = url.split('#')[0];
    const fragment = url.includes('#') ? url.split('#')[1] : '';

    if (item.routerLink === '/') {
      if (item.fragment) {
        return path === '/' && fragment === item.fragment;
      }
      return path === '/' && !fragment;
    }

    return path === item.routerLink;
  }
}
