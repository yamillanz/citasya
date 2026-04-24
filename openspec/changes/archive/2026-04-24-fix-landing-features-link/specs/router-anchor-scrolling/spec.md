## ADDED Requirements

### Requirement: Router anchor scrolling habilitado
El sistema MUST permitir que los enlaces con `fragment` realicen scroll automático hacia el elemento HTML con el ID correspondiente.

#### Scenario: Navegación exitosa a sección de características
- **WHEN** el usuario hace click en el enlace "Características" del header de la landing page
- **THEN** la página realiza scroll suave hacia la sección con `id="features"`

#### Scenario: URL con fragmento carga directamente
- **WHEN** el usuario accede directamente a la URL `/#features`
- **THEN** la página realiza scroll hacia la sección con `id="features"` después de cargar
