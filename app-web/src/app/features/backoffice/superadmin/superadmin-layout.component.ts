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
  selector: 'app-superadmin-layout',
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
  templateUrl: './superadmin-layout.component.html',
  styleUrl: './superadmin-layout.component.scss'
})
export class SuperadminLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = signal<User | null>(null);
  sidebarVisible = signal(false);

  menuItems = [
    { label: 'Gestión', icon: 'pi pi-cog', routerLink: '/sa/management' },
    { label: 'Planes', icon: 'pi pi-credit-card', routerLink: '/sa/plans' },
    { label: 'Transacciones', icon: 'pi pi-dollar', routerLink: '/sa/transactions' }
  ];

  async ngOnInit() {
    this.user.set(await this.authService.getCurrentUser());
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
