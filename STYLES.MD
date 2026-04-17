# CitasYa - Guía de Estilos

> **Referencia rápida para crear nuevos componentes sin tener que escanear el código base.**

---

## Arquitectura de Estilos

El proyecto usa un enfoque híbrido:
- **SCSS personalizado con CSS Custom Properties** (design tokens) como fuente principal
- **Tailwind CSS v3** configurado pero **NO se usa en templates**
- **PrimeNG** con overrides vía `:host ::ng-deep`

### Archivos clave
| Archivo | Propósito |
|---------|-----------|
| `app-web/src/styles.scss` | Design tokens, utilidades globales, animaciones, overrides PrimeNG |
| `app-web/tailwind.config.js` | Configuración Tailwind (existe pero no se usa en templates) |
| `app-web/src/app/app.scss` | Estilos nivel app (route loading bar) |
| Cada componente | Su propio archivo `.scss` |

---

## Design Tokens (CSS Custom Properties)

### Colores de Marca - Paleta Verde Salvia

| Variable | Valor | Uso |
|----------|-------|-----|
| `--color-sage` | `#9DC183` | Color primario, botones |
| `--color-sage-dark` | `#7BA366` | Hover, texto primario |
| `--color-sage-light` | `#B8D4A3` | Fondos suaves |
| `--color-sage-pale` | `#E8F0E0` | Fondos muy sutiles, badges |

### Neutros Cálidos

| Variable | Valor | Uso |
|----------|-------|-----|
| `--color-cream` | `#FAF8F5` | Fondo principal de páginas |
| `--color-warm-white` | `#FFFFFF` | Fondos de cards |
| `--color-linen` | `#F5F2ED` | Headers, secciones sutiles |
| `--color-sand` / `--color-border` | `#E8E4DD` | Bordes, divisores |

### Colores de Texto

| Variable | Valor | Uso |
|----------|-------|-----|
| `--color-text-primary` | `#2C3E50` | Texto principal, títulos |
| `--color-text-secondary` | `#5D6D7E` | Descripciones, texto secundario |
| `--color-text-muted` | `#95A5A6` | Placeholders, labels sutiles |

### Colores de Acento

| Variable | Valor | Uso |
|----------|-------|-----|
| `--color-coral` | `#E07A5F` | Acento cálido |
| `--color-coral-light` | `#F4A693` | Coral suave |
| `--color-terracotta` | `#C9784D` | Terracota |

### Colores Funcionales

| Variable | Valor | Equivale a |
|----------|-------|------------|
| `--color-success` | `#9DC183` | = sage |
| `--color-warning` | `#F4D03F` | Amarillo |
| `--color-error` | `#E07A5F` | = coral |
| `--color-info` | `#5D9CEC` | Azul |

### Sombras

| Variable | Valor |
|----------|-------|
| `--shadow-sm` | `0 1px 2px rgba(44, 62, 80, 0.04)` |
| `--shadow-md` | `0 4px 12px rgba(44, 62, 80, 0.08)` |
| `--shadow-lg` | `0 8px 30px rgba(44, 62, 80, 0.12)` |
| `--shadow-xl` | `0 20px 50px rgba(44, 62, 80, 0.15)` |
| `--shadow-glow` | `0 0 40px rgba(157, 193, 131, 0.3)` |

### Tipografía

| Variable | Valor |
|----------|-------|
| `--font-display` | `'Fraunces', Georgia, serif` |
| `--font-body` | `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif` |

### Espaciado

| Variable | Valor |
|----------|-------|
| `--space-xs` | `4px` |
| `--space-sm` | `8px` |
| `--space-md` | `16px` |
| `--space-lg` | `24px` |
| `--space-xl` | `32px` |
| `--space-2xl` | `48px` |
| `--space-3xl` | `64px` |
| `--space-4xl` | `96px` |

### Border Radius

| Variable | Valor |
|----------|-------|
| `--radius-sm` | `6px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `20px` |
| `--radius-xl` | `32px` |
| `--radius-full` | `9999px` |

### Transiciones

| Variable | Valor |
|----------|-------|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--ease-out-back` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `--duration-fast` | `150ms` |
| `--duration-normal` | `300ms` |
| `--duration-slow` | `500ms` |

