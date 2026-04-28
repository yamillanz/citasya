import { Component, inject, signal, computed, effect, ElementRef, viewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { CompanyService, CompanyWithPlan } from '../../../core/services/company.service';
import { ServiceService } from '../../../core/services/service.service';
import { Service } from '../../../core/models/service.model';

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 300;

@Component({
  selector: 'app-allies',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    SkeletonModule,
    ButtonModule,
  ],
  templateUrl: './allies.page.html',
  styleUrl: './allies.page.scss',
})
export class AlliesPage implements AfterViewInit {
  private companyService = inject(CompanyService);
  private serviceService = inject(ServiceService);

  companies = signal<CompanyWithPlan[]>([]);
  servicesByCompany = signal<Record<string, Service[]>>({});
  loading = signal(true);
  error = signal('');
  searchQuery = signal('');
  hasMore = signal(true);
  loadingMore = signal(false);
  private page = 0;

  sentinel = viewChild<ElementRef<HTMLElement>>('sentinel');
  private observer: IntersectionObserver | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private currentSearchTerm = '';

  constructor() {

    effect(() => {
      const query = this.searchQuery();
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      if (query === this.currentSearchTerm) return;
      this.debounceTimer = setTimeout(() => {
        this.currentSearchTerm = query;
        this.searchAndReset();
      }, DEBOUNCE_MS);
    });
  }

  private async fetchInitial() {
    this.loading.set(true);
    this.error.set('');
    try {
      const result = await this.companyService.getActiveCompaniesPaginated(0, PAGE_SIZE, '');
      this.companies.set(result.data);
      this.hasMore.set(result.hasMore);
      this.page = 0;
      await this.fetchServices(result.data);
    } catch {
      this.error.set('No pudimos cargar los negocios');
    } finally {
      this.loading.set(false);
    }
  }

  private async fetchMore() {
    if (this.loadingMore()) return;
    this.loadingMore.set(true);
    try {
      const nextPage = this.page + 1;
      const result = await this.companyService.getActiveCompaniesPaginated(
        nextPage,
        PAGE_SIZE,
        this.currentSearchTerm
      );
      this.companies.update((current) => [...current, ...result.data]);
      this.hasMore.set(result.hasMore);
      this.page = nextPage;
      await this.fetchServices(result.data);
    } catch {
      // silently fail on load more
    } finally {
      this.loadingMore.set(false);
    }
  }

  private async searchAndReset() {
    this.loading.set(true);
    this.error.set('');
    try {
      const result = await this.companyService.getActiveCompaniesPaginated(
        0,
        PAGE_SIZE,
        this.currentSearchTerm
      );
      this.companies.set(result.data);
      this.hasMore.set(result.hasMore);
      this.page = 0;
      await this.fetchServices(result.data);
    } catch {
      this.error.set('Error al buscar negocios');
    } finally {
      this.loading.set(false);
    }
  }

  private async fetchServices(companies: CompanyWithPlan[]) {
    const ids = companies.map((c) => c.id);
    if (ids.length === 0) return;
    try {
      const map = await this.serviceService.getServicesByCompanies(ids);
      this.servicesByCompany.update((current) => {
        const merged = { ...current };
        for (const [key, svcs] of Object.entries(map)) {
          merged[key] = svcs;
        }
        return merged;
      });
    } catch {
      // silently fail
    }
  }

  showAllServices = signal<Record<string, boolean>>({});
  maxVisibleServices = 3;

  visibleServices(companyId: string): Service[] {
    const all = this.servicesByCompany()[companyId] || [];
    if (this.showAllServices()[companyId] || all.length <= this.maxVisibleServices) {
      return all;
    }
    return all.slice(0, this.maxVisibleServices);
  }

  toggleShowAll(companyId: string) {
    this.showAllServices.update((v) => ({ ...v, [companyId]: !v[companyId] }));
  }

  ngAfterViewInit() {
    this.fetchInitial().then(() => this.setupObserver());
  }

  retry() {
    this.fetchInitial();
  }

  private setupObserver() {
    if (typeof IntersectionObserver === 'undefined') return;
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && this.hasMore() && !this.loadingMore() && !this.currentSearchTerm) {
          this.fetchMore();
        }
      },
      { rootMargin: '200px' }
    );

    const el = this.sentinel()?.nativeElement;
    if (el) {
      this.observer.observe(el);
    }
  }
}
