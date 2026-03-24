import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DrawerModule } from 'primeng/drawer';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../../core/services/auth.service';
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
    ToastModule
  ],
  templateUrl: './employee-layout.component.html',
  styleUrl: './employee-layout.component.scss'
})
export class EmployeeLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = signal<User | null>(null);
  sidebarVisible = signal(false);

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
}
