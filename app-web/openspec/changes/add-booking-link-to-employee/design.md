## Context

El sistema CitasYa permite que los empleados gestionen sus citas a través de un backoffice (`/emp`). Actualmente, el empleado puede ver su calendario y historial, pero no tiene forma de acceder a su enlace público de reserva (`/c/<companySlug>/e/<employeeId>/book`). Este enlace es necesario para que los clientes puedan reservar citas con el empleado.

La solución debe ser mobile-first, ya que la mayoría de los usuarios accederán desde dispositivos móviles. El diseño actual del employee layout incluye:
- **Desktop**: Sidebar fijo a la izquierda (260px) con navegación vertical
- **Mobile (< 1024px)**: Header sticky con logo y botón de menú hamburguesa, navegación en drawer lateral

## Goals / Non-Goals

**Goals:**
- Proveer acceso rápido al enlace de reserva pública con un solo click
- Implementar un acceso desktop: botón en el header del componente `EmployeeCalendarComponent`
- Implementar un acceso mobile: FAB (Floating Action Button) en el layout, visible solo en móviles
- Copiar el enlace al portapapeles al hacer click
- Mostrar confirmación visual al usuario (toast)

**Non-Goals:**
- No se implementará generación de códigos QR del enlace
- No se implementará compartir directo por WhatsApp/email (solo copiar al portapapeles)
- No se creará una página de "mis enlaces" con múltiples links
- No se modificará la lógica de autenticación o autorización

## Decisions

### 1. Ubicación del botón en desktop

**Decisión**: Header del `EmployeeCalendarComponent` (vista principal)

**Alternativas consideradas**:
- *Sidebar navigation*: Menos prominente, requiere navegación adicional
- *Footer del sidebar*: No es una ubicación común para acciones principales
- *FAB global*: Demasiado intrusivo en desktop

**Razón**: El calendario es la vista principal del empleado. Contextualmente es el lugar ideal: "veo mis citas → comparto mi link". Un solo click desde la vista por defecto.

### 2. Ubicación del botón en mobile

**Decisión**: FAB (Floating Action Button) en esquina inferior derecha

**Alternativas consideradas**:
- *Botón en el header*: Ocupa espacio limitado en mobile
- *Opción en el menú hamburguesa*: Requiere 2 clicks (abrir menú → click enlace)
- *Botón en el footer del móvil*: No es un patrón común en apps modernas

**Razón**: El FAB es un patrón mobile-first exitoso usado por WhatsApp, Gmail y muchas apps. Siempre visible, un solo click, no interfiere con el contenido.

### 3. Comportamiento al hacer click

**Decisión**: Copiar al portapapeles + mostrar toast de confirmación

**Alternativas consideradas**:
- *Abrir el enlace en una nueva pestaña*: No tiene sentido, el empleado quiere compartirlo
- *Mostrar un modal con el enlace*: Paso adicional innecesario
- *Mostrar un QR code*: Complejiza la implementación inicial

**Razón**: Copiar al portapapeles es la acción más directa y universal. El usuario puede luego pegar el enlace donde quiera (WhatsApp, email, SMS). El toast confirma la acción exitosa.

### 4. Implementación técnica

**Decisión**: Usar Angular CDK Clipboard API (`@angular/cdk/clipboard`)

**Alternativas consideradas**:
- *Navigator.clipboard.writeText()*: No disponible en todos los navegadores, requiere HTTPS
- *Document.execCommand('copy')*: Deprecated en navegadores modernos
- *Librería externa (ngx-clipboard)*: Agrega dependencia innecesaria

**Razón**: Angular CDK Clipboard es la solución oficial de Angular, soporta todos los navegadores y está mantenida por el equipo de Angular.

## Risks / Trade-offs

### Riesgo: Usuario no entiende qué hace el botón

**Mitigación**: 
- Iconografía clara: letra "C" (de "CitasYa") o icono de link
- Tooltip con texto descriptivo: "Copiar enlace de reserva"
- Toast de confirmación: "Enlace copiado al portapapeles"

### Riesgo: FAB interfiere con contenido en mobile

**Mitigación**:
- Posicionar en	esquina inferior derecha con z-index alto
- Usar sombra suave para destacar sin ser intrusivo
- Considerar auto-ocultar al hacer scroll (opción futura)

### Trade-off: Dos implementaciones distintas (desktop vs mobile)

**Consideración**: 
- Mantener consistencia en la acción (copiar link)
- Ambas implementaciones comparten la misma lógica de negocio
- El FAB solo se muestra en mobile (< 1024px)
- El botón en header se muestra siempre (desktop y mobile)

**Decisión**: Aceptar el trade-off porque mejora UX en cada plataforma. La lógica de negocio es la misma.