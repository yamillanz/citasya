# Delta Spec: Dialog Plan Select — Fix Overflow

## Context

En el panel de superadministrador, al abrir el dialog "Editar Empresa", el campo Plan usa un `p-select` de PrimeNG. El dropdown de este select se abre hacia abajo por defecto, pero al estar cerca del borde inferior del dialog, el overlay queda cortado por el `overflow` del contenedor del dialog. Esto impide ver y seleccionar las opciones del plan.

---

## ADDED Requirements

### REQ-DIALOG-PLAN-001: appendTo body en p-select de Plan
- **SHALL** el `p-select` del campo Plan en el dialog de empresa tener el atributo `[appendTo]="'body'"`.
- **SHALL** el dropdown del plan renderizarse fuera del dialog, como hijo del `<body>`.
- **Scenario**: Given el dialog "Editar Empresa" abierto, When el usuario hace click en el select de Plan, Then el dropdown se abre completamente visible sin cortes.

---

## MODIFIED Requirements

Ninguno — este es un fix de un único atributo en el template.

---

## REMOVED Requirements

Ninguno.
