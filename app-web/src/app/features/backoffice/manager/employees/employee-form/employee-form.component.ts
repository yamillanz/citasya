import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../../core/services/auth.service';
import { UserService } from '../../../../../core/services/user.service';
import { ServiceService } from '../../../../../core/services/service.service';
import { User, UserRole } from '../../../../../core/models/user.model';
import { Service } from '../../../../../core/models/service.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss'
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private serviceService = inject(ServiceService);
  private messageService = inject(MessageService);

  isEdit = signal(false);
  employeeId = signal('');
  loading = signal(false);
  saving = signal(false);
  services = signal<Service[]>([]);
  selectedServices = signal<string[]>([]);
  companyId = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
    photo_url: ['']
  });

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user?.company_id) {
      this.companyId.set(user.company_id);
      await this.loadServices();
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.employeeId.set(id);
      await this.loadEmployee();
    }
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

  async loadEmployee() {
    this.loading.set(true);
    try {
      const employee = await this.userService.getById(this.employeeId());
      if (employee) {
        this.form.patchValue({
          email: employee.email,
          full_name: employee.full_name,
          phone: employee.phone || '',
          photo_url: employee.photo_url || ''
        });
        // TODO: Load assigned services
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Empleado no encontrado'
        });
        this.router.navigate(['/bo/employees']);
      }
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar el empleado'
      });
    } finally {
      this.loading.set(false);
    }
  }

  onServiceToggle(serviceId: string) {
    const current = this.selectedServices();
    if (current.includes(serviceId)) {
      this.selectedServices.set(current.filter(id => id !== serviceId));
    } else {
      this.selectedServices.set([...current, serviceId]);
    }
  }

  isServiceSelected(serviceId: string): boolean {
    return this.selectedServices().includes(serviceId);
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    try {
      const formValue = this.form.value;

      const data: any = {
        email: formValue.email!,
        full_name: formValue.full_name!,
        phone: formValue.phone || null,
        photo_url: formValue.photo_url || null,
        role: 'employee' as UserRole
      };

      if (this.isEdit()) {
        await this.userService.update(this.employeeId(), data);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empleado actualizado correctamente'
        });
      } else {
        data.company_id = this.companyId();
        await this.userService.create(data);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Empleado creado correctamente'
        });
      }

      this.router.navigate(['/bo/employees']);
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo guardar el empleado'
      });
    } finally {
      this.saving.set(false);
    }
  }

  markAllAsTouched() {
    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  get emailError(): string {
    const control = this.form.get('email');
    if (control?.hasError('required') && control?.touched) {
      return 'El email es requerido';
    }
    if (control?.hasError('email') && control?.touched) {
      return 'El email no es válido';
    }
    return '';
  }

  get fullNameError(): string {
    const control = this.form.get('full_name');
    if (control?.hasError('required') && control?.touched) {
      return 'El nombre es requerido';
    }
    if (control?.hasError('minlength') && control?.touched) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    return '';
  }
}
