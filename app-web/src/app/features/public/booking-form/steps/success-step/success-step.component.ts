import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Service } from '../../../../../core/models/service.model';
import { User } from '../../../../../core/models/user.model';
import { Company } from '../../../../../core/models/company.model';
import { formatDate } from '../../booking-form.utils';
import { stepComplete } from '../../booking-form.animations';

@Component({
  selector: 'app-success-step',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './success-step.component.html',
  styleUrl: './success-step.component.scss',
  animations: [stepComplete],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessStepComponent {
  selectedServices = input.required<Service[]>();
  employee = input.required<User | null>();
  company = input.required<Company | null>();
  selectedDate = input.required<string>();
  selectedTime = input.required<string>();
  totalDuration = input.required<number>();
  totalPrice = input.required<number>();

  goHome = output<void>();

  formatDate(dateStr: string): string {
    return formatDate(dateStr);
  }
}
