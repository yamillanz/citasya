import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidationErrors,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CompanyService } from '../../../core/services/company.service';
import { UserService } from '../../../core/services/user.service';
import { ServiceService } from '../../../core/services/service.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { EmailNotificationService } from '../../../core/services/email-notification.service';
import { Company } from '../../../core/models/company.model';
import { User } from '../../../core/models/user.model';
import { Service } from '../../../core/models/service.model';
import {
  calculateTotalDuration,
  calculateTotalPrice,
  formatServicesList,
} from '../../../core/models/appointment.model';
import { fadeInUp } from './booking-form.animations';
import { SelectionStepComponent } from './steps/selection-step/selection-step.component';
import { SummaryStepComponent } from './steps/summary-step/summary-step.component';
import { ContactFormStepComponent } from './steps/contact-form-step/contact-form-step.component';
import { SuccessStepComponent } from './steps/success-step/success-step.component';

function atLeastOneContactValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;
    const phone = group.get('client_phone')?.value;
    const email = group.get('client_email')?.value;

    if (!phone?.trim() && !email?.trim()) {
      return { noContact: true };
    }

    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    if (cleanPhone && cleanPhone.length < 12) {
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
    SelectionStepComponent,
    SummaryStepComponent,
    ContactFormStepComponent,
    SuccessStepComponent,
  ],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss',
  animations: [fadeInUp],
})
export class BookingFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private userService = inject(UserService);
  private serviceService = inject(ServiceService);
  private appointmentService = inject(AppointmentService);
  private emailNotificationService = inject(EmailNotificationService);

  company = signal<Company | null>(null);
  employee = signal<User | null>(null);
  selectedServices = signal<Service[]>([]);
  services = signal<Service[]>([]);
  serviceIds = signal<string[]>([]);

  isOpenMode = signal(false);
  selectedDate = '';
  selectedTime = '';

  loading = signal(false);
  error = signal('');
  success = signal(false);
  currentStep = signal(0);
  submitError = signal('');
  initialLoading = signal(true);

  totalDuration = computed(() => calculateTotalDuration(this.selectedServices()));

  totalPrice = computed(() => calculateTotalPrice(this.selectedServices()));

  selectedServicesText = computed(() => formatServicesList(this.selectedServices()));

  notesLength = computed(() => {
    const notes = this.bookingForm.get('notes')?.value;
    return notes ? notes.length : 0;
  });

  minDate = this.toDateString(new Date());

  selectionForm = this.fb.group({
    service_id: ['', Validators.required],
    appointment_date: ['', Validators.required],
    appointment_time: ['', Validators.required],
  });

  bookingForm = this.fb.group(
    {
      client_name: ['', [Validators.required, Validators.minLength(2)]],
      client_phone: [''],
      client_email: [''],
      notes: [''],
    },
    { validators: atLeastOneContactValidator() },
  );

  private toDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('companySlug');
    const employeeId = this.route.snapshot.paramMap.get('employeeId');

    const serviceIdsParam = this.route.snapshot.queryParamMap.get('serviceIds');
    const date = this.route.snapshot.queryParamMap.get('date');
    const time = this.route.snapshot.queryParamMap.get('time');

    if (!slug || !employeeId) {
      this.error.set('Parámetros incompletos');
      this.initialLoading.set(false);
      return;
    }

    try {
      const company = await this.companyService.getBySlug(slug);
      const employee = await this.userService.getById(employeeId);

      if (!company || !employee) {
        this.error.set('Datos no encontrados');
        this.initialLoading.set(false);
        return;
      }

      this.company.set(company);
      this.employee.set(employee);

      if (serviceIdsParam && date && time) {
        const ids = serviceIdsParam.split(',');
        this.serviceIds.set(ids);
        this.selectedDate = date;
        this.selectedTime = time;

        await this.loadServicesByIds(ids);
        this.currentStep.set(1);
      } else {
        this.isOpenMode.set(true);
        await this.loadServices(employeeId);
      }
    } catch (err) {
      this.error.set('Error al cargar los datos');
    } finally {
      this.initialLoading.set(false);
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

  async loadServicesByIds(ids: string[]) {
    try {
      const allServices = await this.serviceService.getByEmployee(this.employee()!.id);
      const selected = allServices.filter((s) => ids.includes(s.id));
      this.selectedServices.set(selected);
    } catch (err) {
      this.error.set('Error al cargar los servicios');
    }
  }

  onSelectionProceed() {
    this.selectedDate = this.selectionForm.value.appointment_date!;
    this.selectedTime = this.selectionForm.value.appointment_time!;

    const serviceId = this.selectionForm.value.service_id;
    const service = this.services().find((s) => s.id === serviceId);
    if (service) {
      this.selectedServices.set([service]);
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

  async onSubmit() {
    if (this.loading()) {
      return;
    }

    const comp = this.company();
    const emp = this.employee();
    const services = this.selectedServices();

    if (!comp || !emp || services.length === 0) {
      return;
    }

    this.loading.set(true);
    this.submitError.set('');

    const phoneRaw = this.bookingForm.value.client_phone?.trim() || '';
    const phone = phoneRaw.replace(/\D/g, '') || undefined;
    const email = this.bookingForm.value.client_email?.trim() || undefined;

    if (!email && phone && phone.length < 12) {
      this.submitError.set('El teléfono debe tener al menos 12 dígitos si no proporcionas email');
      this.loading.set(false);
      return;
    }

    try {
      const newAppointment = await this.appointmentService.create({
        company_id: comp.id,
        employee_id: emp.id,
        service_ids: services.map((s) => s.id),
        client_name: this.bookingForm.value.client_name!,
        client_phone: phone,
        client_email: email,
        appointment_date: this.selectedDate,
        appointment_time: this.selectedTime,
        notes: this.bookingForm.value.notes || undefined,
      });

      this.currentStep.set(3);
      this.success.set(true);

      this.emailNotificationService.notify(newAppointment.id, 'created');
    } catch (err: any) {
      this.submitError.set(err.message || 'Error al crear la reserva');
    } finally {
      this.loading.set(false);
    }
  }

  goHome() {
    this.router.navigate(['/c', this.company()?.slug]);
  }
}
