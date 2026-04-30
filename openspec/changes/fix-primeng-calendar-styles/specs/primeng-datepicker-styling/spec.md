## ADDED Requirements

### Requirement: Estilos globales del DatePicker de PrimeNG
El sistema DEBE aplicar estilos globales en `styles.scss` para que todos los componentes `p-datepicker` de PrimeNG v20 se rendericen con la paleta de colores y diseño visual de CitasYa.

#### Scenario: Panel del calendario con estilos de marca
- **WHEN** el usuario abre el calendario desplegable de un `p-datepicker`
- **THEN** el panel DEBE tener fondo blanco (`--color-warm-white`), borde (`--color-border`), border-radius (`--radius-lg`) y sombra (`--shadow-lg`)

#### Scenario: Header del calendario estilizado
- **WHEN** el calendario está abierto
- **THEN** el header DEBE tener fondo `--color-linen`, borde inferior `--color-border`, y los botones de navegación DEBEN tener hover con `--color-sage-pale` y color `--color-sage-dark`
- **THEN** el título del mes/año DEBE usar la tipografía de display y color `--color-text-primary`

#### Scenario: Días del calendario estilizados
- **WHEN** el calendario muestra los días del mes
- **THEN** los días DEBEN tener color `--color-text-primary`
- **THEN** los días de otros meses DEBEN tener color `--color-text-muted`
- **THEN** el hover sobre un día DEBE mostrar fondo `--color-sage-pale`

#### Scenario: Día seleccionado con color de marca
- **WHEN** el usuario selecciona un día en el calendario
- **THEN** el día seleccionado DEBE tener fondo `--color-sage` y texto blanco
- **THEN** el día de hoy DEBE tener un indicador visual distintivo con color `--color-sage-dark`

#### Scenario: Input del datepicker estilizado
- **WHEN** se renderiza el input de un `p-datepicker`
- **THEN** el input DEBE tener los mismos estilos que los demás inputs de PrimeNG en la aplicación (bordes, focus, placeholder)

#### Scenario: Button bar estilizado
- **WHEN** el calendario tiene `[showButtonBar]="true"`
- **THEN** los botones "Today" y "Clear" DEBEN tener estilos consistentes con los botones de la aplicación

#### Scenario: Días de la semana estilizados
- **WHEN** el calendario muestra los encabezados de días de la semana
- **THEN** los encabezados DEBEN tener color `--color-text-secondary`, fuente en mayúsculas, y peso 600
