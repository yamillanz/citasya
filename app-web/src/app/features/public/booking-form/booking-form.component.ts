import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CompanyService } from '../../../core/services/company.service';
import { UserService } from '../../../core/services/user.service';
import { ServiceService } from '../../../core/services/service.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Company } from '../../../core/models/company.model';
import { User } from '../../../core/models/user.model';
import { Service } from '../../../core/models/service.model';
import { fadeInUp, stepComplete, fadeIn, shakeError } from './booking-form.animations';

function atLeastOneContactValidator(): ValidatorFn {
  return (group: FormGroup): ValidationErrors | null => {
    const phone = group.get('client_phone')?.value;
    const email = group.get('client_email')?.value;
    
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    
    if (!cleanPhone && !email) {
      return { noContact: true };
    }
    
    if (cleanPhone && cleanPhone.length < 10) {
      return { invalidPhone: true };
    }
    
    return null;
  };
}

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule
  ],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss',
  animations: [fadeInUp, stepComplete, fadeIn, shakeError]
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
  services = signal<Service[]>([]);
  
  isOpenMode = signal(false);
  selectedDate = '';
  selectedTime = '';
  
  loading = signal(false);
  error = signal('');
  success = signal(false);
  currentStep = signal(0);
  submitError = signal('');
  
  notesLength = computed(() => {
    const notes = this.bookingForm.get('notes')?.value;
    return notes ? notes.length : 0;
  });

  minDate = new Date();

  selectionForm = this.fb.group({
    service_id: ['', Validators.required],
    appointment_date: ['', Validators.required],
    appointment_time: ['', Validators.required]
  });

  bookingForm = this.fb.group({
    client_name: ['', [Validators.required, Validators.minLength(2)]],
    client_phone: [''],
    client_email: [''],
    notes: ['']
  }, { validators: atLeastOneContactValidator() });

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('companySlug');
    const employeeId = this.route.snapshot.paramMap.get('employeeId');
    
    const serviceId = this.route.snapshot.queryParamMap.get('serviceId');
    const date = this.route.snapshot.queryParamMap.get('date');
    const time = this.route.snapshot.queryParamMap.get('time');

    if (!slug || !employeeId) {
      this.error.set('Parámetros incompletos');
      return;
    }

    try {
      const company = await this.companyService.getBySlug(slug);
      const employee = await this.userService.getById(employeeId);

      if (!company || !employee) {
        this.error.set('Datos no encontrados');
        return;
      }

      this.company.set(company);
      this.employee.set(employee);

      if (serviceId && date && time) {
        const service = await this.serviceService.getById(serviceId);
        if (service) {
          this.service.set(service);
          this.selectedDate = date;
          this.selectedTime = time;
          this.currentStep.set(1);
        } else {
          this.isOpenMode.set(true);
          await this.loadServices(employeeId);
        }
      } else {
        this.isOpenMode.set(true);
        await this.loadServices(employeeId);
      }
    } catch (err) {
      this.error.set('Error al cargar los datos');
    }
  }

  async loadServices(employeeId: string) {
    try {
      const services = await this.serviceService.getByEmployee(employeeId);
      this.services.set(services || []);
    } catch (err) {
      this.error.set('Error al cargar los servicios');
    }
  }

  onServiceChange(event: any) {
    const serviceId = event.value;
    const service = this.services().find(s => s.id === serviceId);
    if (service) {
      this.service.set(service);
    }
  }

  onDateSelect(event: any) {
    const date = event;
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      this.selectedDate = `${year}-${month}-${day}`;
      this.selectionForm.patchValue({ appointment_date: this.selectedDate });
    }
  }

  onTimeSelect(event: any) {
    this.selectedTime = event.value;
    this.selectionForm.patchValue({ appointment_time: this.selectedTime });
  }

  canProceedFromStep0(): boolean {
    return this.selectionForm.valid && this.selectedDate && this.selectedTime;
  }

  proceedFromStep0() {
    if (!this.canProceedFromStep0()) {
      Object.values(this.selectionForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.currentStep.set(1);
  }

  nextStep() {
    this.currentStep.set(2);
  }

  prevStep() {
    if (this.isOpenMode() && this.currentStep() === 1) {
      this.currentStep.set(0);
    } else {
      this.currentStep.set(1);
    }
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

  hasContactError(): boolean {
    return !!(this.bookingForm.errors?.['noContact'] && 
           this.bookingForm.get('client_phone')?.touched && 
           this.bookingForm.get('client_email')?.touched);
  }

  hasInvalidPhoneError(): boolean {
    return !!(this.bookingForm.errors?.['invalidPhone']);
  }

  async onSubmit() {
    Object.values(this.bookingForm.controls).forEach(control => {
      control.markAsTouched();
    });

    if (this.bookingForm.errors?.['noContact']) {
      this.submitError.set('Debes ingresar al menos un teléfono o email');
      return;
    }

    if (this.bookingForm.invalid) {
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
        client_phone: this.bookingForm.value.client_phone || undefined,
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

  formatPhone(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = this.formatPhone(input.value);
    this.bookingForm.patchValue({ client_phone: formatted });
  }
}