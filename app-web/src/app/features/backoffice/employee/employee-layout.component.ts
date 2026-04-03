import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DrawerModule } from 'primeng/drawer';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { CompanyService } from '../../../core/services/company.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-employee-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    AvatarModule,
    DrawerModule,
    ToastModule,
    TooltipModule
  ],
  templateUrl: './employee-layout.component.html',
  styleUrl: './employee-layout.component.scss'
})
export class EmployeeLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private companyService = inject(CompanyService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  user = signal<User | null>(null);
  sidebarVisible = signal(false);
  copying = signal(false);

  menuItems = [
    { label: 'Mi Calendario', icon: 'pi pi-calendar', routerLink: '/emp/calendar' },
    { label: 'Mi Historial', icon: 'pi pi-history', routerLink: '/emp/history' }
  ];

  async ngOnInit() {
    this.user.set(await this.authService.getCurrentUser());
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }

  async copyBookingLink() {
    const user = this.user();
    if (!user?.company_id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo obtener la información de la empresa'
      });
      return;
    }

    this.copying.set(true);
    try {
      const company = await this.companyService.getById(user.company_id);
      if (!company?.slug) {
        throw new Error('Company slug not found');
      }

      const bookingUrl = `${window.location.origin}/c/${company.slug}/e/${user.id}/book`;
      await navigator.clipboard.writeText(bookingUrl);

      this.messageService.add({
        severity: 'success',
        summary: 'Link copiado',
        detail: 'Link copiado al portapapeles',
        life: 3000
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo copiar el link. Por favor intenta de nuevo.'
      });
    } finally {
      this.copying.set(false);
    }
  }
}