---

## Tipografía

### Familias
- **Títulos/Display**: `var(--font-display)` → Fraunces
- **Cuerpo**: `var(--font-body)` → DM Sans

### Tamaños por contexto

| Contexto | Tamaño | Peso |
|----------|--------|------|
| h1 global | `clamp(2.5rem, 5vw, 4rem)` | 500 |
| h2 global | `clamp(2rem, 4vw, 3rem)` | 500 |
| h3 global | `clamp(1.5rem, 3vw, 2rem)` | 500 |
| Page heading (h1) | `clamp(1.5rem, 3vw, 2rem)` | 500 |
| Section title | `1.25rem` | 500 |
| Card title | `1.0625rem - 1.125rem` | 500-600 |
| Body text | `0.9375rem` (15px) | 400 |
| Labels/meta | `0.875rem` (14px) | 500 |
| Small text | `0.8125rem` (13px) | 400-500 |
| Badge text | `0.75rem` (12px) | 600 |
| Tiny text | `0.6875rem` (11px) | 600 |
| Micro text | `0.625rem` (10px) | 600 |

### Pesos
- **400**: Texto cuerpo
- **500**: Títulos, labels, links
- **600**: Texto bold, badges, valores stat
- **700**: Precios, números importantes

---

## Layout Patterns

### Página Backoffice (estructura universal)

```scss
.<page-name>-page {
  padding: 2.5rem;
  max-width: 1200px;
  animation: fadeIn 0.4s ease;
}

@media (max-width: 768px) {
  .<page-name>-page {
    padding: var(--space-lg) var(--space-md);
  }
}
```

### Header de Página (patrón universal)

```scss
.page-header {
  margin-bottom: var(--space-xl);
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.header-badge {
  display: inline-block;
  padding: var(--space-xs) var(--space-md);
  background: var(--color-sage-pale);
  color: var(--color-sage-dark);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: var(--radius-full);
  margin-bottom: var(--space-sm);
}

.header-text h1 {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.header-text p {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  margin: 0;
}
```

### Grid de Stats

```scss
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-md);
}
```

### Grid de Cards

```scss
.<items>-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--space-lg);
}
```

### Form Grid

```scss
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
}

.form-field.full-width {
  grid-column: 1 / -1;
}
```

---

## Card Patterns

### Card Estándar

```scss
.card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-out-expo);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
  }
}
```

### Card con Decoración

```scss
.card {
  position: relative;
  // ... estilos base
}

.card-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-light) 100%);
  border-radius: 0 0 0 120px;
  opacity: 0.08;
  transition: opacity var(--duration-normal) ease;
}

.card:hover .card-decoration { opacity: 0.12; }
```

### Stat Card

```scss
.stat-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.stat-icon {
  width: 56px;
  height: 56px;
  min-width: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
}
```

---

## Button Patterns

### Primario (Gradiente Salvia)

```scss
.btn-primary {
  background: linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-dark) 100%);
  border: none;
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-lg);
  font-weight: 600;
  color: white;
  transition: all var(--duration-fast) ease;
  box-shadow: 0 4px 15px rgba(157, 193, 131, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(157, 193, 131, 0.4);
  }
}
```

### Secundario

```scss
.btn-secondary {
  background: white;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  padding: var(--space-sm) var(--space-lg);
  font-weight: 500;
  border-radius: var(--radius-lg);

  &:hover {
    border-color: var(--color-sage);
    color: var(--color-sage-dark);
  }
}
```

### Icon Button

```scss
.btn-icon {
  width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
  border-radius: var(--radius-md) !important;

  &:hover {
    background: var(--color-sage-pale) !important;
  }
}
```

---

## Form Input Patterns

### Input Estándar

