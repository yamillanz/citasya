import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../../core/services/auth.service';
import { ServiceService } from '../../../../../core/services/service.service';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './service-form.component.html',
  styleUrl: './service-form.component.scss'
})
export class ServiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private serviceService = inject(ServiceService);
  private messageService = inject(MessageService);

  isEdit = signal(false);
  serviceId = signal('');
  loading = signal(false);
  saving = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    duration_minutes: [30, [Validators.required, Validators.min(5)]],
    price: [null as number | null]
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.serviceId.set(id);
      await this.loadService();
    }
  }

  async loadService() {
    this.loading.set(true);
    try {
      const service = await this.serviceService.getById(this.serviceId());
      if (service) {
        this.form.patchValue({
          name: service.name,
          duration_minutes: service.duration_minutes,
          price: service.price
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Servicio no encontrado'
        });
        this.router.navigate(['/bo/services']);
      }
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar el servicio'
      });
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    try {
      const user = await this.authService.getCurrentUser();
      const formValue = this.form.value;

      const data: any = {
        name: formValue.name!,
        duration_minutes: formValue.duration_minutes!,
        price: formValue.price || null
      };

      if (this.isEdit()) {
        await this.serviceService.update(this.serviceId(), data);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Servicio actualizado correctamente'
        });
      } else {
        data.company_id = user!.company_id;
        await this.serviceService.create(data);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Servicio creado correctamente'
        });
      }

      this.router.navigate(['/bo/services']);
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo guardar el servicio'
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

  setDuration(minutes: number) {
    this.form.patchValue({ duration_minutes: minutes });
    this.form.get('duration_minutes')?.markAsDirty();
  }

  get nameError(): string {
    const control = this.form.get('name');
    if (control?.hasError('required') && control?.touched) {
      return 'El nombre es requerido';
    }
    if (control?.hasError('minlength') && control?.touched) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    return '';
  }

  get durationError(): string {
    const control = this.form.get('duration_minutes');
    if (control?.hasError('required') && control?.touched) {
      return 'La duración es requerida';
    }
    if (control?.hasError('min') && control?.touched) {
      return 'La duración mínima es 5 minutos';
    }
    return '';
  }
}
