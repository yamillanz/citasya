# CitasYa - Reglas Específicas del Proyecto

**IMPORTANT** the folder of the project ins ./app-web

---

## OpenSpec - FLUJO OBLIGATORIO PARA TODOS LOS CAMBIOS

**⚠️ IMPORTANTE: TODO cambio debe seguir el flujo OpenSpec sin excepción.**

### Ubicación de OpenSpec:
- **OpenSpec SIEMPRE opera desde la raíz del proyecto**: `./openspec/`
- **NUNCA crear cambios en** `app-web/openspec/`
- Los comandos `openspec` deben ejecutarse desde la raíz del proyecto
- Los artifacts (proposal, design, specs, tasks) están en `./openspec/changes/<nombre>/`

### Comandos CLI disponibles:
- `openspec new change <name>` - Iniciar nueva tarea/cambio
- `openspec status --change <name>` - Ver estado de artifacts
- `openspec instructions <artifact> --change <name>` - Instrucciones para crear un artifact
- `openspec list` - Listar cambios activos
- `openspec archive <change-name>` - Archivar cambio completado
- `openspec validate <item>` - Validar cambio o spec

### Patrones del agente (no son comandos CLI, el agente los ejecuta):
- **Continue** (siguiente artifact): `openspec status --json` → identificar listo → `openspec instructions` → crear
- **Fast-forward** (todos los artifacts): Loop secuencial: proposal → specs → design → tasks
- **Apply** (implementar): Leer `tasks.md` → trabajar items `[ ]` → marcar `[x]`
- **Verify** (validar): Comparar código contra specs, design y tasks
- **Sync** (merge delta specs): Merge delta specs del change a `openspec/specs/`

### Cuándo usar:
- ✅ Cualquier bug fix
- ✅ Cualquier nueva feature
- ✅ Cualquier refactorización
- ✅ Cualquier cambio en UI/estilos
- ✅ Cambios en un solo archivo

### Excepciones:
- Solo para cambios menores de documentación (fix typos, comments) se puede hacer commit directo
- Para cualquier duda sobre si usar OpenSpec, SIEMPRE usar OpenSpec

### Referencia:
- Comandos completos ejecutando `openspec --help`
- Documentation en `.agents/skills/openspec*/SKILL.md`

---

## UI Framework (PrimeNG) - SOLO PARA ESTE PROYECTO

- **Use PrimeNG components exclusively** for all UI elements
- **Before creating any component**, consult PrimeNG documentation via Context7 MCP to find appropriate components
- **Available components**: p-button, p-card, p-inputText, p-accordion, p-table, p-dialog, p-tabView, p-dropdown, p-calendar, etc.
- **Reference**: https://primeng.org

### Workflow obligatorio:
```
1. Identify UI need (e.g., "need a form with inputs and buttons")
2. Query Context7 MCP for PrimeNG components
3. Select appropriate components (p-inputText, p-button, p-card)
4. Implement using PrimeNG - NEVER custom HTML/CSS when PrimeNG alternative exists
```

### Componentes disponibles en PrimeNG (memorizar):
- **Forms**: p-inputText, p-inputTextarea, p-dropdown, p-calendar, p-checkbox, p-radioButton
- **Buttons**: p-button, p-splitButton, p-speedDial
- **Data**: p-table, p-dataView, p-orderList, p-pickList, p-tree, p-timeline
- **Overlays**: p-dialog, p-sidebar, p-tooltip, p-overlayPanel, p-confirmDialog
- **Menus**: p-menubar, p-tabMenu, p-breadcrumb, p-steps, p-tieredMenu
- **Messages**: p-toast, p-messages, p-confirmPopup
- **Panels**: p-accordion, p-panel, p-fieldset, p-card, p-tabView, p-divider
- **Media**: p-image, p-galleria, p-carousel, p-avatar
- **Misc**: p-badge, p-tag, p-skeleton, p-progressBar, p-progressSpinner

### Ejemplos de conversión:
- ❌ NO usar: `<input type="text">` 
- ✅ USAR: `<input pInputText>`
- ❌ NO usar: `<button>`
- ✅ USAR: `<p-button>`
- ❌ NO usar: `<div class="card">`
- ✅ USAR: `<p-card>`

---

## Guía de Estilos

