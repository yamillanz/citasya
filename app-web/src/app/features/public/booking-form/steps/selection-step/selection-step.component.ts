import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Service } from '../../../../../core/models/service.model';

@Component({
  selector: 'app-selection-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './selection-step.component.html',
  styleUrl: './selection-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionStepComponent {
  services = input.required<Service[]>();
  selectionForm = input.required<FormGroup>();
  minDate = input.required<string>();

  proceed = output<void>();
  goBack = output<void>();

  canProceed = computed(() => {
    const form = this.selectionForm();
    return form.valid;
  });

  onProceed() {
    if (!this.canProceed()) {
      Object.values(this.selectionForm().controls).forEach((control) => {
        control.markAsTouched();
      });
      return;
    }
    this.proceed.emit();
  }
}
