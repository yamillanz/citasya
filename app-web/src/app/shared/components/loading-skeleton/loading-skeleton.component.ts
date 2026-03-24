import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="skeleton-table">
      @for (row of skeletonRows; track $index) {
        <div class="skeleton-row">
          @for (col of skeletonColumns; track $index) {
            <p-skeleton height="2rem" />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-table {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem;
    }
    .skeleton-row {
      display: flex;
      gap: 1rem;
    }
    .skeleton-row p-skeleton {
      flex: 1;
    }
  `]
})
export class LoadingSkeletonComponent {
  rows = input(5);
  columns = input(4);
  
  get skeletonRows(): number[] {
    return Array(this.rows()).fill(0).map((_, i) => i);
  }
  
  get skeletonColumns(): number[] {
    return Array(this.columns()).fill(0).map((_, i) => i);
  }
}
