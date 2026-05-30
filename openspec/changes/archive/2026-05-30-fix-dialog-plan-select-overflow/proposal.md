# Fix: Dropdown de Plan Cortado en Dialog de Empresa

## Intent

El dropdown del selector de Plan dentro del dialog "Editar Empresa" se corta visualmente cuando se abre. El select está posicionado cerca del borde inferior del dialog, y el overlay del dropdown queda truncado por los límites del dialog (`overflow: hidden` por defecto en PrimeNG dialogs).

El objetivo es hacer que el dropdown del plan se renderice fuera del dialog para que no sea afectado por sus límites de clipping.

## Scope

### In
- Agregar `[appendTo]="'body'"` al `p-select` del Plan en el dialog de empresa.
- Verificar que el select sigue funcionando correctamente (selección, clear, guardado).

### Out
- No modificar el comportamiento del formulario ni la lógica de guardado.
- No cambiar otros selects del proyecto (a menos que tengan el mismo bug).

## Approach

El dialog de empresa (`p-dialog`) tiene `overflow` gestionado internamente por PrimeNG. Cuando un `p-select` abre su dropdown (overlay), este se posiciona absolutamente dentro del árbol DOM. Si el ancestro más cercano con `overflow` distinto de `visible` es el propio dialog, el dropdown se corta.

La solución es usar la propiedad `appendTo="body"` de PrimeNG Select, que renderiza el overlay como hijo directo del `<body>`, escapando completamente del clipping context del dialog.

Este es un fix mínimo y seguro: un solo atributo en el template, sin cambios en la lógica TypeScript.
