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
import { CompanyService } from '../../../../core/services/company.service';
import { PlanService } from '../../../../core/services/plan.service';
import { Company, CreateCompanyDto } from '../../../../core/models/company.model';
import { Plan } from '../../../../core/models/plan.model';

interface CompanyWithPlan extends Company {
  plans?: { id: string; name: string } | null;
}

@Component({
  selector: 'app-superadmin-companies',
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
  templateUrl: './superadmin-companies.component.html',
  styleUrl: './superadmin-companies.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class SuperadminCompaniesComponent implements OnInit {
  private companyService = inject(CompanyService);
  private planService = inject(PlanService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  companies = signal<CompanyWithPlan[]>([]);
  plans = signal<Plan[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  dialogVisible = signal(false);
  editingCompany = signal<CompanyWithPlan | null>(null);

  formData = signal<Partial<CreateCompanyDto>>({});

  planOptions = computed(() => 
    this.plans().map(plan => ({
      label: plan.name,
      value: plan.id,
      disabled: !plan.is_active
    }))
  );

  filteredCompanies = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.companies();
    return this.companies().filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.slug.toLowerCase().includes(term)
    );
  });

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const [companies, plans] = await Promise.all([
        this.companyService.getAll(),
        this.planService.getAllActive()
      ]);
      this.companies.set(companies);
      this.plans.set(plans);
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las empresas'
      });
    } finally {
      this.loading.set(false);
    }
  }

  openCreateDialog() {
    this.editingCompany.set(null);
    this.formData.set({
      name: '',
      slug: '',
      address: '',
      phone: '',
      plan_id: undefined
    });
    this.dialogVisible.set(true);
  }

  openEditDialog(company: CompanyWithPlan) {
    this.editingCompany.set(company);
    this.formData.set({
      name: company.name,
      slug: company.slug,
      address: company.address || '',
      phone: company.phone || '',
      plan_id: company.plan_id || undefined
    });
    this.dialogVisible.set(true);
  }

  async saveCompany() {
    const data = this.formData();
    if (!data.name || !data.slug) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Nombre y slug son requeridos'
      });
      return;
    }

    try {
      if (this.editingCompany()) {
        await this.companyService.update(this.editingCompany()!.id, data);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empresa actualizada correctamente'
        });
      } else {
        await this.companyService.create(data);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empresa creada correctamente'
        });
      }
      this.dialogVisible.set(false);
      await this.loadData();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo guardar la empresa'
      });
    }
  }

  confirmDeactivate(company: CompanyWithPlan) {
    this.confirmationService.confirm({
      message: `¿Desactivar la empresa "${company.name}"? Los usuarios no podrán acceder.`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.companyService.deactivate(company.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Empresa desactivada'
          });
          await this.loadData();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo desactivar la empresa'
          });
        }
      }
    });
  }

  confirmActivate(company: CompanyWithPlan) {
    this.confirmationService.confirm({
      message: `¿Reactivar la empresa "${company.name}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.companyService.activate(company.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Empresa reactivada'
          });
          await this.loadData();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo reactivar la empresa'
          });
        }
      }
    });
  }

  getPlanName(company: CompanyWithPlan): string {
    return company.plans?.name || 'Sin plan';
  }

  generateSlug() {
    const name = this.formData().name || '';
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    this.formData.update(d => ({ ...d, slug }));
  }
}
