# Design: Employee percentage field

## Context

El formulario de servicios现有的 tiene: name, duration_minutes, price. Falta commission_percentage que ya existe en la BD.

## Goals / Non-Goals

**Goals:**
- Agregar campo commission_percentage al formulario
- Default 50%, rango 0-100
- Mostrar en preview card

**Non-Goals:**
- Cambios en el cálculo de comisiones (solo UI)

## Decisions

1. **Input component**: Usar p-inputNumber con mode="percent" y suffix="%"
2. **Posición**: Después del campo price
3. **Validación**:Validators.min(0) y Validators.max(100)

## Implementation

### service-form.component.ts
```typescript
form = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(2)]],
  duration_minutes: [30, [Validators.required, Validators.min(5)]],
  price: [null as number | null],
  commission_percentage: [50, [Validators.min(0), Validators.max(100)]]  // NEW
});
```

### service-form.component.html
- Agregar formField para commission_percentage después de price
- Mostrar en preview card

### onSubmit()
- Incluir commission_percentage en el payload

### loadService()
- Cargar commission_percentage desde el servicio existente