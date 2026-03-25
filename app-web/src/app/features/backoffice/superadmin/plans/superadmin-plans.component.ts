import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PlanService } from '../../../../core/services/plan.service';
import { Plan, CreatePlanDto } from '../../../../core/models/plan.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-superadmin-plans',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TagModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    SkeletonModule,
    EmptyStateComponent
  ],
  templateUrl: './superadmin-plans.component.html',
  styleUrl: './superadmin-plans.component.scss',
  providers: [MessageService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuperadminPlansComponent implements OnInit {
  private planService = inject(PlanService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  plans = signal<Plan[]>([]);
  loading = signal(true);
  saving = signal(false);
  searchTerm = signal('');
  dialogVisible = signal(false);
  editingPlan = signal<Plan | null>(null);

  formData = signal<Partial<CreatePlanDto>>({});

  filteredPlans = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.plans();
    return this.plans().filter(p => p.name.toLowerCase().includes(term));
  });

  async ngOnInit() {
    await this.loadPlans();
  }

  async loadPlans() {
    this.loading.set(true);
    try {
      const plans = await this.planService.getAll();
      this.plans.set(plans);
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los planes'
      });
    } finally {
      this.loading.set(false);
    }
  }

  openCreateDialog() {
    this.editingPlan.set(null);
    this.formData.set({
      name: '',
      price: 0,
      max_users: 1,
      max_companies: 1
    });
    this.dialogVisible.set(true);
  }

  openEditDialog(plan: Plan) {
    this.editingPlan.set(plan);
    this.formData.set({
      name: plan.name,
      price: plan.price,
      max_users: plan.max_users,
      max_companies: plan.max_companies
    });
    this.dialogVisible.set(true);
  }

  async savePlan() {
    const data = this.formData();
    if (!data.name || data.price === undefined || data.max_users === undefined || data.max_companies === undefined) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Todos los campos son requeridos'
      });
      return;
    }

    this.saving.set(true);
    try {
      if (this.editingPlan()) {
        await this.planService.update(this.editingPlan()!.id, data);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Plan actualizado correctamente'
        });
      } else {
        await this.planService.create(data as CreatePlanDto);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Plan creado correctamente'
        });
      }
      this.dialogVisible.set(false);
      await this.loadPlans();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo guardar el plan'
      });
    } finally {
      this.saving.set(false);
    }
  }

  confirmDeactivate(plan: Plan) {
    this.confirmationService.confirm({
      message: `¿Desactivar el plan "${plan.name}"? Las empresas con este plan seguirán teniendo acceso.`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.planService.deactivate(plan.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Plan desactivado'
          });
          await this.loadPlans();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo desactivar el plan'
          });
        }
      }
    });
  }

  confirmActivate(plan: Plan) {
    this.confirmationService.confirm({
      message: `¿Reactivar el plan "${plan.name}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.planService.activate(plan.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Plan reactivado'
          });
          await this.loadPlans();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo reactivar el plan'
          });
        }
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}
