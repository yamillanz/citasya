# Plan: Refactor Appointments a resource() Reactivo

> **Versión**: 1.0  
> **Fecha**: 2026-05-14  
> **Scope**: `app-web/src/app/features/backoffice/manager/appointments/appointments.component.ts` + `.html`  
> **Servicios**: Sin cambios  
> **Angular**: 20.3.19 (`resource()` estable desde v19)

---

## 1. Problema Actual

El componente de citas usa fetching imperativo con ~80 líneas de boilerplate:

- `resetAndLoad()` manual con `loading.set(true/false)`
- `debouncedFilterChange()` con `setTimeout` para coordinar filtros
- Duplicación de mapeo filtros→API params en 3 lugares (`resetAndLoad`, `loadMore`, `loadInitialData`)
- El bug reciente de filtros reseteándose fue causado por esta arquitectura imperativa

**Estado actual (extracto clave):**

```typescript
// Signals de filtros
filterEmployee = signal<string>('');
filterDate = signal<Date | null>(null);
filterStatus = signal<string>('');
searchQuery = signal<string>('');
loading = signal(true);

// Métodos imperativos que deben eliminarse
async resetAndLoad() { ... }      // ~35 líneas
async loadInitialData() { ... }   // ~15 líneas
debouncedFilterChange() { ... }   // ~5 líneas
private filterTimeout?: ReturnType<typeof setTimeout>;
```

---

## 2. Estado Deseado

Dos `resource()` declarativos + un `computed()` para params de filtros. Cuando cualquier filtro cambia, `resource()` auto-refetchea página 0.

```typescript
// 1. Filtros como signals (ya existen, se mantienen)
filterEmployee = signal<string>('');
filterDate = signal<Date | null>(null);
filterStatus = signal<string>('');
searchQuery = signal<string>('');     // UI inmediata

// 2. Search con debounce separado
debouncedSearchQuery = signal<string>('');
private searchTimeout?: ReturnType<typeof setTimeout>;

// 3. Params de filtros como computed
filterParams = computed(() => {
  const cid = this.companyId();
  if (!cid) return undefined;
  return {
    companyId: cid,
    status: this.filterStatus() || undefined,
    employeeId: this.filterEmployee() || undefined,
    date: this.formatFilterDate(this.filterDate()),
    search: this.debouncedSearchQuery().trim() || undefined,
  };
});

// 4. Resource para citas (página 0, auto-reload)
appointmentsResource = resource({
  params: () => this.filterParams(),
  loader: ({ params }) =>
    this.appointmentService.getByCompanyPaginated({
      ...params!,
      page: 0,
      pageSize: this.pageSize(),
    }),
});

// 5. Resource para empleados
employeesResource = resource({
  params: () => this.companyId(),
  loader: ({ params }) =>
    params
      ? this.userService
          .getByCompany(params)
          .then((users) =>
            users.filter(
              (u) =>
                u.role === 'employee' ||
                (u.role === 'manager' && u.can_be_employee)
            )
          )
      : [],
});

// 6. Effect: resource.value() → accumulatedAppointments (REPLACE)
constructor() {
  effect(() => {
    const result = this.appointmentsResource.value();
    if (result) {
      this.accumulatedAppointments.set(result.data);
      this.totalCount.set(result.totalCount);
      this.hasMore.set(result.hasMore);
      this.currentPage.set(0);
    }
  });
}
```

---

## 3. Cambios por Fase

### Fase 1 — Imports y filterParams

**Archivo**: `appointments.component.ts`

1. Agregar import:
   ```typescript
   import { Component, inject, OnInit, OnDestroy, signal, computed, effect, resource, ChangeDetectionStrategy, NgZone, viewChild, ElementRef } from '@angular/core';
   ```

2. Crear `debouncedSearchQuery = signal<string>('');`

3. Crear helper privado:
   ```typescript
   private formatFilterDate(date: Date | null): string | undefined {
     if (!date) return undefined;
     return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
   }
   ```

4. Crear `filterParams` computed:
   ```typescript
   filterParams = computed(() => {
     const cid = this.companyId();
     if (!cid) return undefined;
     return {
       companyId: cid,
       status: (this.filterStatus() || undefined) as AppointmentStatus | undefined,
       employeeId: this.filterEmployee() || undefined,
       date: this.formatFilterDate(this.filterDate()),
       search: this.debouncedSearchQuery().trim() || undefined,
     };
   });
   ```

### Fase 2 — Crear appointmentsResource

**Archivo**: `appointments.component.ts`

```typescript
appointmentsResource = resource({
  params: () => this.filterParams(),
  loader: ({ params }) => {
    if (!params) throw new Error('No params');
    return this.appointmentService.getByCompanyPaginated({
      ...params,
      page: 0,
      pageSize: this.pageSize(),
    });
  },
});
```

Agregar effect en constructor (reemplazar el effect existente de sentinel o agregar uno nuevo):

