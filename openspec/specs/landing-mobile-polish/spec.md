# landing-mobile-polish Specification

## Purpose
TBD - created by archiving change fix-landing-mobile-issues. Update Purpose after archive.
## Requirements
### Requirement: Header mobile MUST have horizontal padding
El sistema MUST garantizar que el logo del header no esté pegado al borde de la pantalla en dispositivos móviles.

#### Scenario: Usuario ve el header en mobile
- **WHEN** el usuario accede a la landing page desde un dispositivo móvil (viewport < 1024px)
- **THEN** el logo del header tiene al menos 16px de margen/padding desde el borde izquierdo de la pantalla

### Requirement: Mobile drawer MUST be proportioned and usable
El sistema MUST presentar el menú drawer móvil con tamaños de texto y elementos proporcionados a la pantalla.

#### Scenario: Usuario abre el menú hamburguesa
- **WHEN** el usuario hace click en el botón de menú hamburguesa en mobile
- **THEN** el drawer muestra un header visible con título/logo, enlaces de navegación con tamaño de texto no mayor a 1rem, y botones de auth con altura proporcionada

### Requirement: Hero headline MUST NOT use gradient text
El sistema MUST renderizar el texto de énfasis del headline hero con un color sólido, sin gradientes.

#### Scenario: Usuario ve el hero en la landing page
- **WHEN** la página carga la sección hero
- **THEN** el texto "desde un solo lugar" se muestra en un color sólido, sin efecto de gradiente

### Requirement: Mock appointments MUST NOT use side-stripe borders
El sistema MUST presentar los items de citas de ejemplo sin usar bordes laterales gruesos como acento.

#### Scenario: Usuario ve el mockup del calendario
- **WHEN** la página muestra el panel de citas de demostración
- **THEN** los items de citas no utilizan `border-left` mayor a 1px como indicador visual

### Requirement: Nav-link hover animation MUST use transform
El sistema MUST animar el indicador de hover de los enlaces de navegación usando transform en lugar de width.

#### Scenario: Usuario hace hover en un nav-link
- **WHEN** el usuario posiciona el cursor sobre un enlace de navegación
- **THEN** la línea de acento aparece mediante una animación de `transform: scaleX()` sin causar layout thrash

