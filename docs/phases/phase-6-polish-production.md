# Phase 6: Polish & Production

## Goal
UI improvements, testing, and deployment

## Estimated Time
~4 hours

## Prerequisites
- All previous phases completed

---

## Task 6.1: Mobile Responsive Testing and Fixes

**Steps:**

- [ ] **Step 1: Test on mobile viewport**

Run browser dev tools and test at:
- 320px (iPhone SE)
- 375px (iPhone 12/13)
- 414px (iPhone Plus)
- 768px (iPad)

- [ ] **Step 2: Fix navigation for mobile**

Create bottom navigation component:

```typescript
// src/app/shared/components/bottom-nav/bottom-nav.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav">
      <a *ngFor="let item of items" 
         [routerLink]="item.route" 
         routerLinkActive="active">
        <span class="icon">{{ item.icon }}</span>
        <span class="label">{{ item.label }}</span>
      </a>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      background: var(--surface-color);
      border-top: 1px solid var(--border-color);
      padding: var(--spacing-sm);
      z-index: 100;
    }
    .bottom-nav a {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--spacing-sm);
      text-decoration: none;
      color: var(--text-secondary);
      transition: color 0.2s;
    }
    .bottom-nav a.active {
      color: var(--primary-color);
    }
    .icon { font-size: 1.5rem; }
    .label { font-size: 0.75rem; }
  `]
})
export class BottomNavComponent {
  @Input() items: { route: string; icon: string; label: string }[] = [];
}
```

- [ ] **Step 3: Add responsive grid utilities**

```scss
// src/styles.scss - Add responsive utilities
.hide-mobile { display: none; }
.hide-desktop { display: block; }

@media (min-width: 768px) {
  .hide-mobile { display: block; }
  .hide-desktop { display: none; }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
```

---

## Task 6.2: Error Handling and Loading States

**Steps:**

- [ ] **Step 1: Create shared loading component**

```typescript
// src/app/shared/components/loading-spinner/loading-spinner.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container" *ngIf="loading">
      <div class="spinner"></div>
      <p *ngIf="message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xl);
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    p {
      margin-top: var(--spacing-md);
      color: var(--text-secondary);
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() loading = false;
  @Input() message = '';
}
```

- [ ] **Step 2: Create error alert component**

```typescript
// src/app/shared/components/error-alert/error-alert.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-alert" *ngIf="error">
      <span>{{ error }}</span>
      <button (click)="dismiss.emit()">×</button>
    </div>
  `,
  styles: [`
    .error-alert {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      background: #fee2e2;
      color: #991b1b;
      border-radius: var(--border-radius);
      margin-bottom: var(--spacing-md);
    }
    button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #991b1b;
    }
  `]
})
export class ErrorAlertComponent {
  @Input() error = '';
  @Output() dismiss = new EventEmitter<void>();
}
```

- [ ] **Step 3: Add toast notification service**

```typescript
// src/app/core/services/toast.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  message = signal('');
  type = signal<'success' | 'error' | 'info'>('info');
  show = signal(false);

  success(msg: string) {
    this.message.set(msg);
    this.type.set('success');
    this.show.set(true);
    setTimeout(() => this.show.set(false), 3000);
  }

  error(msg: string) {
    this.message.set(msg);
    this.type.set('error');
    this.show.set(true);
    setTimeout(() => this.show.set(false), 5000);
  }

  info(msg: string) {
    this.message.set(msg);
    this.type.set('info');
    this.show.set(true);
    setTimeout(() => this.show.set(false), 3000);
  }
}
```

---

## Task 6.3: Add Loading Spinners and Skeleton Screens

**Steps:**

- [ ] **Step 1: Create skeleton loader component**

```typescript
// src/app/shared/components/skeleton-loader/skeleton-loader.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton" [style.width]="width" [style.height]="height"></div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--border-radius);
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() width = '100%';
  @Input() height = '20px';
}
```

- [ ] **Step 2: Add skeleton to list views**

```html
<!-- Example: employees list with skeleton -->
<ng-container *ngIf="loading; else loaded">
  <app-skeleton-loader height="80px"></app-skeleton-loader>
  <app-skeleton-loader height="80px"></app-skeleton-loader>
  <app-skeleton-loader height="80px"></app-skeleton-loader>
</ng-container>
<ng-template #loaded>
  <!-- Normal content -->
</ng-template>
```

---

## Task 6.4: Implement Form Validation

**Steps:**

- [ ] **Step 1: Add custom validators**

```typescript
// src/app/core/validators/phone.validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    
    // Allow formats: 12345678, +1 234 567 8901, (123) 456-7890
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    
    if (!phoneRegex.test(value)) {
      return { invalidPhone: true };
    }
    return null;
  };
}
```

- [ ] **Step 2: Add inline validation messages**

```typescript
// In form components, update template:
<div class="form-group">
  <label>Teléfono</label>
  <input formControlName="phone" [class.invalid]="form.get('phone')?.invalid && form.get('phone')?.touched">
  <div class="error-message" *ngIf="form.get('phone')?.invalid && form.get('phone')?.touched">
    <small *ngIf="form.get('phone')?.errors?.['required']">El teléfono es requerido</small>
    <small *ngIf="form.get('phone')?.errors?.['invalidPhone']">Formato de teléfono inválido</small>
  </div>
</div>
```

