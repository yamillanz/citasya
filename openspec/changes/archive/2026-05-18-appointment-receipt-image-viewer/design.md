# Design: Visor de Imágenes para Comprobantes

## Architecture Decisions

### Decision 1: Usar `p-dialog` de PrimeNG en lugar de `<a target="_blank">`
**Chosen**: Reemplazar los enlaces externos por un `p-dialog` integrado en cada componente.
**Rationale**: Mejora la UX al mantener al usuario dentro de la aplicación. PrimeNG ya es la librería de UI del proyecto y `p-dialog` está disponible sin agregar dependencias.
**Alternative considered**: Abrir en nueva pestaña con `<a>` — descartado porque el usuario reportó que "no hace nada" y no proporciona buena UX.

### Decision 2: Usar signals para estado del visor
**Chosen**: `selectedImageUrl = signal<string | null>(null)` y `showImageDialog = signal(false)`
**Rationale**: Consistente con el patrón de signals del proyecto. Permite reactividad con OnPush.
**Alternative considered**: Variables simples — descartado porque rompe la reactividad con OnPush.

### Decision 3: Elemento clickeable con cursor pointer
**Chosen**: Usar `<button>` o `<span>` con `cursor: pointer` y `(click)` handler.
**Rationale**: Los `<a>` sin `href` válido no son semánticamente correctos. Un `<button>` es más accesible, pero dado el diseño actual (iconos pequeños en línea), un `<span>` con `role="button"`, `tabindex="0"` y estilos de pointer puede ser más fácil de integrar visualmente.
**Alternative considered**: Mantener `<a>` y agregar `javascript:void(0)` — descartado por ser un anti-patrón.

## Data Flow

```
Usuario hace clic en icono de comprobante
  ↓
openImageViewer(url) se ejecuta
  ↓
selectedImageUrl.set(url)
showImageDialog.set(true)
  ↓
Template reactivo (OnPush) renderiza p-dialog visible
  ↓
p-dialog muestra <img [src]="selectedImageUrl()">
  ↓
Usuario cierra diálogo
  ↓
onHide → selectedImageUrl.set(null), showImageDialog.set(false)
```

## File Changes

| File | Action | Purpose |
|------|--------|---------|
| `appointments.component.ts` | modified | Agregar signals `selectedImageUrl`, `showImageDialog` y método `openImageViewer` |
| `appointments.component.html` | modified | Reemplazar `<a>` por elementos clickeables; agregar `<p-dialog>` para visor de imagen |
| `appointments.component.scss` | modified | Agregar `cursor: pointer` a `.receipt-link`; mantener estilos hover existentes |
| `employee-detail-dialog.component.ts` | modified | Agregar signals y método `openImageViewer` |
| `employee-detail-dialog.component.html` | modified | Reemplazar `<a>` por elementos clickeables; agregar `<p-dialog>` para visor |
| `employee-detail-dialog.component.scss` | modified | Agregar `cursor: pointer` a `.receipt-link` |
| `appointments.component.spec.ts` | modified | Agregar tests de renderizado para verificar que el clic abre el diálogo |
| `employee-detail-dialog.component.spec.ts` | modified | Actualizar tests existentes de receipt links para usar el nuevo comportamiento |

## Component Integration

### AppointmentsComponent
```typescript
// Nuevas propiedades
selectedImageUrl = signal<string | null>(null);
showImageDialog = signal(false);

// Nuevo método
openImageViewer(url: string): void {
  this.selectedImageUrl.set(url);
  this.showImageDialog.set(true);
}

closeImageViewer(): void {
  this.selectedImageDialog.set(false);
  this.selectedImageUrl.set(null);
}
```

### EmployeeDetailDialogComponent
```typescript
// Mismas propiedades y métodos que AppointmentsComponent
```

## Template Pattern

```html
<!-- Elemento clickeable -->
<span
  class="receipt-link"
  role="button"
  tabindex="0"
  title="Ver comprobante"
  (click)="openImageViewer(apt.receipt_url!)"
  (keydown.enter)="openImageViewer(apt.receipt_url!)"
>
  <i class="pi pi-paperclip"></i>
</span>

<!-- Diálogo de imagen -->
<p-dialog
  [visible]="showImageDialog()"
  (onHide)="closeImageViewer()"
  [modal]="true"
  [draggable]="false"
  [resizable]="false"
  [style]="{ width: 'auto', maxWidth: '90vw' }"
  header="Comprobante"
>
  @if (selectedImageUrl()) {
    <img [src]="selectedImageUrl()" alt="Comprobante" style="max-width: 100%; display: block;">
  }
</p-dialog>
```

## Styling Notes

- `.receipt-link` debe tener `cursor: pointer` explícito
- Mantener los estilos hover existentes (fondo verde salvia, color oscuro)
- El `p-dialog` debe renderizarse en el body (comportamiento por defecto de PrimeNG), por lo que los estilos del diálogo en sí no requieren `::ng-deep` en el componente. Sin embargo, si se necesita estilizar el header o contenido específicamente, esos overrides deben ir en `styles.scss` según las reglas del proyecto.