```scss
input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  background: white;
  transition: all var(--duration-fast) ease;

  &::placeholder {
    color: var(--color-text-muted);
  }

  &:focus {
    outline: none;
    border-color: var(--color-sage);
    box-shadow: 0 0 0 3px var(--color-sage-pale);
  }

  &.ng-invalid.ng-touched {
    border-color: #ef4444;
    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  }
}
```

### Form Field

```scss
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.form-field label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-text-primary);
}

.form-field label i {
  color: var(--color-sage);
}
```

---

## Status Badge Pattern

Universal en todos los componentes:

```scss
.status-badge {
  display: inline-block;
  padding: var(--space-xs) var(--space-md);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border-radius: var(--radius-full);

  &.status-completed {
    background: rgba(34, 197, 94, 0.1);
    color: #16a34a;
  }

  &.status-pending {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
  }

  &.status-cancelled {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
  }

  &.status-no_show {
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;
  }
}
```

---

## Loading State Pattern

Idéntico en todas las páginas:

```scss
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: var(--space-md);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-sage-pale);
  border-top-color: var(--color-sage);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
}
```

---

## Empty State Pattern

```scss
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl);
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  text-align: center;
}

.empty-state h3 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
}

.empty-state p {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
  max-width: 320px;
}
```

---

## Avatar Pattern

```scss
.avatar-placeholder {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-sage);
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
}

.user-avatar {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-dark) 100%);
  color: white;
  font-weight: 700;
  font-size: 1rem;
}

.status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid white;
  background: var(--color-text-muted);

  &.active { background: #22c55e; }
}
```

---

## Navigation/Sidebar Pattern

```scss
.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  margin: var(--space-xs) var(--space-sm);
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.9375rem;

  i {
    font-size: 1.125rem;
    width: 24px;
    text-align: center;
  }

  &:hover {
    background: var(--color-sage-pale);
    color: var(--color-text-primary);
  }

  &.active {
    background: linear-gradient(135deg, rgba(157, 193, 131, 0.15) 0%, rgba(157, 193, 131, 0.08) 100%);
    color: var(--color-sage-dark);
    font-weight: 600;

    i { color: var(--color-sage); }
  }
}
```

---

## PrimeNG Overrides

Usar `:host ::ng-deep` con `!important`:

### Dialog (ya global en styles.scss)
```scss
.p-dialog {
  background: var(--color-warm-white) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-xl) !important;
}

.p-dialog-header {
  background: var(--color-linen) !important;
  border-bottom: 1px solid var(--color-border) !important;
  padding: var(--space-md) var(--space-lg) !important;
}

.p-dialog-header .p-dialog-title {
  font-family: var(--font-display) !important;
  font-size: 1.25rem !important;
  font-weight: 600 !important;
}
```

### DataTable
```scss
:host ::ng-deep {
  .p-datatable-thead > tr > th {
    background: var(--color-linen);
    color: var(--color-text-secondary);
    font-weight: 600;
    font-size: 0.8125rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    padding: var(--space-md) var(--space-lg);
  }

  .p-datatable-tbody > tr > td {
    padding: var(--space-md) var(--space-lg);
    border-color: var(--color-border);
  }
}
```

### Paginator
```scss
:host ::ng-deep {
  .p-paginator {
    background: white;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
  }

  .p-paginator-page.p-highlight {
    background: var(--color-sage);
    border-color: var(--color-sage);
    color: white;
  }
}
```

### Tags
```scss
:host ::ng-deep {
  .p-tag {
    font-weight: 500;
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-full);

    &.p-tag-success {
      background: var(--color-sage-pale);
      color: var(--color-sage-dark);
    }
  }
}
```

---

## Animaciones

### Keyframes globales (ya definidos en styles.scss)

| Animación | Duración | Uso |
|-----------|----------|-----|
| `fadeInUp` | 0.6s | Entrada de secciones |
| `fadeIn` | 0.4s | Fade simple |
| `scaleIn` | 0.5s | Entrada con escala |
| `float` | 6s infinite | Elementos decorativos |
| `pulse-glow` | 3s infinite | Efecto glow pulsante |
| `spin` | 1s linear infinite | Loading spinner |

### Clases de utilidad

