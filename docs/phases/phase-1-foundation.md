# Phase 1: Foundation

## Goal
Set up project infrastructure, database, and authentication

## Estimated Time
~2.5 hours

## Prerequisites
- Node.js 24+ installed
- Supabase account created

---

## Project Location

**Important:** The Angular project code is located in the `app-web/` folder.

All file paths in this document are relative to: `app-web/`

For example:
- `src/app/...` means `app-web/src/app/...`
- `angular.json` means `app-web/angular.json`

---

## Task 1.1: Initialize Angular 20+ Project

**Files:**
- Create: `src/app/core/models/*.ts`
- Create: `src/app/core/services/*.ts`
- Create: `src/app/core/guards/*.ts`
- Create: `src/app/app.config.ts`
- Create: `src/app/app.routes.ts`
- Create: `src/app/app.component.ts`
- Create: `src/environments/environment.ts`
- Create: `src/environments/environment.prod.ts`

**Steps:**

- [ ] **Step 1: Install Angular CLI globally**

Run: `npm install -g @angular/cli@latest`
Expected: Angular CLI installed

- [ ] **Step 2: Create new Angular project**

Run (from project root): `ng new citasya-app --standalone --routing --style=scss --skip-tests --skip-git`
Expected: Project scaffold created in `app-web/` folder

- [ ] **Step 3: Navigate to project**

Run (from project root): `cd app-web`
Expected: In project directory

---

## Task 1.2: Install Dependencies

**Steps:**

- [ ] **Step 1: Install Supabase client**

Run: `npm install @supabase/supabase-js`
Expected: Package installed

- [ ] **Step 2: Install FullCalendar**

Run: `npm install @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/angular`
Expected: FullCalendar installed

- [ ] **Step 3: Install jsPDF**

Run: `npm install jspdf`
Expected: jsPDF installed

- [ ] **Step 4: Install UUID for TypeScript**

Run: `npm install uuid && npm install -D @types/uuid`
Expected: UUID installed

- [ ] **Step 5: Install TailwindCSS**

Run: `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init`
Expected: TailwindCSS installed

- [ ] **Step 6: Configure TailwindCSS v3**

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: ['selector', '[class~="my-app-dark"]'],
  theme: {
    extend: {
      colors: {
        primary: '#9DC183',
        'primary-dark': '#7BA366',
        'primary-light': '#B8D4A3',
        'text-primary': '#2C3E50',
        'text-secondary': '#5D6D7E',
        'text-muted': '#95A5A6',
        'surface': '#F8F9FA',
        'border': '#E5E8EB',
      }
    },
  },
  plugins: [],
}
```

Add to `src/styles.scss`:
```scss
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #9DC183;
  --color-primary-dark: #7BA366;
  --color-primary-light: #B8D4A3;
  --color-text-primary: #2C3E50;
  --color-text-secondary: #5D6D7E;
  --color-text-muted: #95A5A6;
  --color-background: #FFFFFF;
  --color-surface: #F8F9FA;
  --color-border: #E5E8EB;
  --color-success: #9DC183;
  --color-warning: #F4D03F;
  --color-error: #E74C3C;
  --color-info: #3498DB;
}

body {
  @apply bg-white text-text-primary;
}
```

- [ ] **Step 7: Install PrimeNG**

Run: `npm install primeng @primeng/themes`
Expected: PrimeNG installed

- [ ] **Step 8: Install TailwindCSS PrimeUI Plugin**

Run: `npm install tailwindcss-primeui`
Expected: Plugin installed

- [ ] **Step 9: Update TailwindCSS config for PrimeUI**

Update `tailwind.config.js`:
```javascript
import PrimeUI from 'tailwindcss-primeui';

