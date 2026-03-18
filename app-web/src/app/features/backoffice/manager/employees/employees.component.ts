import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    AvatarModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);

  employees = signal<User[]>([]);
  loading = signal(true);
  companyId = signal<string | null>(null);

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user?.company_id) {
      this.companyId.set(user.company_id);
      await this.loadEmployees();
    }
    this.loading.set(false);
  }

  async loadEmployees() {
    if (!this.companyId()) return;
    
    try {
      const employees = await this.userService.getByCompany(this.companyId()!);
      this.employees.set(employees);
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los empleados'
      });
    }
  }

  async toggleEmployeeStatus(employee: User) {
    try {
      await this.userService.update(employee.id, { is_active: !employee.is_active });
      employee.is_active = !employee.is_active;
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: `Empleado ${employee.is_active ? 'activado' : 'desactivado'} correctamente`
      });
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el estado del empleado'
      });
    }
  }
}
