import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state">
      <i [class]="icon()"></i>
      <h3>{{ title() }}</h3>
      @if (description()) {
        <p>{{ description() }}</p>
      }
      @if (actionLabel()) {
        <p-button
          [label]="actionLabel()"
          [severity]="actionSeverity()"
          (onClick)="actionClick.emit()"
        />
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      text-align: center;
    }
    .empty-state i {
      font-size: 4rem;
      color: var(--text-color-secondary);
      margin-bottom: 1rem;
    }
    .empty-state h3 {
      margin: 0 0 0.5rem;
      color: var(--text-color);
    }
    .empty-state p {
      margin: 0 0 1.5rem;
      color: var(--text-color-secondary);
    }
  `]
})
export class EmptyStateComponent {
  icon = input('pi pi-inbox');
  title = input('No hay datos registrados');
  description = input<string>('');
  actionLabel = input<string>('');
  actionSeverity = input<'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast' | 'help'>('primary');
  actionClick = output<void>();
}
