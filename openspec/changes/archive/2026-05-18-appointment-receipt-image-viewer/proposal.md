# Proposal: Visor de Imágenes para Comprobantes de Citas

## Intent
Los iconos de comprobantes (comprobante de cita y comprobante de pago) en la lista de appointments del manager actualmente se renderizan como enlaces `<a>` con `target="_blank"`, pero no responden al clic ni proporcionan feedback visual de interactividad. Este cambio transforma esos iconos en elementos clickeables que abren un visor de imagen integrado usando `p-dialog` de PrimeNG, mejorando la UX del manager al permitirle ver los comprobantes sin salir de la aplicación.

## Why
Actualmente los iconos de comprobante en la lista de citas y en el reporte de empleado se renderizan como `<a>` con `target="_blank"`, pero no responden al clic. Esto se debe a que un overlay decorativo (`.card-decoration`) con `position: absolute` en la esquina superior derecha intercepta los eventos de click en esa zona. Además, el botón de cierre del visor de imagen no funciona porque se usa el header nativo de PrimeNG en lugar del patrón del proyecto (`[closable]="false"` + header personalizado con botón X propio).

## What Changes
1. Reemplazar `<a>` por `<button>` con `(click)` handlers en `appointments.component.html` y `employee-detail-dialog.component.html`
2. Agregar `pointer-events: none` a `.card-decoration` para que no bloquee clicks
3. Agregar `position: relative; z-index: 1` a `.card-header` para que los botones estén por encima del overlay
4. Agregar `p-dialog` con header personalizado (patrón `[closable]="false"` + botón X propio) en ambos componentes
5. Agregar `cursor: pointer` a `.receipt-link`
6. Agregar tests de comportamiento para el visor de imágenes

## Scope

### In
- Reemplazar enlaces `<a>` por elementos clickeables (botones o divs con cursor pointer) en `appointments.component.html`
- Reemplazar enlaces `<a>` por elementos clickeables en `employee-detail-dialog.component.html`
- Agregar un `p-dialog` reutilizable para visualizar imágenes en ambos componentes
- Agregar cursor pointer y estados hover visibles en los iconos de comprobante
- Agregar tests que verifiquen el comportamiento del visor de imágenes

### Out
- No se modifica la lógica de carga de datos ni los modelos de appointment
- No se modifica el componente de upload de imágenes (`ImageUploadComponent`)
- No se agrega funcionalidad de descarga o zoom dentro del visor

## Approach
1. Agregar signals de estado para controlar la visibilidad del diálogo de imagen y la URL actual
2. Reemplazar los `<a>` tags por elementos `<button>` o `<span>` con `(click)` handlers que abran el diálogo
3. Agregar un `p-dialog` al final de cada template para mostrar la imagen seleccionada
4. Actualizar estilos SCSS para agregar `cursor: pointer` y mejorar feedback visual
5. Escribir tests que rendericen el componente y verifiquen que el clic en el icono abre el diálogo con la imagen correcta