export default {
  // ... existing config
  plugins: [PrimeUI],
  darkMode: ['selector', '[class~="my-app-dark"]'],
}
```

- [ ] **Step 10: Configure PrimeNG in app.config.ts**

```typescript
// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: '.my-app-dark',
                    cssLayer: {
                        name: 'primeng',
                        order: 'theme, base, primeng'
                    }
                }
            },
            palette: {
                primary: {
                    50: '#F0F7EB',
                    100: '#D9EACD',
                    200: '#B8D4A3',
                    300: '#97BE79',
                    400: '#7BA366',
                    500: '#9DC183',  // Verde Salvia
                    600: '#5D8A4E',
                    700: '#4A6F3C',
                    800: '#39542B',
                    900: '#28391A',
                    950: '#141F0D'
                }
            }
        })
    ]
};
```

- [ ] **Step 11: Add PrimeNG styles to styles.scss**

```scss
// src/styles.scss
@import "primeng/resources/themes/aura/theme.css";
@import "primeng/resources/primeng.min.css";
@import "primeicons/primeicons.css";

// TailwindCSS
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 12: Verify PrimeNG components work**

Run: `ng build`
Expected: Build succeeds with PrimeNG
      }
    },
  },
  plugins: [],
}
```

Add to `src/styles.scss`:
```scss
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #9DC183;
  --color-primary-dark: #7BA366;
  --color-primary-light: #B8D4A3;
  --color-text-primary: #2C3E50;
  --color-text-secondary: #5D6D7E;
  --color-text-muted: #95A5A6;
  --color-background: #FFFFFF;
  --color-surface: #F8F9FA;
  --color-border: #E5E8EB;
  --color-success: #9DC183;
  --color-warning: #F4D03F;
  --color-error: #E74C3C;
  --color-info: #3498DB;
}

