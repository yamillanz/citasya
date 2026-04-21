import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CompanyService, CompanyWithPlan } from '../../../../core/services/company.service';
import { UserService } from '../../../../core/services/user.service';
import { PlanService } from '../../../../core/services/plan.service';
import { Company, CreateCompanyDto } from '../../../../core/models/company.model';
import { User, UserRole, CreateUserDto } from '../../../../core/models/user.model';
import { Plan } from '../../../../core/models/plan.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

interface UserWithCompany extends User {
  companies?: { id: string; name: string } | null;
}

@Component({
  selector: 'app-central-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    TagModule,
    DialogModule,
    SelectModule,
    ConfirmDialogModule,
    ToastModule,
    SkeletonModule,
    CheckboxModule,
    TooltipModule,
    EmptyStateComponent
  ],
  templateUrl: './central-management.component.html',
  styleUrl: './central-management.component.scss',
  providers: [MessageService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CentralManagementComponent implements OnInit {
  private companyService = inject(CompanyService);
  private userService = inject(UserService);
  private planService = inject(PlanService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // === COMPANIES STATE ===
  companies = signal<CompanyWithPlan[]>([]);
  plans = signal<Plan[]>([]);
  loading = signal(true);
  saving = signal(false);
  searchTerm = signal('');
  statusFilter = signal<'all' | 'active' | 'inactive'>('all');
  planFilter = signal<string | null>(null);
  selectedCompanies = signal<CompanyWithPlan[]>([]);
  editingCompanyId = signal<string | null>(null);
  clonedCompanies = signal<{ [s: string]: CompanyWithPlan }>({});

  // === USERS STATE ===
  users = signal<UserWithCompany[]>([]);
  usersLoading = signal(false);
  selectedCompanyId = signal<string | null>(null);
  selectedCompanyName = signal('');
  selectedUsers = signal<UserWithCompany[]>([]);
  editingUserId = signal<string | null>(null);
  clonedUsers = signal<{ [s: string]: UserWithCompany }>({});

  // === DIALOG STATE ===
  companyDialogVisible = signal(false);
  userDialogVisible = signal(false);
  editingCompany = signal<CompanyWithPlan | null>(null);
  editingUser = signal<UserWithCompany | null>(null);
  companyFormData = signal<Partial<CreateCompanyDto>>({});
  userFormData = signal<Partial<CreateUserDto>>({});

  // === COMPUTED ===
  planOptions = computed(() =>
    this.plans().map(plan => ({
      label: plan.name,
      value: plan.id,
      disabled: !plan.is_active
    }))
  );

  statusOptions = [
    { label: 'Todos los estados', value: 'all' },
    { label: 'Activos', value: 'active' },
    { label: 'Inactivos', value: 'inactive' }
  ];

  roleOptions = [
    { label: 'Superadmin', value: 'superadmin' },
    { label: 'Manager', value: 'manager' },
    { label: 'Empleado', value: 'employee' }
  ];

  planFilterOptions = computed(() => {
    const options: { label: string; value: string | null }[] = [
      { label: 'Todos los planes', value: null }
    ];
    for (const plan of this.plans()) {
      options.push({ label: plan.name, value: plan.id });
    }
    return options;
  });

  filteredCompanies = computed(() => {
    let result = this.companies();
    const term = this.searchTerm().toLowerCase();
    const status = this.statusFilter();
    const planId = this.planFilter();

    if (term) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term)
      );
    }
    if (status !== 'all') {
      result = result.filter(c =>
        status === 'active' ? c.is_active : !c.is_active
      );
    }
    if (planId) {
      result = result.filter(c => c.plan_id === planId);
    }
    return result;
  });

  // === LIFECYCLE ===
  async ngOnInit() {
    await this.loadCompanies();
  }

  // === COMPANIES METHODS ===
  async loadCompanies() {
    this.loading.set(true);
    try {
      const [companies, plans] = await Promise.all([
        this.companyService.getAll(),
        this.planService.getAllActive()
      ]);
      this.companies.set(companies);
      this.plans.set(plans);
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las empresas' });
    } finally {
      this.loading.set(false);
    }
  }

  onCompanyRowEditInit(company: CompanyWithPlan) {
    this.clonedCompanies.update(clone => ({ ...clone, [company.id]: { ...company } }));
    this.editingCompanyId.set(company.id);
  }

  async onCompanyRowEditSave(company: CompanyWithPlan) {
    try {
      await this.companyService.update(company.id, {
        name: company.name,
        slug: company.slug,
        address: company.address,
        phone: company.phone,
        plan_id: company.plan_id
      });
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Empresa actualizada' });
    } catch (error) {
      const clone = this.clonedCompanies()[company.id];
      if (clone) {
        Object.assign(company, clone);
      }
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la empresa' });
    } finally {
      this.clonedCompanies.update(clone => {
        const { [company.id]: _, ...rest } = clone;
        return rest;
      });
      this.editingCompanyId.set(null);
    }
  }

  onCompanyRowEditCancel(company: CompanyWithPlan, index: number) {
    const clone = this.clonedCompanies()[company.id];
    if (clone) {
      Object.assign(company, clone);
    }
    this.clonedCompanies.update(clone => {
      const { [company.id]: _, ...rest } = clone;
      return rest;
    });
    this.editingCompanyId.set(null);
  }

  selectCompany(company: CompanyWithPlan) {
    if (this.selectedCompanyId() === company.id) {
      this.selectedCompanyId.set(null);
      this.selectedCompanyName.set('');
      this.users.set([]);
      return;
    }
    this.selectedCompanyId.set(company.id);
    this.selectedCompanyName.set(company.name);
    this.loadUsers(company.id);
  }

  confirmToggleCompany(company: CompanyWithPlan) {
    const action = company.is_active ? 'desactivar' : 'reactivar';
    this.confirmationService.confirm({
      message: `¿${action.charAt(0).toUpperCase() + action.slice(1)} la empresa "${company.name}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          if (company.is_active) {
            await this.companyService.deactivate(company.id);
          } else {
            await this.companyService.activate(company.id);
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Empresa ${action === 'desactivar' ? 'desactivada' : 'reactivada'}`
          });
          await this.loadCompanies();
        } catch (error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: `No se pudo ${action} la empresa` });
        }
      }
    });
  }

  async bulkActivateCompanies() {
    const selected = this.selectedCompanies();
    if (selected.length === 0) return;
    const inactive = selected.filter(c => !c.is_active);
    if (inactive.length === 0) {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Todas las empresas seleccionadas ya están activas' });
      return;
    }
    this.confirmationService.confirm({
      message: `¿Activar ${inactive.length} empresa(s)?`,
      header: 'Confirmar activación',
      icon: 'pi pi-check-circle',
      accept: async () => {
        try {
          for (const company of inactive) {
            await this.companyService.activate(company.id);
          }
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Empresas activadas' });
          this.selectedCompanies.set([]);
          await this.loadCompanies();
        } catch (error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron activar las empresas' });
        }
      }
    });
  }

  async bulkDeactivateCompanies() {
    const selected = this.selectedCompanies();
    if (selected.length === 0) return;
    const active = selected.filter(c => c.is_active);
    if (active.length === 0) {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Todas las empresas seleccionadas ya están inactivas' });
      return;
    }
    this.confirmationService.confirm({
      message: `¿Desactivar ${active.length} empresa(s)?`,
      header: 'Confirmar desactivación',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          for (const company of active) {
            await this.companyService.deactivate(company.id);
          }
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Empresas desactivadas' });
          this.selectedCompanies.set([]);
          await this.loadCompanies();
        } catch (error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron desactivar las empresas' });
        }
      }
    });
  }

  clearFilters() {
    this.searchTerm.set('');
    this.statusFilter.set('all');
    this.planFilter.set(null);
  }

  openCreateCompanyDialog() {
    this.editingCompany.set(null);
    this.companyFormData.set({ name: '', slug: '', address: '', phone: '', plan_id: undefined });
    this.companyDialogVisible.set(true);
  }

  async saveCompany() {
    const data = this.companyFormData();
    if (!data.name || !data.slug) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'Nombre y slug son requeridos' });
      return;
    }

    this.saving.set(true);
    try {
      if (this.editingCompany()) {
        await this.companyService.update(this.editingCompany()!.id, data);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Empresa actualizada correctamente' });
      } else {
        await this.companyService.create(data as CreateCompanyDto);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Empresa creada correctamente' });
      }
      this.companyDialogVisible.set(false);
      await this.loadCompanies();
    } catch (error: any) {
      const errorMessage = error?.message?.toLowerCase() || '';
      if (errorMessage.includes('duplicate') || errorMessage.includes('unique') || errorMessage.includes('slug')) {
        this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'El slug ya existe' });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la empresa' });
      }
    } finally {
      this.saving.set(false);
    }
  }

  generateSlug() {
    const name = this.companyFormData().name || '';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    this.companyFormData.update(d => ({ ...d, slug }));
  }

  // === USERS METHODS ===
  async loadUsers(companyId: string) {
    this.usersLoading.set(true);
    try {
      const users = await this.userService.getAllByCompany(companyId);
      this.users.set(users);
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios' });
    } finally {
      this.usersLoading.set(false);
    }
  }

  onUserRowEditInit(user: UserWithCompany) {
    this.clonedUsers.update(clone => ({ ...clone, [user.id]: { ...user } }));
    this.editingUserId.set(user.id);
  }

  async onUserRowEditSave(user: UserWithCompany) {
    try {
      const updateData: Partial<User> = {
        full_name: user.full_name,
        phone: user.phone,
        role: user.role
      };

      if (user.role === 'manager') {
        updateData.can_be_employee = user.can_be_employee ?? false;
      }

      await this.userService.update(user.id, updateData);
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado' });
    } catch (error) {
      const clone = this.clonedUsers()[user.id];
      if (clone) {
        Object.assign(user, clone);
      }
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el usuario' });
    } finally {
      this.clonedUsers.update(clone => {
        const { [user.id]: _, ...rest } = clone;
        return rest;
      });
      this.editingUserId.set(null);
    }
  }

  onUserRowEditCancel(user: UserWithCompany, index: number) {
    const clone = this.clonedUsers()[user.id];
    if (clone) {
      Object.assign(user, clone);
    }
    this.clonedUsers.update(clone => {
      const { [user.id]: _, ...rest } = clone;
      return rest;
    });
    this.editingUserId.set(null);
  }

  confirmToggleUser(user: UserWithCompany) {
    const action = user.is_active ? 'desactivar' : 'reactivar';
    this.confirmationService.confirm({
      message: `¿${action.charAt(0).toUpperCase() + action.slice(1)} el usuario "${user.full_name}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          if (user.is_active) {
            await this.userService.deactivate(user.id);
          } else {
            await this.userService.activate(user.id);
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Usuario ${action === 'desactivar' ? 'desactivado' : 'reactivado'}`
          });
          const companyId = this.selectedCompanyId();
          if (companyId) {
            await this.loadUsers(companyId);
          }
        } catch (error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: `No se pudo ${action} el usuario` });
        }
      }
    });
  }

  async bulkActivateUsers() {
    const selected = this.selectedUsers();
    if (selected.length === 0) return;
    const inactive = selected.filter(u => !u.is_active);
    if (inactive.length === 0) {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Todos los usuarios seleccionados ya están activos' });
      return;
    }
    this.confirmationService.confirm({
      message: `¿Activar ${inactive.length} usuario(s)?`,
      header: 'Confirmar activación',
      icon: 'pi pi-check-circle',
      accept: async () => {
        try {
          for (const user of inactive) {
            await this.userService.activate(user.id);
          }
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuarios activados' });
          this.selectedUsers.set([]);
          const companyId = this.selectedCompanyId();
          if (companyId) {
            await this.loadUsers(companyId);
          }
        } catch (error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron activar los usuarios' });
        }
      }
    });
  }

  async bulkDeactivateUsers() {
    const selected = this.selectedUsers();
    if (selected.length === 0) return;
    const active = selected.filter(u => u.is_active);
    if (active.length === 0) {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Todos los usuarios seleccionados ya están inactivos' });
      return;
    }
    this.confirmationService.confirm({
      message: `¿Desactivar ${active.length} usuario(s)?`,
      header: 'Confirmar desactivación',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          for (const user of active) {
            await this.userService.deactivate(user.id);
          }
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuarios desactivados' });
          this.selectedUsers.set([]);
          const companyId = this.selectedCompanyId();
          if (companyId) {
            await this.loadUsers(companyId);
          }
        } catch (error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron desactivar los usuarios' });
        }
      }
    });
  }

  openCreateUserDialog() {
    const companyId = this.selectedCompanyId();
    if (!companyId) return;
    this.editingUser.set(null);
    this.userFormData.set({ email: '', full_name: '', phone: '', role: 'employee', company_id: companyId, can_be_employee: false, password: '' });
    this.userDialogVisible.set(true);
  }

  async saveUser() {
    const data = this.userFormData();
    if (!data.email || !data.full_name || !data.role) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'Email, nombre y rol son requeridos' });
      return;
    }

    if (!this.editingUser()) {
      if (!data.password) {
        this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'La contraseña es requerida para crear un usuario' });
        return;
      }
      if (data.password.length < 6) {
        this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'La contraseña debe tener al menos 6 caracteres' });
        return;
      }
    }

    this.saving.set(true);
    try {
      if (this.editingUser()) {
        const { password, ...updateData } = data;
        await this.userService.update(this.editingUser()!.id, updateData);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado correctamente' });
      } else {
        await this.userService.create(data as CreateUserDto);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado correctamente' });
      }
      this.userDialogVisible.set(false);
      const companyId = this.selectedCompanyId();
      if (companyId) {
        await this.loadUsers(companyId);
      }
    } catch (error: any) {
      const errorMessage = error?.message?.toLowerCase() || '';
      if (errorMessage.includes('duplicate') || errorMessage.includes('unique') || errorMessage.includes('email')) {
        this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'El email ya existe' });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el usuario' });
      }
    } finally {
      this.saving.set(false);
    }
  }

  // === HELPERS ===
  getPlanName(company: CompanyWithPlan): string {
    return company.plans?.name || 'Sin plan';
  }

  getRoleLabel(role: UserRole): string {
    const map: Record<UserRole, string> = { superadmin: 'Superadmin', manager: 'Manager', employee: 'Empleado' };
    return map[role] || role;
  }

  getRoleSeverity(role: UserRole): 'success' | 'info' | 'contrast' | 'secondary' {
    const map: Record<UserRole, 'success' | 'info' | 'contrast' | 'secondary'> = { superadmin: 'contrast', manager: 'info', employee: 'success' };
    return map[role] || 'secondary';
  }
}