**⚠️ ANTES de crear cualquier componente o modificar UI, leer `STYLES.MD` en la raíz del proyecto.**

El archivo `STYLES.MD` contiene la guía completa de estilos con:
- Design tokens (colores, espaciado, tipografía, sombras, border-radius)
- Layout patterns (páginas, headers, grids, forms)
- Card patterns (estándar, stat card, glass card)
- Button patterns (primario, secundario, icon)
- Form input patterns
- Status badge pattern
- Loading/Empty state patterns
- PrimeNG override patterns
- Animaciones y utilidades globales
- Responsive breakpoints
- Checklist rápido para nuevos componentes

**NO escanear componentes existentes para copiar estilos** - toda la información está en `STYLES.MD`.

---

## Esquema de Colores (Resumen)

| Color | Código Hex | Uso |
|-------|------------|-----|
| **Verde Salvia** | `#9DC183` | Primary color, botones principales |
| **Gris Cálido** | `#5D6D7E` | Texto secundario, bordes |
| **Blanco Puro** | `#FFFFFF` | Fondos |
| **Crema** | `#FAF8F5` | Fondo principal de páginas |

> Para la paleta completa de colores, ver `STYLES.MD` → Design Tokens

---

## Convenciones de Código

### Componentes
- Siempre standalone components
- ChangeDetection: `ChangeDetectionStrategy.OnPush`
- Usar `inject()` en lugar de constructor
- Separar template y styles si >25 líneas / >6 líneas respectivamente
- Usar `input()` y `output()` (no decoradores) para Angular 17.2+

### Signals (Estado Reactivo)
- Usar `signal()` para estado local
- Usar `computed()` para estado derivado
- **CRÍTICO**: En templates, SIEMPRE invocar signals con `()` - ej: `{{ mySignal() }}`, `@if (mySignal())`
- Para acceder al valor en TypeScript: `mySignal()` (invocar para leer)
- Para modificar: `mySignal.set(value)` o `mySignal.update(v => newValue)`

### Control Flow Nativo (Angular 17+)
- Usar `@if`, `@else`, `@for`, `@switch` en lugar de `*ngIf`, `*ngFor`, `*ngSwitch`
- En `@for`, usar `track item.id` para mejor rendimiento
- Variables de contexto: `$index`, `$first`, `$last`, `$even`, `$odd`

### Formularios
- Usar Reactive Forms con `FormBuilder`
- Validaciones con `Validators.required`, `Validators.email`, `Validators.minLength`, etc.
- Acceder a valores: `form.value.fieldName` o `form.get('fieldName')?.value`
- Verificar touched/dirty: `control?.touched`, `control?.dirty`

### Servicios
- `providedIn: 'root'` por defecto
- Nombres descriptivos terminados en `Service`
- Inyectar con `inject(NombreService)` en el constructor o como campo privado

### Modelos
- Interfaces en `src/app/core/models/`
- Nomenclatura: `nombre.model.ts`
- Usar tipos exportados: `export type UserRole = 'superadmin' | 'manager' | 'employee'`

### Nomenclatura de Archivos
| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Páginas | `nombre.page.ts` | `dashboard.page.ts` |
| Componentes | `nombre.component.ts` | `employee-card.component.ts` |
| Servicios | `nombre.service.ts` | `appointment.service.ts` |
| Modelos | `nombre.model.ts` | `user.model.ts` |
| Feature pages | `features/[area]/[nombre]/` | `features/backoffice/manager/dashboard/` |

### Templates HTML
- Props de PrimeNG: usar PascalCase o kebab-case según el componente
- Eventos: `(eventName)` para outputs nativos, `(onEventName)` para PrimeNG
- Bindings: `[property]="value"` para inputs, `{{ expression }}` para texto
- **Señales en templates**: Siempre invocar con paréntesis `{{ mySignal() }}`, `@if (mySignal())`
- **Null safety**: Usar `?.` optional chaining para propiedades de objects nullable

### Importaciones en Componentes
```typescript
// Estructura típica de imports
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
// PrimeNG modules según se usen
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonModule, CardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
```

### Ejemplos de Código

**Estado local con signals:**
```typescript
loading = signal(false);
error = signal('');
data = signal<Data[]>([]);

// Leer valor
if (this.data().length > 0) { ... }

// Modificar
this.loading.set(true);
this.data.update(current => [...current, newItem]);
```

