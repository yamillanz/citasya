# Plan de Mejora de Interfaz - CitasYa

## Overview

Rediseñar toda la aplicación para crear una experiencia consistente, moderna y memorable usando el design system "Organic Sophistication" introducido en el landing page.

**Design Direction:** Warm, nature-inspired aesthetic con sage green como color principal. Tipografía Fraunces + DM Sans. Glass morphism, sombras cálidas, micro-interacciones.

---

## Fase 1: Autenticación

### Login Page
- Hero section con branding y tagline
- Formulario centrado con glass morphism
- Logo SVG "CITASYA" prominente
- Social proof sutil ("+500 profesionales confían")
- Links a register y recovery
- Validación inline con feedback visual

### Register Page
- Flujo de onboarding simple
- Progress indicator si es multi-step
- Campos: email, password, confirm password, nombre empresa
- Términos y condiciones link

### Shared Auth Layout
- Componente reutilizable para login/register
- Background con blobs animados (reutilizar del landing)
- Responsive: centrado en desktop, fullwidth en mobile

### Unauthorized Page
- Icono de lock consistente
- Mensaje claro + CTA para volver al login

---

## Fase 2: Backoffice Principal

### Backoffice Layout
- Sidebar colapsable con navegación
- Header con logo, user info, logout
- Main content area con breadcrumbs
- Mobile: drawer menu lateral
- Nuevo color scheme consistente con auth

### Dashboard Page
- Welcome card con user name
- Quick stats: citas hoy, semana, revenue
- Acciones rápidas: nueva cita, cerrar día
- Recent appointments list
- Mini gráficos de tendencias

---

## Fase 3: Gestión de Entidades

### Employees Page
- Header con search y "Agregar" button
- Data table con avatar, name, email, status
- Filtros por rol/estado
- Acciones: edit, delete, view schedule
- Empty state cuando no hay empleados

### Employee Form
- Form section con avatar upload
- Basic info: name, email, phone
- Services assignment con checkboxes
- Schedule configuration por día
- Password reset option
- Validation y error states

### Services Page
- Grid/list toggle view
- Cards con service name, duration, price
- Quick edit inline
- Duplicate service action

### Service Form
- Service name y description
- Duration selector (dropdown con presets + custom)
- Price input con currency
- Assign to employees multiselect
- Buffer time antes/después

---

## Fase 4: Citas y Operativos

### Appointments Page
- Calendar view (week/day)
- List view alternativa
- Filtros: employee, date range, status
- Status badges con colores del design system
- Quick actions: complete, cancel, reschedule
- Click para ver detalles

### Appointment Detail Modal
- Client info
- Service y employee
- Date/time picker para reschedule
- Notes field
- Status history

### Daily Close Page
- Date picker con calendario
- Summary cards: total appointments, revenue, by employee
- Appointments table breakdown
- Generate PDF button (diseño premium)
- Already closed state con badge

---

## Fase 5: Páginas Públicas de Booking

### Company Listing (`/companies`)
- Hero con search bar
- Grid de company cards
- Filters: category, location
- Company card: logo, name, services preview

### Employee Calendar (`/c/:slug/e/:id`)
- Company branding header
- Employee info con foto
- Week view del calendario
- Time slots disponibles
- Duration selector
- "Reservar" CTA prominent

### Booking Form (`/c/:slug/e/:id/book`)
- Progress: Select time → Your info → Confirm
- Form: name, phone, email (opcional), notes
- Summary sidebar en desktop
- Confirmation screen con details
- SMS/email confirmation message

---

## Fase 6: Landing Pages Secundarias

### Pricing Page
- 3-tier pricing cards
- Feature comparison
- FAQ accordion
- CTA final

### About Page
- Company story
- Team section
- Values/principios

### FAQ Page
- Accordion con categorías
- Search functionality
- Contact CTA si no encuentra respuesta

### Contact Page
- Contact form
- Company info
- Social links

---

## Component Inventory

### Buttons
- Primary: gradient sage, rounded full
- Secondary: outlined, sage border
- Ghost: text only con hover bg
- Danger: coral/red para destructive
- Loading state con spinner

### Form Inputs
- Labeled inputs con focus ring sage
- Error state con mensaje inline
- Success validation checkmark
- Textarea para notes

### Cards
- White background, rounded-xl
- Subtle shadow con hover lift
- Header/content/footer sections

### Tables
- Striped rows alternating
- Hover highlight
- Sortable columns
- Pagination component

### Badges/Tags
- Status colors: pending (yellow), completed (green), cancelled (red)
- Rounded full, uppercase small text

### Modals/Dialogs
- Glass morphism backdrop
- Centered card
- Close button top-right
- Actions footer

### Navigation
- Sidebar: icons + labels, active state
- Breadcrumbs: path completo
- Back button cuando aplica

---

## Technical Notes

### Design Tokens (CSS Variables)
```scss
--color-sage: #9DC183
--color-sage-dark: #7BA366
--color-sage-light: #B8D4A3
--color-cream: #FAF8F5
--color-linen: #F5F2ED
--color-coral: #E07A5F
--color-text-primary: #2C3E50
--font-display: 'Fraunces', Georgia, serif
--font-body: 'DM Sans', sans-serif
```

### Architecture
- Shared layout component for backoffice
- Design system components in `shared/ui/`
- SCSS variables imported globally
- PrimeNG theming with Aura + custom overrides

### Priority Order
1. Login (first impression)
2. Backoffice Layout (daily use)
3. Dashboard (at-a-glance info)
4. CRUD pages (employees, services)
5. Appointments (core feature)
6. Daily Close (differentiator)
7. Public booking (client-facing)
8. Supporting pages

---

*Document created: 2026-03-19*
