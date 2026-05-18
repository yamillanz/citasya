# appointment Specification

## Purpose
TBD - created by archiving change appointment-receipt-image-viewer. Update Purpose after archive.
## Requirements
### Requirement: REQ-001 — Icono de comprobante de cita debe abrir visor de imagen
**SHALL** Cuando el usuario hace clic en el icono de comprobante de cita (`pi-paperclip`) en la lista de appointments, el sistema debe mostrar un diálogo modal (`p-dialog`) con la imagen del comprobante.

#### Scenario: Appointment con receipt_url
- **Given** una cita con `receipt_url = "https://example.com/receipt.jpg"`
- **When** el manager hace clic en el icono de paperclip
- **Then** se muestra un `p-dialog` con la imagen cargada desde esa URL

#### Scenario: Appointment sin receipt_url
- **Given** una cita sin `receipt_url`
- **Then** el icono de paperclip no debe renderizarse

### Requirement: REQ-002 — Icono de comprobante de pago debe abrir visor de imagen
**SHALL** Cuando el usuario hace clic en el icono de comprobante de pago (`pi-image`) en la lista de appointments, el sistema debe mostrar un diálogo modal con la imagen del comprobante de pago.

#### Scenario: Appointment con payment_receipt_url
- **Given** una cita con `payment_receipt_url = "https://example.com/payment.jpg"`
- **When** el manager hace clic en el icono de imagen
- **Then** se muestra un `p-dialog` con la imagen cargada desde esa URL

#### Scenario: Appointment sin payment_receipt_url
- **Given** una cita sin `payment_receipt_url`
- **Then** el icono de imagen no debe renderizarse

### Requirement: REQ-003 — Icono de comprobante en reporte de empleado debe abrir visor
**SHALL** En el diálogo de detalle de empleado (`employee-detail-dialog`), cuando el usuario hace clic en el icono de comprobante de pago en la tabla, debe abrirse el visor de imagen integrado.

#### Scenario: Fila con payment_receipt_url
- **Given** una fila del reporte con `payment_receipt_url`
- **When** el usuario hace clic en el icono
- **Then** se muestra un `p-dialog` con la imagen

#### Scenario: Fila sin payment_receipt_url
- **Given** una fila sin `payment_receipt_url`
- **Then** se muestra el texto "—" y no hay icono clickeable

### Requirement: REQ-004 — Feedback visual de interactividad
**SHALL** Los iconos de comprobante deben mostrar `cursor: pointer` al pasar el mouse, y deben tener un estado hover visible (cambio de color o fondo).

#### Scenario: Hover sobre icono
- **When** el usuario pasa el mouse sobre un icono de comprobante
- **Then** el cursor cambia a pointer
- **And** el fondo/color del icono cambia para indicar interactividad

### Requirement: REQ-005 — Diálogo de imagen reutilizable
**SHALL** El diálogo de visualización de imagen debe ser controlado por signals y debe permitir cerrarse con el botón de cierre de PrimeNG o haciendo clic fuera (configurable).

#### Scenario: Cierre del diálogo
- **Given** el diálogo de imagen está abierto
- **When** el usuario hace clic en el botón de cierre o fuera del diálogo
- **Then** el diálogo se cierra
- **And** la URL de la imagen se limpia

---