---

## Task 6.5: Add Unit Tests

**Steps:**

- [ ] **Step 1: Install testing dependencies**

Run: `npm install --save-dev @types/jasmine jasmine-core karma karma-chrome-launcher`

- [ ] **Step 2: Create test for AuthService**

```typescript
// src/app/core/services/auth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { SupabaseClient } from '@supabase/supabase-js';

describe('AuthService', () => {
  let service: AuthService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        getUser: jest.fn(),
        onAuthStateChange: jest.fn()
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
      })
    };

    TestBed.configure({
      providers: [
        AuthService,
        { provide: SupabaseClient, useValue: mockSupabase }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should sign in with email and password', async () => {
    const mockUser = { id: '123', email: 'test@test.com' };
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { role: 'manager' } })
        })
      })
    });

    const result = await service.signIn('test@test.com', 'password');
    expect(result).toBeDefined();
  });
});
```

- [ ] **Step 3: Create test for AppointmentService**

```typescript
// src/app/core/services/appointment.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { AppointmentService } from './appointment.service';

describe('AppointmentService', () => {
  let service: AppointmentService;

  beforeEach(() => {
    TestBed.configure({
      providers: [AppointmentService]
    });

    service = TestBed.inject(AppointmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate available slots correctly', () => {
    // Test slot generation logic
    const slots = service['generateAvailableSlots'](
      '09:00', 
      '17:00', 
      [], 
      30
    );
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0]).toBe('09:00');
  });
});
```

---

## Task 6.6: E2E Tests

**Steps:**

- [ ] **Step 1: Install Cypress**

Run: `npm install --save-dev cypress @cypress/schematic`

- [ ] **Step 2: Create e2e test for booking flow**

```typescript
// cypress/e2e/booking.cy.ts
describe('Public Booking Flow', () => {
  beforeEach(() => {
    cy.visit('/c/test-company');
  });

  it('should view company and employees', () => {
    cy.get('h1').should('contain', 'Test Company');
    cy.get('.employee-card').should('have.length.greaterThan', 0);
  });

  it('should select employee and view calendar', () => {
    cy.get('.employee-card').first().click();
    cy.url().should('include', '/e/');
    cy.get('.service-list').should('be.visible');
  });

  it('should complete booking flow', () => {
    cy.get('.employee-card').first().click();
    cy.get('.service-item').first().click();
    cy.get('.slot-btn').first().click();
    cy.get('.btn-primary').contains('Continuar').click();
    
    cy.get('input[formControlName="client_name"]').type('Test Client');
    cy.get('input[formControlName="client_phone"]').type('12345678');
    cy.get('button[type="submit"]').click();
    
    cy.get('.success-message').should('be.visible');
  });
});
```

- [ ] **Step 3: Run e2e tests**

Run: `npx cypress run`

---

## Task 6.7-6.10: Production Deployment

**Steps:**

- [ ] **Step 1: Create production Supabase project**

1. Go to supabase.com
2. Create new project
3. Note project URL and anon key

- [ ] **Step 2: Update environment for production**

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your-anon-key'
};
```

- [ ] **Step 3: Build for production**

Run: `ng build --configuration=production`

- [ ] **Step 4: Deploy to Vercel**

Run: `npm install -g vercel`
Run: `vercel`

Follow prompts:
- Set up and deploy? Yes
- Which directory? ./dist/citasya-app
- Want to modify settings? No

- [ ] **Step 5: Configure environment variables in Vercel**

In Vercel dashboard:
1. Settings → Environment Variables
2. Add:
   - `SUPABASE_URL` = your-supabase-url
   - `SUPABASE_ANON_KEY` = your-anon-key

- [ ] **Step 6: Final smoke test**

Navigate to production URL and verify:
- [ ] Login page loads
- [ ] Can sign in as test user
- [ ] Dashboard displays correctly
- [ ] Public booking page accessible

---

## Phase 6 Summary

| Task | Description | Status |
|------|-------------|--------|
| 6.1 | Mobile responsive testing and fixes | ✅ |
| 6.2 | Error handling and loading states | ✅ |
| 6.3 | Add loading spinners and skeleton screens | ✅ |
| 6.4 | Implement form validation | ✅ |
| 6.5 | Add unit tests for critical services | ✅ |
| 6.6 | E2E tests for key flows | ✅ |
| 6.7 | Set up production Supabase project | ✅ |
| 6.8 | Configure environment for production | ✅ |
| 6.9 | Deploy Angular app (Vercel) | ✅ |
| 6.10 | Final smoke test | ✅ |

**Total: ~4 hours**

---

## Project Complete!

**Total Project Time: ~18.5 hours**

### Files Created

```
docs/
├── phases/
│   ├── phase-1-foundation.md
│   ├── phase-2-public-booking.md
│   ├── phase-3-manager-backoffice.md
│   ├── phase-4-employee-selfservice.md
│   ├── phase-5-superadmin-panel.md
│   └── phase-6-polish-production.md
└── superpowers/
    └── plans/
        └── 2026-03-10-citasya-saaS.md
```
