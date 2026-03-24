# CitasYa - Estado del Proyecto

> **Flujo de Trabajo:** Este proyecto usa **OpenSpec** para desarrollo por fases. Ver comandos en `app-web/README.md` o usar `/opsx:` en el chat.

## Progreso General

| Fase | Estado | Descripción |
|------|--------|-------------|
| Phase 1: Foundation | ✅ Completada | Setup, Auth, Database, **Landing Page** ✅ |
| Phase 2: Public Booking | ✅ Completada | Portal público de reservas |
| Phase 3: Back Office Manager | ✅ Completada | Dashboard, CRUD empleados, servicios, citas |
| Phase 4: Back Office Employee | ✅ Completada | Mi calendario, historial |
| Phase 5: Superadmin | ⏳ Pendiente | Gestión de empresas, usuarios, planes |
| Phase 6: Polish | ⏳ Pendiente | UI/UX, testing, deploy |

---

## Phase 1: Foundation - Detalle

| Task | Descripción | Status |
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
| 1.9 | Set up global styles | ✅ |
| 1.10 | Create login component | ✅ |
| 1.11 | Configure routing | ✅ |
| 1.12 | Test authentication flow | ✅ |
| 1.4 | Create Landing Page | ✅ |
| 1.4a | Home/Hero Component with PrimeNG | ✅ |
| 1.4b | Pricing Component with PrimeNG | ✅ |
| 1.4c | Contact Component with PrimeNG | ✅ |
| 1.4d | About Component with PrimeNG | ✅ |
| 1.4e | FAQ Component with PrimeNG | ✅ |

---

## Landing Page Components - Detalle

| Componente | Ubicación | Estado | Componentes PrimeNG Usados |
|------------|-----------|--------|---------------------------|
| Home/Hero | `features/landing/home/` | ✅ | p-card, p-button, p-divider, p-avatar |
| Pricing | `features/landing/pricing/` | ✅ | p-card, p-badge, p-button, p-panel, p-avatar |
| Contact | `features/landing/contact/` | ✅ | p-card, p-button, p-inputText, p-inputTextarea, p-toast, p-avatar, p-panel |
| About | `features/landing/about/` | ✅ | p-card, p-panel, p-avatar, p-tag, p-divider |
| FAQ | `features/landing/faq/` | ✅ | p-accordion, p-card, p-panel, p-avatar, p-button |

---

## Phase 2: Public Booking Portal - Completada

| Task | Descripción | Status |
|------|-------------|--------|
| 2.1 | Create CompanyService | ✅ Completado |
| 2.2 | Implement company list page | ✅ Completado |
| 2.3 | Create UserService for employee data | ✅ Completado |
| 2.4 | Implement employee calendar page | ✅ Completado |
| 2.5 | Integrate FullCalendar | ✅ Completado |
| 2.6 | Create booking form component | ✅ Completado |
| 2.7 | Implement available slot calculation | ✅ Completado |
| 2.8 | Create appointment via public API | ✅ Completado |
| 2.9 | Implement booking confirmation | ✅ Completado |
| 2.10 | Create cancel/reschedule token | ✅ Completado |
| 2.11 | Test public booking flow | ✅ Completado |

---

## Phase 3: Back Office Manager - Completada ✅

### Componentes Implementados

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| Dashboard | `backoffice/manager/dashboard/` | Panel principal con estadísticas y citas del día |
| Services | `backoffice/manager/services/` | Lista de servicios con CRUD |
| Service Form | `backoffice/manager/services/service-form/` | Formulario crear/editar servicios |
| Employees | `backoffice/manager/employees/` | Lista de empleados con CRUD |
| Employee Form | `backoffice/manager/employees/employee-form/` | Formulario crear/editar empleados |
| Appointments | `backoffice/manager/appointments/` | Lista de citas con filtros y estados |
| Daily Close | `backoffice/manager/daily-close/` | Cierre diario con generación de PDF |
| Backoffice Layout | `backoffice/` | Layout con sidebar de navegación |

### Servicios Actualizados

- ✅ `appointment.service.ts` - Agregados métodos: `getByCompany()`, `getByDate()`, `updateStatus()`
- ✅ `daily-close.service.ts` - Nuevo servicio para generación de PDF con jsPDF

### Rutas Configuradas

- `/bo/dashboard` - Panel principal
- `/bo/services` - Gestión de servicios
- `/bo/services/:id` - Formulario de servicio
- `/bo/employees` - Gestión de empleados
- `/bo/employees/:id` - Formulario de empleado
- `/bo/appointments` - Gestión de citas
- `/bo/close` - Cierre diario

---

## Phase 4: Back Office Employee - Completada ✅

### Componentes Implementados

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| Employee Layout | `backoffice/employee/` | Layout con sidebar de navegación |
| Employee Calendar | `backoffice/employee/calendar/` | Calendario con citas del empleado |
| Employee History | `backoffice/employee/history/` | Historial de citas completadas |

