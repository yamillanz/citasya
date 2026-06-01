import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { DrawerModule } from 'primeng/drawer';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../core/services/auth.service';
import { CompanyService } from '../../core/services/company.service';
import { User } from '../../core/models/user.model';

interface MenuItem {
  label: string;
  icon?: string;
  routerLink?: string;
  separator?: boolean;
}

@Component({
  selector: 'app-backoffice',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    AvatarModule,
    MenuModule,
    DrawerModule,
    ToastModule
  ],
  templateUrl: './backoffice.component.html',
  styleUrl: './backoffice.component.scss'
})
export class BackofficeComponent implements OnInit {
  private authService = inject(AuthService);
  private companyService = inject(CompanyService);
  private router = inject(Router);

  user = signal<User | null>(null);
  companyName = signal('');
  sidebarVisible = signal(false);

  private baseMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/bo/dashboard' },
    { label: 'Empleados', icon: 'pi pi-users', routerLink: '/bo/employees' },
    { label: 'Servicios', icon: 'pi pi-briefcase', routerLink: '/bo/services' },
    { label: 'Citas', icon: 'pi pi-calendar', routerLink: '/bo/appointments' },
    { label: 'Cierre Diario', icon: 'pi pi-dollar', routerLink: '/bo/close' },
    { label: 'Reportes', icon: 'pi pi-chart-bar', routerLink: '/bo/reports/weekly' },
    { label: 'Configuración', icon: 'pi pi-cog', routerLink: '/bo/settings' }
  ];

  private employeeMenuItems: MenuItem[] = [
    { label: 'Mi Calendario', icon: 'pi pi-calendar', routerLink: '/bo/mi-calendario' },
    { label: 'Mi Historial', icon: 'pi pi-clock', routerLink: '/bo/mi-historial' }
  ];

  menuItems = computed<MenuItem[]>(() => {
    const user = this.user();
    if (user?.can_be_employee) {
      return [
        ...this.baseMenuItems,
        { label: 'Empleado', separator: true },
        ...this.employeeMenuItems
      ];
    }
    return this.baseMenuItems;
  });

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    this.user.set(user);
    if (user?.company_id) {
      const company = await this.companyService.getById(user.company_id);
      if (company) {
        this.companyName.set(company.name);
      }
    }
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