| Clase | Propósito |
|-------|-----------|
| `.animate-fade-in-up` | Fade in + slide up |
| `.animate-fade-in` | Fade in simple |
| `.animate-scale-in` | Scale in |
| `.animate-float` | Floating |
| `.animate-pulse-glow` | Glow pulsante |
| `.delay-100` a `.delay-600` | Stagger animation |

---

## Responsive Breakpoints

| Breakpoint | Uso |
|------------|-----|
| `max-width: 480px` | Pantallas muy pequeñas |
| `max-width: 640px` | Mobile (botones full-width) |
| `max-width: 768px` | Tablet (grid collapse, flex column) |
| `max-width: 900px` | Pricing grid collapse |
| `max-width: 1024px` | Sidebar collapse, mobile header |
| `min-width: 1025px` | Desktop sidebar visible |

### Patrón responsive

```scss
// Desktop first, luego mobile override
.component {
  padding: 2.5rem;

  @media (max-width: 768px) {
    padding: var(--space-lg) var(--space-md);
  }
}
```

---

## Utilidades Globales

Definidas en `src/styles.scss`:

| Clase | Propósito |
|-------|-----------|
| `.container` | Max-width 1280px centrado |
| `.text-gradient` | Texto con gradiente salvia |
| `.glass` | Glassmorphism effect |
| `.glass-dark` | Glassmorphism oscuro |
| `.card-organic` | Card con hover lift |
| `.btn-primary` | Botón primario con gradiente |
| `.btn-outline` | Botón outlined salvia |
| `.blob` / `.blob-sage` | Forma decorativa blob |
| `.wave-divider` | SVG wave divider |
| `.grain` | Textura grain overlay |

---

## Spacing Reference

### Gaps consistentes

| Contexto | Gap |
|----------|-----|
| Elementos dentro de card | `var(--space-sm)` (8px) |
| Form fields | `var(--space-sm)` a `var(--space-lg)` |
| Grid items | `var(--space-md)` a `var(--space-lg)` |
| Secciones | `var(--space-xl)` a `var(--space-2xl)` |
| Header a contenido | `var(--space-xl)` |

### Padding consistentes

| Contexto | Padding |
|----------|---------|
| Cards | `var(--space-lg)` (24px) |
| Form cards | `var(--space-xl)` (32px) |
| Page content | `2.5rem` desktop, `var(--space-lg) var(--space-md)` mobile |
| Dialog content | `var(--space-lg)` |
| Drawer content | `var(--space-lg)` |

---

## Estructura de Archivo SCSS de Componente

```scss
// 1. Contenedor de página
.<page-name>-page { ... }

// 2. Animación local (si necesaria)
@keyframes fadeIn { ... }

// 3. Secciones con comentarios
/* ================================
   Header
   ================================ */

// 4. Header styles
.page-header { ... }

// 5. Loading state
.loading-state { ... }

// 6. Empty state
.empty-state { ... }

// 7. Contenido principal (grid/list)
.<items>-grid { ... }
.<item>-card { ... }

// 8. Overrides de PrimeNG
:host ::ng-deep {
  .btn-primary { ... }
  .btn-secondary { ... }
}

// 9. Responsive
@media (max-width: 768px) { ... }
```

---

## Checklist Rápido para Nuevo Componente

1. ✅ Usar CSS custom properties (`var(--color-*)`, `var(--space-*)`, etc.)
2. ✅ NO usar clases de Tailwind en templates
3. ✅ Fondo de página: `var(--color-cream)`
4. ✅ Fondo de cards: `white`
5. ✅ Border radius de cards: `var(--radius-xl)` (32px)
6. ✅ Sombra de cards: `var(--shadow-md)`
7. ✅ Botón primario: gradiente salvia
8. ✅ Tipografía headings: `var(--font-display)`
9. ✅ Tipografía body: `var(--font-body)`
10. ✅ Responsive con `@media (max-width: 768px)`
11. ✅ PrimeNG overrides con `:host ::ng-deep` + `!important`
12. ✅ Animación de entrada: `animation: fadeIn 0.4s ease`
