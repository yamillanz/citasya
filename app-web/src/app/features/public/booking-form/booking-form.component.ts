import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss']
})
export class BookingFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private userService = inject(UserService);
  private serviceService = inject(ServiceService);
  private appointmentService = inject(AppointmentService);

  company: Company | null = null;
  employee: User | null = null;
  service: Service | null = null;
  selectedDate = '';
  selectedTime = '';
  loading = false;
  error = '';
  success = false;

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
      this.error = 'Parámetros incompletos';
      return;
    }

    this.company = await this.companyService.getBySlug(slug);
    this.employee = await this.userService.getById(employeeId);
    this.service = await this.serviceService.getById(serviceId);

    if (!this.company || !this.employee || !this.service) {
      this.error = 'Datos no encontrados';
    }
  }

  async onSubmit() {
    if (this.bookingForm.invalid || !this.company || !this.employee || !this.service) {
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.appointmentService.create({
        company_id: this.company.id,
        employee_id: this.employee.id,
        service_id: this.service.id,
        client_name: this.bookingForm.value.client_name!,
        client_phone: this.bookingForm.value.client_phone!,
        client_email: this.bookingForm.value.client_email || undefined,
        appointment_date: this.selectedDate,
        appointment_time: this.selectedTime,
        notes: this.bookingForm.value.notes || undefined
      });

      this.success = true;
    } catch (err: any) {
      this.error = err.message || 'Error al crear la reserva';
    } finally {
      this.loading = false;
    }
  }
}
