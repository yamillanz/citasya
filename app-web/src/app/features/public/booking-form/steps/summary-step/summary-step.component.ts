import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Service } from '../../../../../core/models/service.model';
import { User } from '../../../../../core/models/user.model';
import { Company } from '../../../../../core/models/company.model';
import { formatDate } from '../../booking-form.utils';

@Component({
  selector: 'app-summary-step',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary-step.component.html',
  styleUrl: './summary-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryStepComponent {
  selectedServices = input.required<Service[]>();
  employee = input.required<User | null>();
  company = input.required<Company | null>();
  selectedDate = input.required<string>();
  selectedTime = input.required<string>();
  totalDuration = input.required<number>();
  totalPrice = input.required<number>();
  isOpenMode = input.required<boolean>();

  continue = output<void>();
  goBack = output<void>();

  formatDate(dateStr: string): string {
    return formatDate(dateStr);
  }
}