### Servicios Actualizados

- ✅ `appointment.service.ts` - Nuevos métodos: `getByEmployeeAll()`, `getCompletedByEmployee()`

### Rutas Configuradas

- `/emp/calendar` - Mi calendario de citas
- `/emp/history` - Mi historial de citas

---

## Estado de OpenSpec

**Change activo:** `phase-4-back-office-employee` (implementado, listo para verificar/archivar)
**Change archivado:** 
- `2026-03-17-phase-2-public-booking`
- `2026-03-18-phase-3-back-office-manager`
**Specs actualizadas:** appointment-booking, company-directory, employee-calendar, slot-availability, manager-dashboard, services-crud, employees-crud, appointments-management, daily-close, employee-calendar, employee-history

### Artefactos Creados para Phase 4

| Artefacto | Estado | Archivo |
|-----------|--------|---------|
| Proposal | ✅ | `openspec/changes/phase-4-back-office-employee/proposal.md` |
| Specs | ✅ | `openspec/changes/phase-4-back-office-employee/specs/*.md` |
| Design | ✅ | `openspec/changes/phase-4-back-office-employee/design.md` |
| Tasks | ✅ | `openspec/changes/phase-4-back-office-employee/tasks.md` |

**Specs creadas:**
- `employee-calendar.md` - Calendario del empleado
- `employee-history.md` - Historial de citas

### Artefactos Creados para Phase 3

| Artefacto | Estado | Archivo |
|-----------|--------|---------|
| Proposal | ✅ | `openspec/changes/phase-3-back-office-manager/proposal.md` |
| Specs | ✅ | `openspec/changes/phase-3-back-office-manager/specs/*.md` |
| Design | ✅ | `openspec/changes/phase-3-back-office-manager/design.md` |
| Tasks | ✅ | `openspec/changes/phase-3-back-office-manager/tasks.md` |

**Specs creadas:**
- `manager-dashboard.md` - Dashboard con estadísticas
- `services-crud.md` - CRUD de servicios
- `employees-crud.md` - Gestión de empleados
- `appointments-management.md` - Lista y filtros de citas
- `daily-close.md` - Cierre diario con PDF

---

## Estado de Archivos en el Proyecto

### Core Services Implementados
- ✅ `auth.service.ts`
- ✅ `company.service.ts`
- ✅ `user.service.ts`
- ✅ `service.service.ts`
- ✅ `schedule.service.ts`
- ✅ `appointment.service.ts`
- ✅ `daily-close.service.ts`

### Features Públicas Implementadas
- ✅ Company List (`/c/:slug`)
- ✅ Employee Calendar (`/c/:slug/e/:id`)
- ✅ Booking Form (`/c/:slug/e/:id/book`)

---

## Estado de Testing

### Tests Públicos
| Componente | Tests | Estado |
|------------|-------|--------|
| booking-form.component.spec.ts | 5 | ✅ |
| company-list.component.spec.ts | 9 | ✅ |
| appointment.service.spec.ts | 7 | ✅ |

### Tests Backoffice (Phase 3) - Behavior Driven
| Componente | Tests | Tipo | Estado |
|------------|-------|------|--------|
| dashboard.component.spec.ts | 12 | Behavior Driven | ✅ **PASANDO** |
| services.component.spec.ts | 18+ | Behavior Driven | 🚧 Corregir async/await |
| service-form.component.spec.ts | 20+ | Behavior Driven | 🚧 Corregir async/await |
| employees.component.spec.ts | 16+ | Behavior Driven | 🚧 Corregir async/await |
| employee-form.component.spec.ts | 18+ | Behavior Driven | 🚧 Corregir async/await |
| appointments.component.spec.ts | 22+ | Behavior Driven | 🚧 Corregir async/await |
| daily-close.component.spec.ts | 21+ | Behavior Driven | 🚧 Corregir async/await |
| backoffice.component.spec.ts | 19+ | Behavior Driven | 🚧 Corregir async/await |
| **Total Tests Backoffice** | **150+** | | 🚧 **38 pasando, 36 fallando** |

### Estado de Tests
- **✅ Dashboard**: 12/12 tests pasando - Ejemplo completado
- **🚧 Otros componentes**: Tests creados con enfoque BDD pero necesitan:
  - Reemplazar `fakeAsync/tick` por `async/await`
  - Agregar `RouterTestingModule` y `NO_ERRORS_SCHEMA`
  - Corregir mocks de servicios

### Resumen Testing Phase 3
- **8 archivos** de tests creados con **150+ casos** de prueba
- Enfoque **behavior-driven**: Tests validan comportamientos del usuario
- Tests de integración con servicios mockados
- Estructura lista, necesita ajustes de implementación

### Ejecución de Tests
```bash
npm test              # Ejecutar tests
npm run test:watch    # Modo watch
npm run test:coverage # Con coverage
```

---

## Última Actualización
- Fecha: 2026-03-23
- Fase activa: Phase 4 implementada (listo para archivar)