body {
  @apply bg-white text-text-primary;
}
```

---

## Task 1.2b: Configure PWA

**Steps:**

- [ ] **Step 1: Add Angular PWA**

Run: `ng add @angular/pwa`
Expected: PWA files created

- [ ] **Step 2: Configure manifest.json**

Modify `src/manifest.webmanifest`:
```json
{
  "name": "CitasYa - Gestión de Citas",
  "short_name": "CitasYa",
  "description": "Gestiona tus citas profesionales desde un solo lugar",
  "theme_color": "#9DC183",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 3: Create app icons**

Create in `src/assets/icons/`:
- `icon-192x192.png`
- `icon-512x512.png`
- `apple-touch-icon.png` (180x180)

Use the Green Sage (#9DC183) color for icons

- [ ] **Step 5: Create contact table in Supabase**

Run in Supabase SQL Editor:
```sql
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Allow public insert for contact form
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_insert" ON contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_select" ON contact_messages
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'superadmin')
  );
```

---

## Task 1.4: Create Landing Page

**Files:**
- Create: `src/app/features/landing/home/home.component.ts`
- Create: `src/app/features/landing/home/home.component.html`
- Create: `src/app/features/landing/home/home.component.scss`
- Create: `src/app/features/landing/pricing/pricing.component.ts`
- Create: `src/app/features/landing/contact/contact.component.ts`
- Create: `src/app/features/landing/about/about.component.ts`
- Create: `src/app/core/services/contact.service.ts`

**Steps:**

- [ ] **Step 1: Create ContactService**

```typescript
// src/app/core/services/contact.service.ts
import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private supabase = inject(SupabaseClient);

  async sendMessage(message: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('contact_messages')
      .insert(message);
    
    if (error) throw error;
  }
}
```

- [ ] **Step 2: Create Hero Component**

```typescript
// src/app/features/landing/home/home.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="hero">
      <div class="hero-content">
        <h1>Gestiona tus citas profesionales desde un solo lugar</h1>
        <p>La solución perfecta para salones de belleza, clínicas dentales y profesionales independientes</p>
        <div class="cta-group">
          <a routerLink="/signup" class="btn btn-primary">Comenzar prueba gratuita</a>
          <a routerLink="/features" class="btn btn-outline">Ver características</a>
        </div>
      </div>
      <div class="hero-image">
        <div class="phone-mockup">
          <img src="/assets/images/app-mockup.png" alt="App Preview">
        </div>
      </div>
    </section>
    
    <section class="features-preview">
      <h2>¿Por qué elegir CitasYa?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <span class="icon">📅</span>
          <h3>Citas sin registro</h3>
          <p>Tus clientes agendan sin necesidad de crear cuenta</p>
        </div>
        <div class="feature-card">
          <span class="icon">📊</span>
          <h3>Cierre diario</h3>
          <p>Genera reportes PDF con un clic</p>
        </div>
        <div class="feature-card">
          <span class="icon">👥</span>
          <h3>Gestión de equipo</h3>
          <p>Administra empleados y sus servicios</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      display: flex;
      flex-direction: column;
      padding: 4rem 2rem;
      background: linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%);
    }
    .hero-content {
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }
    h1 {
      font-size: 2.5rem;
      color: #2C3E50;
      margin-bottom: 1rem;
    }
    .hero-content p {
      font-size: 1.25rem;
      color: #5D6D7E;
      margin-bottom: 2rem;
    }
    .cta-group {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    .btn-primary {
      background: #9DC183;
      color: white;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
    }
    .btn-outline {
      border: 2px solid #9DC183;
      color: #9DC183;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
    }
    .features-preview {
      padding: 4rem 2rem;
      background: white;
    }
    .features-preview h2 {
      text-align: center;
      margin-bottom: 3rem;
      color: #2C3E50;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }
    .feature-card {
      text-align: center;
      padding: 2rem;
      border-radius: 12px;
      background: #F8F9FA;
    }
    .feature-card .icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
    }
  `]
})
export class HomeComponent {}
```

- [ ] **Step 3: Create Pricing Component**

```typescript
// src/app/features/landing/pricing/pricing.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="pricing">
      <h1>Planes simples y transparentes</h1>
      <p>Elige el plan que mejor se adapte a tu negocio</p>
      
      <div class="pricing-grid">
        <div class="pricing-card">
          <h2>Básico</h2>
          <div class="price">$25<span>/mes</span></div>
          <ul class="features">
            <li>✓ 10 usuarios (1 manager + 9 empleados)</li>
            <li>✓ 1 empresa</li>
            <li>✓ Citas públicas</li>
            <li>✓ Cierre diario con PDF</li>
            <li>✓ Soporte por email</li>
          </ul>
          <a routerLink="/contact" class="btn btn-primary">Comenzar</a>
        </div>
        
        <div class="pricing-card featured">
          <div class="badge">Más popular</div>
          <h2>Medio</h2>
          <div class="price">$60<span>/mes</span></div>
          <ul class="features">
            <li>✓ 20 usuarios (1 manager + 19 empleados)</li>
            <li>✓ 2 empresas</li>
            <li>✓ Citas públicas</li>
            <li>✓ Cierre diario con PDF</li>
            <li>✓ Soporte prioritario</li>
          </ul>
          <a routerLink="/contact" class="btn btn-primary">Comenzar</a>
        </div>
        
        <div class="pricing-card">
          <h2>Custom</h2>
          <div class="price">Negociado</div>
          <ul class="features">
            <li>✓ Usuarios ilimitados</li>
            <li>✓ Empresas ilimitadas</li>
            <li>✓ Todas las funcionalidades</li>
            <li>✓ Soporte dedicado</li>
            <li>✓ Personalización</li>
          </ul>
          <a routerLink="/contact" class="btn btn-outline">Contactar</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .pricing {
      padding: 4rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .pricing h1 {
      text-align: center;
      color: #2C3E50;
      margin-bottom: 0.5rem;
    }
    .pricing > p {
      text-align: center;
      color: #5D6D7E;
      margin-bottom: 3rem;
    }
    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }
    .pricing-card {
      background: white;
      border: 1px solid #E5E8EB;
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      position: relative;
    }
    .pricing-card.featured {
      border-color: #9DC183;
      box-shadow: 0 8px 30px rgba(157, 193, 131, 0.2);
    }
    .badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: #9DC183;
      color: white;
      padding: 0.25rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
    }
    .price {
      font-size: 3rem;
      font-weight: 700;
      color: #2C3E50;
      margin: 1rem 0;
    }
    .price span {
      font-size: 1rem;
      color: #5D6D7E;
    }
    .features {
      list-style: none;
      padding: 0;
      margin: 2rem 0;
      text-align: left;
    }
    .features li {
      padding: 0.5rem 0;
      color: #5D6D7E;
    }
    .btn-primary {
      display: block;
      background: #9DC183;
      color: white;
      padding: 1rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
    }
  `]
})
export class PricingComponent {}
```

- [ ] **Step 4: Create Contact Component**

