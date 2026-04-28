import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CompanyService } from '../../../core/services/company.service';
import { UserService } from '../../../core/services/user.service';
import { ServiceService } from '../../../core/services/service.service';
import { Company } from '../../../core/models/company.model';
import { User } from '../../../core/models/user.model';
import { Service } from '../../../core/models/service.model';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    AvatarModule,
    ProgressSpinnerModule
  ],
  templateUrl: './company-list.component.html',
  styleUrl: './company-list.component.scss'
})
export class CompanyListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private companyService = inject(CompanyService);
  private userService = inject(UserService);
  private serviceService = inject(ServiceService);

  company = signal<Company | null>(null);
  employees = signal<User[]>([]);
  servicesByEmployee = signal<Record<string, Service[]>>({});
  loading = signal(true);
  error = signal('');

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('companySlug') || '';
    if (!slug) {
      this.error.set('Empresa no encontrada');
      this.loading.set(false);
      return;
    }

    try {
      const company = await this.companyService.getBySlug(slug);
      if (!company) {
        this.error.set('Empresa no encontrada');
        this.loading.set(false);
        return;
      }

      this.company.set(company);
      const employees = await this.userService.getEmployeesByCompany(company.id);
      this.employees.set(employees);
      const employeeIds = employees.map(e => e.id);
      const servicesMap = await this.serviceService.getServicesForEmployees(employeeIds);
      this.servicesByEmployee.set(servicesMap);
    } catch (err) {
      this.error.set('Error al cargar los datos');
    } finally {
      this.loading.set(false);
    }
  }
}
