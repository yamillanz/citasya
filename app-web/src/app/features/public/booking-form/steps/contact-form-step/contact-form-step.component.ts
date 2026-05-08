import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { shakeError } from '../../booking-form.animations';

@Component({
  selector: 'app-contact-form-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule],
  templateUrl: './contact-form-step.component.html',
  styleUrl: './contact-form-step.component.scss',
  animations: [shakeError],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactFormStepComponent {
  bookingForm = input.required<FormGroup>();
  submitError = input('');
  loading = input(false);
  notesLength = input(0);

  submit = output<void>();
  goBack = output<void>();

  hasContactError = computed(() => {
    const form = this.bookingForm();
    return !!(
      form.errors?.['noContact'] &&
      form.get('client_phone')?.touched &&
      form.get('client_email')?.touched
    );
  });

  hasInvalidPhoneError = computed(() => {
    return !!this.bookingForm().errors?.['invalidPhone'];
  });

  getError(field: string): string {
    const control = this.bookingForm().get(field);
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

  onSubmit() {
    Object.values(this.bookingForm().controls).forEach((control) => {
      control.markAsTouched();
    });

    if (this.bookingForm().errors?.['noContact']) {
      return;
    }

    if (this.bookingForm().invalid) {
      return;
    }

    this.submit.emit();
  }
}
