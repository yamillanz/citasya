# CitasYa - Reglas Específicas del Proyecto

**IMPORTANT** the folder of the project ins ./app-web

---

## OpenSpec - FLUJO OBLIGATORIO PARA TODOS LOS CAMBIOS

**⚠️ IMPORTANTE: TODO cambio debe seguir el flujo OpenSpec sin excepción.**

### Comandos disponibles:
- `/opsx:new` - Iniciar nueva tarea/cambio
- `/opsx:ff` - Fast-forward para crear todos los artifacts de un cambio
- `/opsx:apply` - Aplicar tareas desde el change
- `/opsx:verify` - Verificar que la implementación coincide con los artifacts
- `/opsx:archive` - Archivar cambio completado

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
- Comandos completos en `app-web/README.md`
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

## Esquema de Colores (Verde Salvia)

| Color | Código Hex | Uso |
|-------|------------|-----|
| **Verde Salvia** | `#9DC183` | Primary color, botones principales |
| **Gris Cálido** | `#5D6D7E` | Texto secundario, bordes |
| **Blanco Puro** | `#FFFFFF` | Fondos |

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

*Estas reglas aplican SOLO al proyecto CitasYa*
