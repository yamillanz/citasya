## Why

Los componentes `p-datepicker` de PrimeNG v20 se renderizan sin los estilos de marca de la aplicación CitasYa. El calendario desplegable muestra colores genéricos de PrimeNG en lugar de la paleta Verde Salvia definida en los design tokens del proyecto. Esto rompe la consistencia visual en todas las pantallas que usan selección de fechas (Cierre Diario, historial, citas, etc.).

## What Changes

- Agregar y mejorar overrides de estilos globales para el componente `p-datepicker` de PrimeNG en `app-web/src/styles.scss`
- Aplicar la paleta de colores Verde Salvia (`--color-sage`, `--color-sage-dark`, `--color-sage-pale`, etc.) al calendario desplegable
- Estilizar el input del datepicker para que sea consistente con los demás inputs de la aplicación
- Estilizar el panel del calendario (header, días de la semana, días del mes, navegación)
- Estilizar los botones del button bar (Today, Clear)
- Asegurar que el día seleccionado y el día de hoy usen los colores de marca

## Capabilities

### New Capabilities
- `primeng-datepicker-styling`: Estilos globales para el componente DatePicker de PrimeNG v20 que aplican la paleta de colores y diseño de CitasYa

### Modified Capabilities
- Ninguno. Este es un fix puramente de estilos globales, no cambia requerimientos funcionales.

## Impact

- `app-web/src/styles.scss`: Se agregarán/modificarán los estilos de override para `p-datepicker`
- Afecta visualmente todos los componentes que usen `p-datepicker` o `p-calendar` en toda la aplicación
- No hay impacto en APIs, base de datos, ni lógica de negocio
