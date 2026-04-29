## ADDED Requirements

### Requirement: Allies page renders landing header
The Allies page SHALL include the `app-landing-header` component at the top of the page for consistent navigation.

#### Scenario: User navigates to Aliados page
- **WHEN** the user opens `/aliados`
- **THEN** the `<app-landing-header />` is visible at the top of the page
- **AND** it contains navigation links: Inicio, Características, Precios, Sobre nosotros, Contacto, Aliados
