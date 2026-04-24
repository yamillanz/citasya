## REMOVED Requirements

### Requirement: Display Location Information
**Reason**: El producto es SaaS sin ubicación física relevante. Mostrar "Ciudad de México, México" es información ficticia que confunde a los usuarios.
**Migration**: Remover item de ubicación de la info list y la sección de mapa decorativo completa.

### Requirement: Decorative Map Section
**Reason**: Añade clutter visual sin aportar valor funcional. El mapa es un placeholder estático sin datos reales.
**Migration**: Eliminar la sección `.map-section` completa del template y su SCSS asociado.
