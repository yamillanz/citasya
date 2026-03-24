import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from '../../../../core/services/user.service';
import { CompanyService } from '../../../../core/services/company.service';
import { User, CreateUserDto, UserRole } from '../../../../core/models/user.model';
import { Company } from '../../../../core/models/company.model';

interface UserWithCompany extends User {
  companies?: { id: string; name: string } | null;
}

@Component({
  selector: 'app-superadmin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    DialogModule,
    SelectModule,
    ConfirmDialogModule,
    ToastModule
  ],
  templateUrl: './superadmin-users.component.html',
  styleUrl: './superadmin-users.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class SuperadminUsersComponent implements OnInit {
  private userService = inject(UserService);
  private companyService = inject(CompanyService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  users = signal<UserWithCompany[]>([]);
  companies = signal<Company[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  companyFilter = signal<string | null>(null);
  dialogVisible = signal(false);
  editingUser = signal<UserWithCompany | null>(null);

  formData = signal<Partial<CreateUserDto>>({});

  roleOptions = [
    { label: 'Manager', value: 'manager' },
    { label: 'Empleado', value: 'employee' },
    { label: 'Superadmin', value: 'superadmin' }
  ];

  companyOptions = computed(() => [
    { label: 'Todas las empresas', value: null },
    ...this.companies().map(c => ({ label: c.name, value: c.id }))
  ]);

  filteredUsers = computed(() => {
    let result = this.users();
    const term = this.searchTerm().toLowerCase();
    const companyId = this.companyFilter();

    if (term) {
      result = result.filter(u => 
        u.full_name.toLowerCase().includes(term) || 
        u.email.toLowerCase().includes(term)
      );
    }

    if (companyId) {
      result = result.filter(u => u.company_id === companyId);
    }

    return result;
  });

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const [users, companies] = await Promise.all([
        this.userService.getAll(),
        this.companyService.getAll()
      ]);
      this.users.set(users);
      this.companies.set(companies);
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los usuarios'
      });
    } finally {
      this.loading.set(false);
    }
  }

  openCreateDialog() {
    this.editingUser.set(null);
    this.formData.set({
      email: '',
      full_name: '',
      phone: '',
      role: 'employee',
      company_id: undefined
    });
    this.dialogVisible.set(true);
  }

  openEditDialog(user: UserWithCompany) {
    this.editingUser.set(user);
    this.formData.set({
      email: user.email,
      full_name: user.full_name,
      phone: user.phone || '',
      role: user.role,
      company_id: user.company_id || undefined
    });
    this.dialogVisible.set(true);
  }

  async saveUser() {
    const data = this.formData();
    if (!data.email || !data.full_name || !data.role) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Email, nombre y rol son requeridos'
      });
      return;
    }

    try {
      if (this.editingUser()) {
        await this.userService.update(this.editingUser()!.id, data);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario actualizado correctamente'
        });
      } else {
        await this.userService.create(data as CreateUserDto);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario creado correctamente'
        });
      }
      this.dialogVisible.set(false);
      await this.loadData();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo guardar el usuario'
      });
    }
  }

  confirmDeactivate(user: UserWithCompany) {
    this.confirmationService.confirm({
      message: `¿Desactivar al usuario "${user.full_name}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.userService.deactivate(user.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Usuario desactivado'
          });
          await this.loadData();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo desactivar el usuario'
          });
        }
      }
    });
  }

  confirmActivate(user: UserWithCompany) {
    this.confirmationService.confirm({
      message: `¿Reactivar al usuario "${user.full_name}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.userService.activate(user.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Usuario reactivado'
          });
          await this.loadData();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo reactivar el usuario'
          });
        }
      }
    });
  }

  getRoleSeverity(role: UserRole): 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (role) {
      case 'superadmin': return 'contrast';
      case 'manager': return 'info';
      case 'employee': return 'success';
      default: return 'secondary';
    }
  }

  getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      'superadmin': 'Superadmin',
      'manager': 'Manager',
      'employee': 'Empleado'
    };
    return labels[role] || role;
  }

  getCompanyName(user: UserWithCompany): string {
    return user.companies?.name || '-';
  }
}
