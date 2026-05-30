## Context

El componente `p-checkbox` de PrimeNG no renderiza correctamente el atributo `label` como texto visible. En el proyecto, el patrón establecido es usar un `<label>` HTML separado o envolver el checkbox en un `<label>` con un `<span>` para el texto.

## Goals / Non-Goals

**Goals:**
- Hacer visible el texto "Puede actuar como empleado" junto al checkbox en el diálogo de usuario.

**Non-Goals:**
- Modificar otros checkboxes del sistema.

## Decisions

**1. Usar `<label for="id">` separado del `<p-checkbox>`**
- **Rationale**: Es el patrón más estándar de HTML accesible y se alinea con el resto del proyecto donde se usa `inputId` + `<label for>`.

## Risks / Trade-offs

- Ninguno — cambio mínimo de markup.
