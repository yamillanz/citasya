# Tasks: Visor de Imágenes para Comprobantes

## Phase 1: Modificar AppointmentsComponent (Lista de Citas)

- [x] **1.1** Agregar imports necesarios en `appointments.component.ts`
  - Importar `DialogModule` de 'primeng/dialog'
  - Agregar `DialogModule` al array `imports` del componente

- [x] **1.2** Agregar signals de estado para el visor de imágenes en `appointments.component.ts`
  - `selectedImageUrl = signal<string | null>(null)`
  - `showImageDialog = signal(false)`

- [x] **1.3** Agregar métodos `openImageViewer` y `closeImageViewer` en `appointments.component.ts`
  - `openImageViewer(url: string): void` — setea URL y abre diálogo
  - `closeImageViewer(): void` — cierra diálogo y limpia URL

- [x] **1.4** Reemplazar enlaces `<a>` por elementos clickeables en `appointments.component.html`
  - Reemplazar `<a [href]="apt.receipt_url" target="_blank">` por `<span class="receipt-link" role="button" tabindex="0" (click)="openImageViewer(apt.receipt_url!)" (keydown.enter)="openImageViewer(apt.receipt_url!)">`
  - Reemplazar `<a [href]="apt.payment_receipt_url" target="_blank">` por `<span class="receipt-link" role="button" tabindex="0" (click)="openImageViewer(apt.payment_receipt_url!)" (keydown.enter)="openImageViewer(apt.payment_receipt_url!)">`

- [x] **1.5** Agregar `p-dialog` de visor de imagen al final de `appointments.component.html`
  - Usar `[visible]="showImageDialog()"` con `(onHide)="closeImageViewer()"`
  - Mostrar `<img [src]="selectedImageUrl()">` dentro del diálogo
  - Configurar `[modal]="true"`, `[draggable]="false"`, `[resizable]="false"`

- [x] **1.6** Agregar `cursor: pointer` a `.receipt-link` en `appointments.component.scss`
  - Asegurar que el hover existente se mantenga

## Phase 2: Modificar EmployeeDetailDialogComponent (Reporte de Empleado)

- [x] **2.1** Agregar imports necesarios en `employee-detail-dialog.component.ts`
  - Verificar que `DialogModule` ya esté importado (probablemente sí, porque ya usa `p-dialog` para el diálogo principal)
  - Si no está, agregarlo

- [x] **2.2** Agregar signals de estado para el visor de imágenes en `employee-detail-dialog.component.ts`
  - `selectedImageUrl = signal<string | null>(null)`
  - `showImageDialog = signal(false)`

- [x] **2.3** Agregar métodos `openImageViewer` y `closeImageViewer` en `employee-detail-dialog.component.ts`

- [x] **2.4** Reemplazar enlace `<a>` por elemento clickeable en `employee-detail-dialog.component.html`
  - Reemplazar el `<a>` en la columna "Comprobante" por `<span>` con `(click)` handler

- [x] **2.5** Agregar `p-dialog` de visor de imagen al final de `employee-detail-dialog.component.html`
  - Mismo patrón que en appointments

- [x] **2.6** Agregar `cursor: pointer` a `.receipt-link` en `employee-detail-dialog.component.scss`

## Phase 3: Tests

- [x] **3.1** Agregar tests en `appointments.component.spec.ts`
  - Test: "debe abrir el diálogo de imagen al hacer clic en el icono de comprobante de cita"
  - Test: "debe cerrar el diálogo y limpiar la URL al cerrar"
  - Test: "debe permitir abrir el visor con diferentes URLs sin conflictos"

- [x] **3.2** Actualizar tests en `employee-detail-dialog.component.spec.ts`
  - Actualizar test existente "debe mostrar enlace de comprobante cuando payment_receipt_url existe" para verificar el elemento `span.receipt-link`
  - Agregar test: "debe abrir el visor de imagen al hacer clic en el icono de comprobante"
  - Agregar test: "debe cerrar el visor de imagen al cerrar el diálogo"

## Phase 4: Verificación

- [x] **4.1** Verificar que `ng serve` compila sin errores
- [x] **4.2** Verificar que los tests pasan: `npm test -- --testPathPatterns="appointments.component.spec|employee-detail-dialog.component.spec"`
- [x] **4.3** Verificar manualmente (si es posible) que:
  - Los iconos muestran cursor pointer al hacer hover
  - Al hacer clic se abre el diálogo con la imagen correcta
  - Al cerrar el diálogo se limpia la URL
