import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-superadmin-transactions',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './superadmin-transactions.component.html',
  styleUrl: './superadmin-transactions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuperadminTransactionsComponent {}
