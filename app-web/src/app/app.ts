import { Component, signal, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ProgressBarModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit, OnDestroy {
  private router = inject(Router);
  loading = signal(false);
  private subscription: any;
  
  protected readonly title = signal('app-web');

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
