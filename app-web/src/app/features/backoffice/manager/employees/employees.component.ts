import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
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
    FormsModule,
    ButtonModule,
    AvatarModule,
    TagModule,
    ToastModule,
    TooltipModule
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
  searchQuery = signal('');
  statusFilter = signal<'all' | 'active' | 'inactive'>('all');

  activeCount = computed(() => this.employees().filter(e => e.is_active).length);
  inactiveCount = computed(() => this.employees().filter(e => !e.is_active).length);

  filteredEmployees = computed(() => {
    let result = this.employees();
    
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter(e => 
        e.full_name.toLowerCase().includes(query) ||
        e.email.toLowerCase().includes(query)
      );
    }
    
    const status = this.statusFilter();
    if (status === 'active') {
      result = result.filter(e => e.is_active);
    } else if (status === 'inactive') {
      result = result.filter(e => !e.is_active);
    }
    
    return result;
  });

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

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.statusFilter.set('all');
  }

  async toggleEmployeeStatus(employee: User) {
    try {
      await this.userService.update(employee.id, { is_active: !employee.is_active });
      employee.is_active = !employee.is_active;
      this.employees.set([...this.employees()]);
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
