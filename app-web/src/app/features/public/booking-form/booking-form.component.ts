import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CompanyService } from '../../../core/services/company.service';
import { UserService } from '../../../core/services/user.service';
import { ServiceService } from '../../../core/services/service.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Company } from '../../../core/models/company.model';
import { User } from '../../../core/models/user.model';
import { Service } from '../../../core/models/service.model';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss'
})
export class BookingFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private userService = inject(UserService);
  private serviceService = inject(ServiceService);
  private appointmentService = inject(AppointmentService);

  company = signal<Company | null>(null);
  employee = signal<User | null>(null);
  service = signal<Service | null>(null);
  selectedDate = '';
  selectedTime = '';
  loading = signal(false);
  error = signal('');
  success = signal(false);
  currentStep = signal(1);
  submitError = signal('');

  bookingForm = this.fb.group({
    client_name: ['', [Validators.required, Validators.minLength(2)]],
    client_phone: ['', [Validators.required, Validators.minLength(8)]],
    client_email: [''],
    notes: ['']
  });

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('companySlug');
    const employeeId = this.route.snapshot.paramMap.get('employeeId');
    
    this.selectedDate = this.route.snapshot.queryParamMap.get('date') || '';
    const serviceId = this.route.snapshot.queryParamMap.get('serviceId');
    this.selectedTime = this.route.snapshot.queryParamMap.get('time') || '';

    if (!slug || !employeeId || !this.selectedDate || !serviceId || !this.selectedTime) {
      this.error.set('Parámetros incompletos');
      return;
    }

    try {
      const company = await this.companyService.getBySlug(slug);
      const employee = await this.userService.getById(employeeId);
      const service = await this.serviceService.getById(serviceId);

      if (!company || !employee || !service) {
        this.error.set('Datos no encontrados');
        return;
      }

      this.company.set(company);
      this.employee.set(employee);
      this.service.set(service);
    } catch (err) {
      this.error.set('Error al cargar los datos');
    }
  }

  nextStep() {
    this.currentStep.set(2);
  }

  prevStep() {
    this.currentStep.set(1);
  }

  getError(field: string): string {
    const control = this.bookingForm.get(field);
    if (control?.hasError('required') && control?.touched) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('minlength') && control?.touched) {
      return 'El valor es muy corto';
    }
    if (control?.hasError('email') && control?.touched) {
      return 'El email no es válido';
    }
    return '';
  }

  async onSubmit() {
    if (this.bookingForm.invalid) {
      Object.values(this.bookingForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    const comp = this.company();
    const emp = this.employee();
    const serv = this.service();

    if (!comp || !emp || !serv) {
      return;
    }

    this.loading.set(true);
    this.submitError.set('');

    try {
      await this.appointmentService.create({
        company_id: comp.id,
        employee_id: emp.id,
        service_id: serv.id,
        client_name: this.bookingForm.value.client_name!,
        client_phone: this.bookingForm.value.client_phone!,
        client_email: this.bookingForm.value.client_email || undefined,
        appointment_date: this.selectedDate,
        appointment_time: this.selectedTime,
        notes: this.bookingForm.value.notes || undefined
      });

      this.currentStep.set(3);
      this.success.set(true);
    } catch (err: any) {
      this.submitError.set(err.message || 'Error al crear la reserva');
    } finally {
      this.loading.set(false);
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
