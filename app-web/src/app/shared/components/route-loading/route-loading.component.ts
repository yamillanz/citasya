import { Component, signal, computed, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationStart, NavigationEnd, NavigationError, NavigationCancel, RouterOutlet } from '@angular/router';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-route-loading',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <div class="route-loading-bar">
        <p-progressBar mode="indeterminate" [style]="{ height: '4px' }" />
      </div>
    }
    <router-outlet></router-outlet>
  `,
  styles: [`
    .route-loading-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
    }
    :host ::ng-deep .route-loading-bar .p-progressbar {
      border-radius: 0;
      height: 4px;
    }
  `]
})
export class RouteLoadingComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  loading = signal(false);
  private subscription: any;

  ngOnInit() {
    this.subscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loading.set(true);
      } else if (event instanceof NavigationEnd || event instanceof NavigationError || event instanceof NavigationCancel) {
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