**Computed:**
```typescript
filteredItems = computed(() => {
  const query = this.searchQuery().toLowerCase();
  return this.items().filter(item => item.name.toLowerCase().includes(query));
});
```

**Template con signals:**
```html
@if (loading()) {
  <p>Cargando...</p>
}

@for (item of items(); track item.id) {
  <p>{{ item.name }}</p>
}

<span>{{ filteredItems().length }} resultados</span>
```

---

## Estructura de Carpetas del Proyecto

```
app-web/
├── src/
│   ├── app/
│   │   ├── core/                    # Lógica central y compartida
│   │   │   ├── models/              # Interfaces y tipos (user.model.ts, company.model.ts, etc.)
│   │   │   ├── services/            # Servicios globales (auth.service.ts, appointment.service.ts, etc.)
│   │   │   ├── guards/              # Route guards (auth.guard.ts, role.guard.ts)
│   │   │   ├── interfaces/          # Interfaces TypeScript genéricas
│   │   │   ├── tokens/              # Injection tokens
│   │   │   └── supabase.ts          # Configuración de Supabase
│   │   │
│   │   ├── features/                # Módulos de funcionalidades (lazy loaded)
│   │   │   ├── landing/             # Landing page pública
│   │   │   │   ├── home/            # Página principal (/)
│   │   │   │   ├── contact/         # Formulario de contacto (/contact)
│   │   │   │   ├── pricing/         # Planes y precios (/pricing)
│   │   │   │   ├── about/           # Sobre nosotros (/about)
│   │   │   │   ├── faq/             # Preguntas frecuentes (/faq)
│   │   │   │   └── landing.routes.ts
│   │   │   │
│   │   │   ├── public/              # Portal público de citas (sin login)
│   │   │   │   ├── company-list/    # Listado de empleados (/c/:company_slug)
│   │   │   │   ├── employee-calendar/  # Calendario público (/c/:company_slug/e/:employee_id)
│   │   │   │   └── booking-form/    # Formulario de reserva
│   │   │   │
│   │   │   ├── auth/                # Autenticación
│   │   │   │   └── components/login/
│   │   │   │
│   │   │   ├── backoffice/          # Panel de administración (requiere login)
│   │   │   │   ├── backoffice.component.ts   # Layout principal del BO
│   │   │   │   ├── superadmin/      # Panel Superadmin (/bo/superadmin/*)
│   │   │   │   │   ├── plans/
│   │   │   │   │   └── transactions/
│   │   │   │   │
│   │   │   │   ├── employee/        # Panel Employee (/bo/employee/*)
│   │   │   │   │   ├── employee-layout.component.ts
│   │   │   │   │   └── history/     # Historial de citas
│   │   │   │   │       └── appointment-detail-dialog.component.ts
│   │   │   │   │
│   │   │   │   └── [manager]/       # Panel Manager (dashboard, citas, empleados, etc.)
│   │   │   │
│   │   │   ├── companies/           # [Legacy/Migrando] Gestión de empresas
│   │   │   ├── appointments/        # [Legacy/Migrando] Gestión de citas
│   │   │   ├── dashboard/           # [Legacy/Migrando] Dashboard
│   │   │   ├── admin/               # [Legacy/Migrando] Admin
│   │   │   ├── not-found/           # Página 404
│   │   │   └── unauthorized/        # Página 403
│   │   │
│   │   ├── shared/                  # Componentes y servicios reutilizables
│   │   │   ├── components/
│   │   │   │   ├── calendar/        # Componente de calendario reutilizable
│   │   │   │   ├── landing-header/  # Header de landing page
│   │   │   │   ├── loading-skeleton/
│   │   │   │   ├── route-loading/
│   │   │   │   └── empty-state/
│   │   │   └── services/
│   │   │       └── toast.service.ts
│   │   │
│   │   ├── app.ts                   # Componente raíz
│   │   ├── app.html                 # Template raíz
│   │   ├── app.scss                 # Estilos globales
│   │   ├── app.config.ts            # Configuración de la aplicación
│   │   └── app.routes.ts            # Rutas principales
│   │
│   ├── environments/                # Configuraciones de entorno
│   └── styles/                      # Estilos globales adicionales
│
├── angular.json
├── tailwind.config.ts
└── package.json
```