```typescript
effect(() => {
  const result = this.appointmentsResource.value();
  if (result && !this.loadingMore()) {
    this.accumulatedAppointments.set(result.data);
    this.totalCount.set(result.totalCount);
    this.hasMore.set(result.hasMore);
    this.currentPage.set(0);
  }
});
```

> **Nota**: El guard `!this.loadingMore()` evita que el effect pise datos mientras `loadMore()` está appending.

### Fase 3 — Crear employeesResource

**Archivo**: `appointments.component.ts`

```typescript
employeesResource = resource({
  params: () => this.companyId(),
  loader: ({ params }) => {
    if (!params) return Promise.resolve([]);
    return this.userService.getByCompany(params).then(users =>
      users.filter(u => u.role === 'employee' || (u.role === 'manager' && u.can_be_employee))
    );
  },
});
```

Actualizar `employeeOptions`:

```typescript
employeeOptions = computed<FilterOption[]>(() => [
  { label: 'Todos los empleados', value: '' },
  ...(this.employeesResource.value() || []).map(emp => ({
    label: emp.full_name,
    value: emp.id
  }))
]));
```

Eliminar: `employees = signal<User[]>([]);`

### Fase 4 — Eliminar métodos imperativos

**Archivo**: `appointments.component.ts`

Eliminar por completo estos métodos y propiedades:

| Elemento | Razón |
|----------|-------|
| `loading = signal(true)` | Reemplazado por `appointmentsResource.isLoading()` |
| `resetAndLoad()` | `resource()` auto-reload en cambio de filtros |
| `loadInitialData()` | `resource()` arranca solo cuando `companyId` se setea |
| `debouncedFilterChange()` | No necesario, `resource()` reacciona a signals |
| `filterTimeout` | No necesario |

### Fase 5 — Actualizar métodos existentes

**Archivo**: `appointments.component.ts`

#### 5.1 `ngOnInit()`

```typescript
async ngOnInit() {
  const user = await this.authService.getCurrentUser();
  if (user?.company_id) {
    this.companyId.set(user.company_id);
    const company = await this.companyService.getById(user.company_id);
    if (company) {
      this.companyName.set(company.name);
    }
    // NO llamar loadInitialData() — los resources arrancan solos
  }
  // NO setear loading = false — el resource maneja su propio estado
}
```

#### 5.2 `refreshData()`

```typescript
refreshData() {
  this.appointmentsResource.reload();
}
```

#### 5.3 `clearFilters()`

```typescript
clearFilters() {
  if (this.searchTimeout) clearTimeout(this.searchTimeout);
  this.filterEmployee.set('');
  this.filterDate.set(null);
  this.filterStatus.set('');
  this.searchQuery.set('');
  this.debouncedSearchQuery.set('');
  // NO llamar resetAndLoad() — filterParams recomputa y resource auto-reload
}
```

#### 5.4 `onSearch()`

```typescript
onSearch(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  this.searchQuery.set(value);
  if (this.searchTimeout) clearTimeout(this.searchTimeout);
  this.searchTimeout = setTimeout(() => {
    this.debouncedSearchQuery.set(value);
  }, 300);
}
```

#### 5.5 Filter handlers (sin debounce)

```typescript
onDateSelect(date: Date) {
  this.filterDate.set(date);
  // resource auto-reloads via filterParams
}

onDateClear() {
  this.filterDate.set(null);
  // resource auto-reloads via filterParams
}

onEmployeeChange(event: any) {
  this.filterEmployee.set(event.value ?? '');
  // resource auto-reloads via filterParams
}

onStatusChange(event: any) {
  this.filterStatus.set(event.value ?? '');
  // resource auto-reloads via filterParams
}
```

#### 5.6 `handleAppointmentCreated()`

```typescript
async handleAppointmentCreated() {
  this.showCreateDialog.set(false);
  this.appointmentsResource.reload();
}
```

#### 5.7 `loadMore()`

```typescript
async loadMore() {
  if (!this.hasMore() || this.loadingMore() || !this.companyId()) return;

  const nextPage = this.currentPage() + 1;
  this.loadingMore.set(true);
  try {
    const params = this.filterParams();
    if (!params) return;

    const result = await this.appointmentService.getByCompanyPaginated({
      ...params,
      page: nextPage,
      pageSize: this.pageSize(),
    });

    this.accumulatedAppointments.update(current => [...current, ...result.data]);
    this.totalCount.set(result.totalCount);
    this.hasMore.set(result.hasMore);
    this.currentPage.set(nextPage);
  } catch (error: any) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar más citas'
    });
  } finally {
    this.loadingMore.set(false);
  }
}
```

> **Nota**: Ya no necesita mapear filtros manualmente — usa `this.filterParams()` directamente.

#### 5.8 IntersectionObserver

Actualizar la condición:

```typescript
if (entries[0].isIntersecting && this.hasMore() && !this.loadingMore() && !this.appointmentsResource.isLoading()) {
```

