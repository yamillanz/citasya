# role-select-button-group Specification

## Purpose
TBD - created by archiving change fix-role-select-dialog-position. Update Purpose after archive.
## Requirements
### Requirement: Rol seleccionable mediante grupo de botones MUST
El sistema DEBE permitir seleccionar el rol de un usuario dentro del diálogo "Nuevo/Editar Usuario" mediante un grupo de botones/card en lugar de un dropdown tradicional, evitando problemas de posicionamiento del panel desplegable.

El grupo de botones DEBE mostrar las 3 opciones visibles simultáneamente: "Superadmin", "Manager" y "Empleado".
Cada opción DEBE presentarse como un botón/card clickable con estado visual activo para la selección actual.
Al hacer clic sobre una opción, el valor del rol en el formulario DEBE actualizarse inmediatamente.
Si se selecciona "Manager", el checkbox "Puede actuar como empleado" DEBE aparecer automáticamente.

#### Scenario: Visualización del grupo de roles
- **WHEN** el superadmin abre el diálogo "Nuevo Usuario" o "Editar Usuario"
- **THEN** el campo "Rol" muestra 3 opciones visibles simultáneamente: "Superadmin", "Manager" y "Empleado"
- **AND** cada opción se presenta como un botón/card clickable
- **AND** la opción previamente seleccionada (o "Empleado" por defecto) aparece resaltada visualmente

#### Scenario: Selección de un rol
- **WHEN** el usuario hace clic sobre una de las opciones del grupo de roles
- **THEN** la opción clickeada se marca como seleccionada (estado visual activo)
- **AND** el valor del rol en el formulario se actualiza al valor correspondiente
- **AND** si se selecciona "Manager", aparece el checkbox adicional "Puede actuar como empleado"

#### Scenario: Persistencia del rol al guardar
- **WHEN** el usuario completa el formulario y presiona "Guardar"
- **THEN** el sistema envía el rol seleccionado al backend
- **AND** el comportamiento de creación/edición de usuario no se ve alterado respecto a la funcionalidad anterior