### Convenciones de Ubicación

| Tipo de archivo | Ubicación correcta | Ejemplo |
|----------------|-------------------|---------|
| Modelos/Interfaces | `core/models/` | `core/models/user.model.ts` |
| Servicios globales | `core/services/` | `core/services/auth.service.ts` |
| Guards | `core/guards/` | `core/guards/role.guard.ts` |
| Páginas de features | `features/[area]/[nombre]/` | `features/backoffice/superadmin/plans/` |
| Componentes reutilizables | `shared/components/` | `shared/components/calendar/` |
| Servicios compartidos | `shared/services/` | `shared/services/toast.service.ts` |

### Flujos de Navegación

```
1. LANDING (público, sin login)
   / → /contact → /pricing → /about → /faq

2. AUTH
   /login

3. PUBLIC BOOKING (público, sin login)
   /c/:company_slug → /c/:company_slug/e/:employee_id → booking-form

4. BACKOFFICE (requiere login)
   /bo → redirección según rol:
       - superadmin → /bo/superadmin/*
       - manager → /bo/dashboard (o ruta principal de manager)
       - employee → /bo/employee/*
```

---

## Testing - Filosofía y Prioridades

### Principio #1: Testear COMPORTAMIENTO, no implementación

Los tests deben verificar **qué hace** el componente/servicio, no **cómo** lo hace internamente. Un test orientado a comportamiento sobrevive refactorizaciones; un test acoplado a implementación se rompe con cualquier cambio interno.

### Prioridad de matchers (de mayor a menor)

| Prioridad | Matcher | Cuándo usar |
|-----------|---------|-------------|
| **1ra** | `toHaveBeenCalledWith()` y derivadas | Verificar que un método/spy fue llamado con los argumentos correctos. Cubre también `toHaveBeenCalledTimes()`, `toHaveBeenLastCalledWith()`, `toHaveBeenNthCalledWith()` |
| **2da** | Renderizado con Testing Library | Renderizar el componente con `render()` y evaluar el DOM resultante: `screen.getByText()`, `screen.getByRole()`, `screen.getByTestId()`, `screen.queryByText()`, etc. |
| **3ra** | `toBe()` / `toEqual()` | Solo para valores primitivos o comparaciones directas cuando no hay comportamiento que verificar (ej: estados simples, cálculos puros) |

### Flujo obligatorio al escribir tests

```
1. ¿Se puede verificar comportamiento con toHaveBeenCalledWith?
   → SÍ: usarlo como test principal
   → NO: pasar al paso 2

2. ¿Se puede renderizar el componente y verificar en el DOM?
   → SÍ: renderizar con Testing Library y buscar elementos
   → NO: pasar al paso 3

3. ¿Solo queda verificar un valor primitivo?
   → Usar toBe() / toEqual()
```

### Ejemplos

**✅ CORRECTO - Comportamiento con spies:**
```typescript
it('debe llamar al servicio al enviar el formulario', () => {
  const spy = jest.spyOn(appointmentService, 'create');
  component.onSubmit();
  expect(spy).toHaveBeenCalledWith({ date: '2025-01-01', employeeId: 1 });
});
```

**✅ CORRECTO - Renderizado con Testing Library:**
```typescript
it('debe mostrar el nombre del usuario en el header', async () => {
  await render(EmployeeCard, {
    componentInputs: { employee: mockEmployee },
  });
  expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
});
```

**❌ INCORRECTO - Testear estado interno sin comportamiento:**
```typescript
it('debe tener loading en false', () => {
  expect(component.loading()).toBe(false); // Acoplado a implementación
});
```

**✅ CORRECTO - Verificar comportamiento derivado del estado:**
```typescript
it('no debe mostrar spinner cuando no está cargando', async () => {
  await render(MyComponent);
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});
```

### Testing Library - Configuración y uso

- Usar `@analogjs/testing` con `render()` para componentes Angular
- Priorizar queries accesibles: `getByRole()`, `getByText()`, `getByLabelText()`
- Usar `getByTestId()` solo como último recurso
- Evaluar interacciones del usuario con `fireEvent` o `userEvent`

---

*Estas reglas aplican SOLO al proyecto CitasYa*
