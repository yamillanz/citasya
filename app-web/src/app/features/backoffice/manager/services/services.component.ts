import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/services/auth.service';
import { ServiceService } from '../../../../core/services/service.service';
import { Service } from '../../../../core/models/service.model';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit {
  private authService = inject(AuthService);
  private serviceService = inject(ServiceService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  services = signal<Service[]>([]);
  loading = signal(true);
  companyId = signal<string | null>(null);
  searchQuery = signal('');
  viewMode = signal<'grid' | 'list'>('grid');

  filteredServices = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.services();
    
    return this.services().filter(s => 
      s.name.toLowerCase().includes(query)
    );
  });

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user?.company_id) {
      this.companyId.set(user.company_id);
      await this.loadServices();
    }
    this.loading.set(false);
  }

  async loadServices() {
    if (!this.companyId()) return;
    
    try {
      const services = await this.serviceService.getByCompany(this.companyId()!);
      this.services.set(services);
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los servicios'
      });
    }
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  clearFilters() {
    this.searchQuery.set('');
  }

  confirmDelete(service: Service) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el servicio "${service.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteService(service.id)
    });
  }

  async deleteService(id: string) {
    try {
      await this.serviceService.delete(id);
      this.services.set(this.services().filter(s => s.id !== id));
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Servicio eliminado correctamente'
      });
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo eliminar el servicio'
      });
    }
  }
}