```typescript
// src/app/features/landing/contact/contact.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService } from '../../../core/services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="contact">
      <h1>Contáctanos</h1>
      <p>¿Tienes preguntas? Estamos aquí para ayudarte</p>
      
      <div class="contact-content">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Nombre completo</label>
            <input formControlName="name" type="text" placeholder="Tu nombre">
          </div>
          
          <div class="form-group">
            <label>Email</label>
            <input formControlName="email" type="email" placeholder="tu@email.com">
          </div>
          
          <div class="form-group">
            <label>Teléfono (opcional)</label>
            <input formControlName="phone" type="tel" placeholder="12345678">
          </div>
          
          <div class="form-group">
            <label>Mensaje</label>
            <textarea formControlName="message" rows="5" placeholder="¿En qué podemos ayudarte?"></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading">
            {{ loading ? 'Enviando...' : 'Enviar mensaje' }}
          </button>
          
          <div class="success" *ngIf="success">¡Mensaje enviado! Te contactaremos pronto.</div>
        </form>
      </div>
    </section>
  `,
  styles: [`
    .contact {
      padding: 4rem 2rem;
      max-width: 600px;
      margin: 0 auto;
    }
    h1 {
      text-align: center;
      color: #2C3E50;
      margin-bottom: 0.5rem;
    }
    .contact > p {
      text-align: center;
      color: #5D6D7E;
      margin-bottom: 3rem;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #2C3E50;
      font-weight: 500;
    }
    input, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #E5E8EB;
      border-radius: 8px;
      font-size: 1rem;
    }
    .btn-primary {
      width: 100%;
      background: #9DC183;
      color: white;
      padding: 1rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary:disabled {
      opacity: 0.6;
    }
    .success {
      margin-top: 1rem;
      padding: 1rem;
      background: #D4EDDA;
      color: #155724;
      border-radius: 8px;
      text-align: center;
    }
  `]
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);
  
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    message: ['', Validators.required]
  });
  
  loading = false;
  success = false;
  
  async onSubmit() {
    if (this.form.invalid) return;
    
    this.loading = true;
    try {
      await this.contactService.sendMessage(this.form.value as any);
      this.success = true;
      this.form.reset();
    } catch (err) {
      console.error(err);
    }
    this.loading = false;
  }
}
```

- [ ] **Step 5: Create About Component**

```typescript
// src/app/features/landing/about/about.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="about">
      <h1>Sobre CitasYa</h1>
      <p class="subtitle">Nuestra misión es simplificar la gestión de citas para profesionales independientes</p>
      
      <div class="story">
        <h2>Nuestra Historia</h2>
        <p>CitasYa nació de la frustración de ver cómo pequeños negocios perdían clientes por procesos de agendamiento complicados. Creemos que la tecnología debe ser accesible y simple para todos.</p>
      </div>
      
      <div class="team">
        <h2>Equipo Fundador</h2>
        <div class="team-grid">
          <div class="founder-card">
            <div class="photo">👤</div>
            <h3>Nombre del Fundador</h3>
            <p class="role">CEO & Fundador</p>
            <p class="bio">Emprendedor con 10+ años en tecnología. Apasionado por simplificar procesos.</p>
          </div>
          <div class="founder-card">
            <div class="photo">👤</div>
            <h3>Nombre del Co-fundador</h3>
            <p class="role">CTO</p>
            <p class="bio">Ingeniero de software especializado en productos SaaS y UX.</p>
          </div>
        </div>
      </div>
      
      <div class="mission">
        <h2>Misión</h2>
        <p>Democratizar el acceso a herramientas de gestión profesional para pequeños negocios de servicios.</p>
        
        <h2>Visión</h2>
        <p>Ser la plataforma de citas líder en Latinoamérica para profesionales independientes.</p>
      </div>
    </section>
  `,
  styles: [`
    .about {
      padding: 4rem 2rem;
      max-width: 900px;
      margin: 0 auto;
    }
    h1 {
      text-align: center;
      color: #2C3E50;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      text-align: center;
      color: #5D6D7E;
      font-size: 1.25rem;
      margin-bottom: 4rem;
    }
    .story, .mission {
      margin-bottom: 4rem;
    }
    .story h2, .team h2, .mission h2 {
      color: #2C3E50;
      margin-bottom: 1rem;
    }
    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    .founder-card {
      text-align: center;
      padding: 2rem;
      background: #F8F9FA;
      border-radius: 16px;
    }
    .photo {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    .founder-card h3 {
      color: #2C3E50;
      margin-bottom: 0.25rem;
    }
    .role {
      color: #9DC183;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    .bio {
      color: #5D6D7E;
      font-size: 0.9rem;
    }
  `]
})
export class AboutComponent {}
```

- [ ] **Step 6: Update routing for landing pages**

```typescript
// app.routes.ts - Add these routes
{
  path: '',
  loadComponent: () => import('./features/landing/home/home.component').then(m => m.HomeComponent)
},
{
  path: 'pricing',
  loadComponent: () => import('./features/landing/pricing/pricing.component').then(m => m.PricingComponent)
},
{
  path: 'contact',
  loadComponent: () => import('./features/landing/contact/contact.component').then(m => m.ContactComponent)
},
{
  path: 'about',
  loadComponent: () => import('./features/landing/about/about.component').then(m => m.AboutComponent)
}

- [ ] **Step 4: Configure ngsw-config.json**

Modify `ngsw-config.json`:
```json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/*.css",
          "/*.js"
        ]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/**",
          "/*.(svg|cur|jpg|jpeg|png|apng|webp|avif|gif|otf|ttf|woff|woff2)"
        ]
      }
    }
  ]
}
```

---

## Task 1.3: Configure Supabase Client

**Files:**
- Modify: `src/environments/environment.ts`
- Create: `src/app/core/supabase.ts`

**Steps:**

- [ ] **Step 1: Create environment file**

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

- [ ] **Step 2: Create Supabase client singleton**

```typescript
// src/app/core/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export const supabase = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey
);
```

---

## Task 1.4: Create Database Tables

**Steps:**

- [ ] **Step 1: Run SQL in Supabase SQL Editor**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE user_role AS ENUM ('superadmin', 'manager', 'employee');
CREATE TYPE appointment_status AS ENUM ('pending', 'completed', 'cancelled', 'no_show');

-- Plans table
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    max_users INTEGER NOT NULL,
    max_companies INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    address TEXT,
    phone TEXT,
    logo_url TEXT,
    plan_id UUID REFERENCES plans(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    photo_url TEXT,
    role user_role NOT NULL DEFAULT 'employee',
    company_id UUID REFERENCES companies(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    price DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee-Services junction table
CREATE TABLE employee_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, service_id)
);

-- Company schedules table
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(company_id, day_of_week)
);

-- Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES users(id),
    service_id UUID NOT NULL REFERENCES services(id),
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status appointment_status DEFAULT 'pending',
    amount_collected DECIMAL(10, 2),
    notes TEXT,
    cancellation_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily closes table
CREATE TABLE daily_closes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    close_date DATE NOT NULL,
    total_appointments INTEGER NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    generated_by UUID NOT NULL REFERENCES users(id),
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, close_date)
);
```

- [ ] **Step 2: Create indexes**

```sql
CREATE INDEX idx_appointments_company ON appointments(company_id);
CREATE INDEX idx_appointments_employee ON appointments(employee_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_services_company ON services(company_id);
CREATE INDEX idx_employee_services_employee ON employee_services(employee_id);
CREATE INDEX idx_employee_services_service ON employee_services(service_id);
```

---

## Task 1.5: Set Up RLS Policies

**Steps:**

- [ ] **Step 1: Enable RLS on all tables**

```sql
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_closes ENABLE ROW LEVEL SECURITY;
```

- [ ] **Step 2: Create RLS policies**

```sql
-- Plans: Everyone can read
CREATE POLICY "plans_select" ON plans FOR SELECT USING (true);

-- Companies: Superadmin sees all, Manager sees theirs
CREATE POLICY "companies_select" ON companies FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'superadmin')
    OR id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "companies_insert" ON companies FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role = 'superadmin')
);

CREATE POLICY "companies_update" ON companies FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'superadmin')
);

-- Users: Superadmin sees all, Manager sees company users
CREATE POLICY "users_select" ON users FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'superadmin')
    OR company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    OR id = auth.uid()
);

CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role = 'superadmin')
    OR (auth.uid() IN (SELECT id FROM users WHERE role = 'manager') AND role = 'employee')
);

CREATE POLICY "users_update" ON users FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'superadmin')
    OR id = auth.uid()
);

-- Services: Company-based access
CREATE POLICY "services_select" ON services FOR SELECT USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "services_insert" ON services FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "services_update" ON services FOR UPDATE USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "services_delete" ON services FOR DELETE USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

-- Employee Services
CREATE POLICY "employee_services_select" ON employee_services FOR SELECT USING (
    employee_id = auth.uid()
    OR employee_id IN (SELECT id FROM users WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid()))
);

CREATE POLICY "employee_services_insert" ON employee_services FOR INSERT WITH CHECK (
    employee_id IN (SELECT id FROM users WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid()))
);

CREATE POLICY "employee_services_delete" ON employee_services FOR DELETE USING (
    employee_id IN (SELECT id FROM users WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid()))
);

-- Schedules
CREATE POLICY "schedules_select" ON schedules FOR SELECT USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "schedules_insert" ON schedules FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "schedules_update" ON schedules FOR UPDATE USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

-- Appointments
CREATE POLICY "appointments_select" ON appointments FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    OR employee_id = auth.uid()
);

CREATE POLICY "appointments_insert" ON appointments FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    OR company_id IN (SELECT id FROM companies)
);

CREATE POLICY "appointments_update" ON appointments FOR UPDATE USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    OR employee_id = auth.uid()
);

CREATE POLICY "appointments_delete" ON appointments FOR DELETE USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
);

-- Daily Closes: Manager only
CREATE POLICY "daily_closes_select" ON daily_closes FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('manager', 'superadmin')
);

CREATE POLICY "daily_closes_insert" ON daily_closes FOR INSERT WITH CHECK (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) = 'manager'
);
```

---

## Task 1.6: Create Core Models

**Files:**
- Create: `src/app/core/models/user.model.ts`
- Create: `src/app/core/models/company.model.ts`
- Create: `src/app/core/models/service.model.ts`
- Create: `src/app/core/models/appointment.model.ts`
- Create: `src/app/core/models/plan.model.ts`

**Steps:**

- [ ] **Step 1: Create User model**

```typescript
// src/app/core/models/user.model.ts
export type UserRole = 'superadmin' | 'manager' | 'employee';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  photo_url?: string;
  role: UserRole;
  company_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDto {
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  company_id?: string;
}
```

- [ ] **Step 2: Create Company model**

```typescript
// src/app/core/models/company.model.ts
export interface Company {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  logo_url?: string;
  plan_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyDto {
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  logo_url?: string;
  plan_id?: string;
}
```

- [ ] **Step 3: Create Service model**

```typescript
// src/app/core/models/service.model.ts
export interface Service {
  id: string;
  company_id: string;
  name: string;
  duration_minutes: number;
  price?: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateServiceDto {
  company_id: string;
  name: string;
  duration_minutes: number;
  price?: number;
}
```

- [ ] **Step 4: Create Appointment model**

```typescript
// src/app/core/models/appointment.model.ts
export type AppointmentStatus = 'pending' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  company_id: string;
  employee_id: string;
  service_id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  amount_collected?: number;
  notes?: string;
  cancellation_token?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentDto {
  company_id: string;
  employee_id: string;
  service_id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  appointment_date: string;
  appointment_time: string;
}
```

- [ ] **Step 5: Create Plan model**

```typescript
// src/app/core/models/plan.model.ts
export interface Plan {
  id: string;
  name: string;
  price: number;
  max_users: number;
  max_companies: number;
  created_at: string;
}
```

---

## Task 1.7: Implement AuthService

**Files:**
- Create: `src/app/core/services/auth.service.ts`

**Steps:**

- [ ] **Step 1: Write the AuthService**

```typescript
// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Observable, from, map } from 'rxjs';
import { User, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseClient);
  
  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return this.getUserData(data.user.id);
  }
  
  async signUp(email: string, password: string, userData: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    if (error) throw error;
    return this.getUserData(data.user!.id);
  }
  
  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }
  
  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser();
    if (!data.user) return null;
    return this.getUserData(data.user.id);
  }
  
  private async getUserData(userId: string): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  getUserRole(): Observable<UserRole | null> {
    return from(this.supabase.auth.getUser()).pipe(
      map(response => response.data.user),
      switchMap(user => {
        if (!user) return of(null);
        return from(
          this.supabase.from('users').select('role, company_id').eq('id', user.id).single()
        ).pipe(
          map(response => response.data?.role || null)
        );
      })
    );
  }
  
  onAuthStateChange(): Observable<any> {
    return new Observable(observer => {
      this.supabase.auth.onAuthStateChange((event, session) => {
        observer.next({ event, session });
      });
    });
  }
}
```

- [ ] **Step 2: Run build to verify**

Run: `ng build`
Expected: Build succeeds

---

## Task 1.8: Create Auth Guards

**Files:**
- Create: `src/app/core/guards/auth.guard.ts`
- Create: `src/app/core/guards/manager.guard.ts`
- Create: `src/app/core/guards/employee.guard.ts`
- Create: `src/app/core/guards/superadmin.guard.ts`

**Steps:**

- [ ] **Step 1: Create auth.guard.ts**

```typescript
// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const user = await authService.getCurrentUser();
  if (!user) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
```

- [ ] **Step 2: Create manager.guard.ts**

```typescript
// src/app/core/guards/manager.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const managerGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const user = await authService.getCurrentUser();
  if (!user || user.role !== 'manager') {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
```

- [ ] **Step 3: Create employee.guard.ts**

```typescript
// src/app/core/guards/employee.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const employeeGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const user = await authService.getCurrentUser();
  if (!user || user.role !== 'employee') {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
```

- [ ] **Step 4: Create superadmin.guard.ts**

```typescript
// src/app/core/guards/superadmin.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const superadminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const user = await authService.getCurrentUser();
  if (!user || user.role !== 'superadmin') {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
```

---

## Task 1.9: Set Up Global Styles

**Files:**
- Modify: `src/styles.scss`

**Steps:**

- [ ] **Step 1: Add mobile-first styles**

```scss
// src/styles.scss
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --success-color: #22c55e;
  --danger-color: #ef4444;
  --background-color: #f8fafc;
  --surface-color: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --border-radius: 8px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: var(--background-color);
  color: var(--text-primary);
  line-height: 1.5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md);
}

.card {
  background: var(--surface-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  border: none;
  font-weight: 500;
  cursor: pointer;
  min-height: 44px;
  transition: background-color 0.2s;
  
  &-primary {
    background: var(--primary-color);
    color: white;
    &:hover { background: #1d4ed8; }
  }
  
  &-secondary {
    background: var(--secondary-color);
    color: white;
  }
  
  &-danger {
    background: var(--danger-color);
    color: white;
  }
}

.form-group {
  margin-bottom: var(--spacing-md);
  
  label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-weight: 500;
  }
  
  input, select, textarea {
    width: 100%;
    padding: var(--spacing-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    min-height: 44px;
    font-size: 16px;
  }
}

/* Mobile-first responsive */
@media (min-width: 768px) {
  .container {
    padding: var(--spacing-lg);
  }
}
```

---

## Task 1.10: Create Login Component

**Files:**
- Create: `src/app/features/auth/login/login.component.ts`
- Create: `src/app/features/auth/login/login.component.html`
- Create: `src/app/features/auth/login/login.component.scss`

**Steps:**

- [ ] **Step 1: Create login component**

```typescript
// src/app/features/auth/login/login.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  
  loading = false;
  error = '';
  
  async onSubmit() {
    if (this.loginForm.invalid) return;
    
    this.loading = true;
    this.error = '';
    
    try {
      const user = await this.authService.signIn(
        this.loginForm.value.email!,
        this.loginForm.value.password!
      );
      
      // Redirect based on role
      if (user.role === 'superadmin') {
        this.router.navigate(['/sa']);
      } else if (user.role === 'manager') {
        this.router.navigate(['/bo']);
      } else {
        this.router.navigate(['/emp']);
      }
    } catch (err: any) {
      this.error = err.message || 'Login failed';
    } finally {
      this.loading = false;
    }
  }
}
```

- [ ] **Step 2: Create login template**

```html
<!-- src/app/features/auth/login/login.component.html -->
<div class="login-container">
  <div class="login-card">
    <h1>CitasYa</h1>
    <p>Iniciar Sesión</p>
    
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email" 
          type="email" 
          formControlName="email"
          placeholder="tu@email.com"
        >
      </div>
      
      <div class="form-group">
        <label for="password">Contraseña</label>
        <input 
          id="password" 
          type="password" 
          formControlName="password"
          placeholder="••••••••"
        >
      </div>
      
      <div class="error" *ngIf="error">{{ error }}</div>
      
      <button type="submit" class="btn btn-primary" [disabled]="loading">
        {{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}
      </button>
    </form>
  </div>
</div>
```

- [ ] **Step 3: Create login styles**

```scss
// src/app/features/auth/login/login.component.scss
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.login-card {
  background: var(--surface-color);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  
  h1 {
    text-align: center;
    color: var(--primary-color);
    margin-bottom: var(--spacing-xs);
  }
  
  p {
    text-align: center;
    color: var(--text-secondary);
    margin-bottom: var(--spacing-lg);
  }
  
  form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .btn {
    width: 100%;
  }
  
  .error {
    color: var(--danger-color);
    text-align: center;
    font-size: 14px;
  }
}
```

---

## Task 1.11: Configure Routing

**Files:**
- Modify: `src/app/app.routes.ts`

**Steps:**

- [ ] **Step 1: Set up routes**

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { managerGuard } from './core/guards/manager.guard';
import { employeeGuard } from './core/guards/employee.guard';
import { superadminGuard } from './core/guards/superadmin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'bo',
    canActivate: [authGuard, managerGuard],
    loadChildren: () => import('./features/backoffice/manager/manager.routes').then(m => m.MANAGER_ROUTES)
  },
  {
    path: 'emp',
    canActivate: [authGuard, employeeGuard],
    loadChildren: () => import('./features/backoffice/employee/employee.routes').then(m => m.EMPLOYEE_ROUTES)
  },
  {
    path: 'sa',
    canActivate: [authGuard, superadminGuard],
    loadChildren: () => import('./features/superadmin/superadmin.routes').then(m => m.SUPERADMIN_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
```

- [ ] **Step 2: Update app.component.html**

```html
<!-- src/app/app.component.html -->
<router-outlet></router-outlet>
```

---

## Task 1.12: Test Authentication Flow

**Steps:**

- [ ] **Step 1: Create seed data in Supabase**

```sql
-- Insert default plans
INSERT INTO plans (name, price, max_users, max_companies) VALUES
('Basic', 25.00, 10, 1),
('Medium', 60.00, 20, 2),
('Custom', 0, 100, 10);

-- Insert a superadmin user (replace with your Supabase auth user id)
INSERT INTO users (id, email, full_name, role, is_active)
VALUES (
  'your-supabase-auth-user-id',
  'admin@citasya.com',
  'Super Admin',
  'superadmin',
  true
);
```

- [ ] **Step 2: Run development server**

Run: `ng serve`
Expected: Server running on http://localhost:4200

- [ ] **Step 3: Test login**

Navigate to http://localhost:4200/login
Expected: Login form displayed

---

## Phase 1 Summary

| Task | Description | Status |
|------|-------------|--------|
| 1.1 | Initialize Angular 20+ project | ✅ |
| 1.2 | Install dependencies (Supabase, FullCalendar, jsPDF, TailwindCSS, PrimeNG) | ✅ |
| 1.2b | Configure PWA (manifest, icons, service worker) | ✅ |
| 1.3 | Configure Supabase client | ✅ |
| 1.4 | Create database tables | ✅ |
| 1.5 | Set up RLS policies | ✅ |
| 1.6 | Create core models | ✅ |
| 1.7 | Implement AuthService | ✅ |
| 1.8 | Create auth guards | ✅ |
| 1.9 | Set up global styles (TailwindCSS + PrimeNG + colors) | ✅ |
| 1.10 | Create login component | ✅ |
| 1.11 | Configure routing | ✅ |
| 1.12 | Test authentication flow | ✅ |
| 1.4 | Create Landing Page (Hero, Pricing, Contact, About) | ✅ |

**Total: ~5 hours** (incluye PWA, PrimeNG y Landing Page)
