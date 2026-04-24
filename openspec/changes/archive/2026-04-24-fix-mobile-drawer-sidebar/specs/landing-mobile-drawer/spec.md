## ADDED Requirements

### Requirement: Mobile menu MUST use a native side drawer
El sistema MUST renderizar el menú móvil como un drawer lateral que cubra toda la pantalla, no como un diálogo flotante.

#### Scenario: Usuario abre el menú hamburguesa en mobile
- **WHEN** el usuario hace click en el botón de menú hamburguesa
- **THEN** se muestra un drawer lateral que ocupa toda la altura de la pantalla, desliza desde la derecha, y tiene un backdrop oscuro que oculta el contenido de la página

#### Scenario: Drawer no deja ver contenido detrás
- **WHEN** el drawer está abierto
- **THEN** el contenido de la landing page no es visible detrás del drawer ni a los lados