### Fase 6 — Template HTML

**Archivo**: `appointments.component.html`

#### 6.1 Loading state principal

Reemplazar:
```html
@if (loading()) {
```

Con:
```html
@if (appointmentsResource.isLoading()) {
```

#### 6.2 Filters bar loading class

Reemplazar:
```html
<div class="filters-bar" [class.loading]="loading()">
```

Con:
```html
<div class="filters-bar" [class.loading]="appointmentsResource.isLoading()">
```

#### 6.3 Refresh button

Reemplazar:
```html
[loading]="loading()"
```

Con:
```html
[loading]="appointmentsResource.isLoading()"
```

#### 6.4 Error state (nuevo)

Después del header, antes del loading state, agregar:

```html
@if (appointmentsResource.error()) {
  <div class="error-state">
    <i class="pi pi-exclamation-circle"></i>
    <p>No se pudieron cargar las citas</p>
    <p-button
      label="Reintentar"
      icon="pi pi-refresh"
      severity="secondary"
      (onClick)="appointmentsResource.reload()"
      styleClass="btn-secondary">
    </p-button>
  </div>
} @else if (appointmentsResource.isLoading()) {
  <!-- loading spinner existing -->
} @else {
  <!-- data content existing -->
}
```

#### 6.5 Sentinels dentro de loadingMore

Asegurar que el sentinel solo se renderice cuando `appointmentsResource.isLoading()` es false:

```html
@if (hasMore() && !appointmentsResource.isLoading()) {
  <div #sentinel class="scroll-sentinel"></div>
}
```

### Fase 7 — Styles (si es necesario)

**Archivo**: `appointments.component.scss`

Agregar estilos para error state:

```scss
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: var(--space-md);
  
  i {
    font-size: 2rem;
    color: var(--color-error);
  }
  
  p {
    color: var(--color-text-secondary);
    font-size: 1rem;
  }
}
```

---

## 4. Mapeo Estado: Antes → Después

| Antes | Después | Notas |
|-------|---------|-------|
| `loading = signal(true)` | `appointmentsResource.isLoading()` | Derivado del resource |
| `resetAndLoad()` | Eliminado | `resource()` auto-reload |
| `loadInitialData()` | Eliminado | `ngOnInit` setea `companyId`, resources arrancan solos |
| `debouncedFilterChange()` | Eliminado | `resource()` reacciona a signal changes |
| `filterTimeout` | Eliminado | No necesario |
| `employees = signal<User[]>` | `employeesResource.value()` | Derivado del resource |
| `refreshData()` | `appointmentsResource.reload()` | Simplificado |
| `loadMore()` | Manual con `filterParams()` | Simplificado, sin duplicación de params |
| Error handling (toast) | `appointmentsResource.error()` + template | Declarativo |

---

## 5. Edge Cases a Considerar

1. **Filter change mientras `loadMore()` corre**: El effect tiene guard `!this.loadingMore()`. Si un filter change llega durante loadMore, el resource reemplazará `accumulatedAppointments` cuando `loadingMore` vuelva a false.

2. **Rapid filter changes**: `resource()` auto-aborta requests anteriores via `AbortSignal`. Solo el último request gana.

3. **Company ID null**: `filterParams` retorna `undefined`, resource entra en `idle`. No hay API calls.

4. **Error en carga inicial**: `appointmentsResource.error()` tiene el error. El template muestra error state con retry.

5. **Reload con filtros activos**: `appointmentsResource.reload()` usa los filtros actuales. El effect reemplaza `accumulatedAppointments`.

---

## 6. Checklist de Implementación

- [ ] Fase 1: Imports, `debouncedSearchQuery`, `formatFilterDate`, `filterParams`
- [ ] Fase 2: `appointmentsResource` + effect de sync
- [ ] Fase 3: `employeesResource` + update `employeeOptions`
- [ ] Fase 4: Eliminar `loading`, `resetAndLoad`, `loadInitialData`, `debouncedFilterChange`, `filterTimeout`
- [ ] Fase 5: Update `ngOnInit`, `refreshData`, `clearFilters`, `onSearch`, filter handlers, `handleAppointmentCreated`, `loadMore`, IntersectionObserver
- [ ] Fase 6: Template — `loading()` → `appointmentsResource.isLoading()`, error state, refresh button
- [ ] Fase 7: Styles para error state
- [ ] Build pasa (`ng build`)
- [ ] Test manual: carga inicial con filtros
- [ ] Test manual: cambio de filtro → auto-reload
- [ ] Test manual: search con debounce
- [ ] Test manual: clear filters
- [ ] Test manual: refresh button
- [ ] Test manual: load more / infinite scroll
- [ ] Test manual: error state + retry
- [ ] Test manual: drawer actions (complete, cancel, pay)
- [ ] Test manual: crear cita + auto-reload
- [ ] Test manual: stats se actualizan correctamente
