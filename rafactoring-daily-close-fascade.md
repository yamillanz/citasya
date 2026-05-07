# Refactoring: DailyClose Facade - Computed Signals a Métodos Privados

## TL;DR

Convertir los 7 computed signals complejos de `DailyCloseFacade` en métodos privados + 2 funciones puras standalone. Se mantiene `computed()` como wrapper para preservar memoización. Se agregan tests unitarios para las funciones puras extraídas. Los 40+ tests existentes no requieren cambios.

---

## Proposal

**Intent**: Los computed signals actuales tienen lógica compleja anidada dentro de `computed()`, lo que dificulta lectura, testing unitario y reutilización. Convertirlos a métodos privados mejora legibilidad y permite testear la lógica de forma aislada.

**Scope**
- **In**: Refactorizar 7 computed signals en `daily-close.facade.ts`, extraer 2 funciones puras de cálculo de stats, optimizar `dayStats` de 3 pasadas a 1 pasada, agregar tests para funciones puras
- **Out**: Cambios en template, componente (más allá de referencias), servicios

**Approach**: Cada computed signal se convierte en un método privado. Las funciones de cálculo puro se extraen como funciones standalone fuera de la clase (SRP + testeabilidad sin TestBed). Se mantiene `computed()` como wrapper para memoización.

---

## Specs (Delta Specs)

### MODIFIED Requirements

- **Computed signals → Private methods**: Todos los computed signals de derivación de datos SHALL ser convertidos a métodos privados que retornan el mismo tipo de dato, manteniendo `computed()` como wrapper
  - Previously: `readonly employees = computed(() => { /* lógica inline */ })`
  - Now: `readonly employees = computed(() => this.#buildEmployees())` con `#buildEmployees()` como método privado

### ADDED Requirements

- **Pure functions extraction**: `calculateEmployeeStats` y `calculateDayStats` SHALL ser funciones puras standalone fuera de la clase
  - Scenario: Given array vacío, When `calculateDayStats([])`, Then retorna `{ totalAmount: 0, totalAppointments: 0, completedCount: 0, pendingCount: 0 }`
  - Scenario: Given 2 completadas + 1 pending, When `calculateDayStats(apps)`, Then `completedCount: 2, pendingCount: 1, totalAmount: suma`
- **Single-pass dayStats**: `calculateDayStats` SHALL iterar el array una sola vez (actualmente: reduce + 2 filters = 3 pasadas)
- **Inmutabilidad en employeeStats**: Las funciones puras SHALL crear nuevos objetos en vez de mutar objetos existentes dentro del Map
- **Unit tests for pure functions**: SHALL existir tests dedicados para `calculateEmployeeStats` y `calculateDayStats` sin `TestBed` ni mocks
- **Placement order**: Cada método privado SHALL colocarse debajo de la variable de estado que consume

---

## Design Decisions

| Decisión | Elegido | Descartado | Razón |
|----------|---------|------------|-------|
| Wrapper computed | Mantener `computed(() => this.#method())` | Eliminar computed por completo | Preserva memoización de Angular (crítico para templates que llaman `dayStats()` 4+ veces) |
| Funciones de stats | Funciones puras fuera de la clase | Métodos privados | No tienen estado ni dependen de `this` → SRP + testeabilidad sin TestBed |
| Métodos simples | Métodos privados con `#` | Funciones puras | Dependen de múltiples signals (`_selectedDate`, `_selectedEmployee`) |
| Tests existentes | Sin cambios | Reescribir | API pública no cambia → 0 tests rotos |

---

## Estructura Resultante
daily-close.facade.ts
├── Imports
├── Interfaces (Employee, EmployeeStats, DayStats, AppointmentWithRelations)
│
├── Pure Functions (fuera de la clase):
│   ├── calculateEmployeeStats(appointments): Map<string, EmployeeStats>
│   └── calculateDayStats(appointments): DayStats
│
└── @Injectable() class DailyCloseFacade
    ├── Dependencies (inject)
    ├── State signals (_appointments, _selectedDate, _selectedEmployee, etc.)
    ├── Public readonly signals (asReadonly)
    │
    ├── Computed signals (wrappers):
    │   ├── employees → computed(() => this.#buildEmployees())
    │   ├── filteredAppointments → computed(() => this.#buildFilteredAppointments())
    │   ├── employeeStats → computed(() => calculateEmployeeStats(this._appointments()))
    │   ├── dayStats → computed(() => calculateDayStats(this._appointments()))
    │   ├── completedAppointments → computed(() => this.#getCompletedAppointments())
    │   ├── canNavigateNext → computed(() => this.#checkCanNavigateNext())
    │   └── isToday → computed(() => this.#checkIsToday())
    │
    ├── Private methods (debajo de las variables que consumen):
    │   ├── #buildEmployees()
    │   ├── #buildFilteredAppointments()
    │   ├── #getCompletedAppointments()
    │   ├── #checkCanNavigateNext()
    │   └── #checkIsToday()
    │
    └── Public methods (initialize, loadAppointments, navigate, etc.)


---

## Análisis de Impacto en Tests

### Tests existentes: SIN CAMBIOS (40+ tests)

Todos los tests prueban la API pública (signals), no la implementación interna. Como `computed()` se mantiene como wrapper, la API no cambia.

| Test Suite | Signals probados | Tests | ¿Cambia? |
|---|---|---|---|
| `Initialization` | `loading()`, `appointments()`, `companyId()` | 5 | ❌ No |
| `Appointments Loading` | `appointments()`, `alreadyClosed()` | 5 | ❌ No |
| `Employee Management` | `employees()`, `filteredAppointments()` | 6 | ❌ No |
| `Statistics Calculation` | `dayStats()`, `getEmployeeStats()`, `completedAppointments()` | 4 | ❌ No |
| `Date Navigation` | `isToday()`, `canNavigateNext()`, `selectedDate()` | 6 | ❌ No |
| `Appointment Actions` | `appointments()` (estado) | 10 | ❌ No |
| `Generate Daily Close` | `generating()`, `alreadyClosed()` | 4 | ❌ No |
| `Helper Methods` | Métodos auxiliares | 8 | ❌ No |
| `Edge Cases` | `employees()`, `dayStats()` | 4 | ❌ No |

### Tests nuevos: AGREGAR (8+ tests)

Funciones puras testeables sin `TestBed`, sin mocks, ultra-rápidos:

| Test | Qué prueba |
|---|---|
| `calculateDayStats` - empty array | Retorna todos los valores en 0 |
| `calculateDayStats` - solo completadas | Suma amounts correctamente |
| `calculateDayStats` - mix de estados | completedCount, pendingCount, totalAmount correctos |
| `calculateDayStats` - amount undefined | Trata undefined como 0 |
| `calculateEmployeeStats` - empty array | Retorna Map vacío |
| `calculateEmployeeStats` - 1 empleado | Stats correctas para 1 empleado |
| `calculateEmployeeStats` - múltiples empleados | Stats separadas por empleado |
| `calculateEmployeeStats` - amount undefined | Trata undefined como 0 |

---

## Tasks

### Fase 1: Extraer funciones puras + agregar sus tests

1. Crear `calculateEmployeeStats(appointments: AppointmentWithRelations[]): Map<string, EmployeeStats>` fuera de la clase
   - Single-pass con `for...of`
   - Inmutabilidad: crear nuevos objetos `EmployeeStats` en vez de mutar
   - Colocar entre interfaces y la clase `@Injectable()`

2. Crear `calculateDayStats(appointments: AppointmentWithRelations[]): DayStats` fuera de la clase
   - Single-pass con `for...of` (actualmente: reduce + 2 filters = 3 pasadas)
   - Colocar junto a `calculateEmployeeStats`

3. Agregar `describe('Pure Functions')` en `daily-close.facade.spec.ts` (ANTES del describe principal)
   - Tests para `calculateDayStats`: empty, solo completadas, mix, undefined amounts
   - Tests para `calculateEmployeeStats`: empty, 1 empleado, múltiples, undefined amounts

### Fase 2: Convertir computed signals a métodos privados

4. `employees` → crear `#buildEmployees(): Employee[]` debajo de `_appointments`
   - Actualizar: `readonly employees = computed(() => this.#buildEmployees())`

5. `filteredAppointments` → crear `#buildFilteredAppointments(): AppointmentWithRelations[]` debajo de `_selectedEmployee`
   - Actualizar: `readonly filteredAppointments = computed(() => this.#buildFilteredAppointments())`

6. `employeeStats` → actualizar computed para usar función pura
   - Actualizar: `readonly employeeStats = computed(() => calculateEmployeeStats(this._appointments()))`

7. `dayStats` → actualizar computed para usar función pura
   - Actualizar: `readonly dayStats = computed(() => calculateDayStats(this._appointments()))`

8. `completedAppointments` → crear `#getCompletedAppointments(): AppointmentWithRelations[]` debajo de `_appointments`
   - Actualizar: `readonly completedAppointments = computed(() => this.#getCompletedAppointments())`

9. `canNavigateNext` → crear `#checkCanNavigateNext(): boolean` debajo de `_selectedDate`
   - Actualizar: `readonly canNavigateNext = computed(() => this.#checkCanNavigateNext())`

10. `isToday` → crear `#checkIsToday(): boolean` debajo de `_selectedDate`
    - Actualizar: `readonly isToday = computed(() => this.#checkIsToday())`

### Fase 3: Verificación

11. Ejecutar `cd app-web && ng build` → verificar compilación sin errores
12. Ejecutar `cd app-web && ng test --include='**/daily-close.facade.spec.ts'` → todos los tests existentes deben pasar
13. Verificar que los nuevos tests de funciones puras pasan
14. Verificación manual: navegar a `/bo/daily-close` y confirmar:
    - Stats del día se muestran correctamente
    - Stats por empleado se muestran correctamente
    - Filtrado por empleado funciona
    - Navegación de fechas funciona (canNavigateNext, isToday)
    - Generación de PDF funciona (usa completedAppointments)

---

## File Inventory

| File | Action | Purpose |
|------|--------|---------|
| `app-web/src/app/features/backoffice/manager/daily-close/daily-close.facade.ts` | modified | Extraer 2 funciones puras, convertir 7 computed a métodos privados |
| `app-web/src/app/features/backoffice/manager/daily-close/daily-close.facade.spec.ts` | modified | Agregar `describe('Pure Functions')` con 8+ tests |

---

## Ejemplo: Estructura de tests nuevos

```typescript
// daily-close.facade.spec.ts - ANTES del describe('DailyCloseFacade') principal

import { calculateDayStats, calculateEmployeeStats } from './daily-close.facade';

describe('Pure Functions', () => {
  describe('calculateDayStats', () => {
    it('should return zeros for empty array', () => {
      const stats = calculateDayStats([]);
      expect(stats.totalAppointments).toBe(0);
      expect(stats.totalAmount).toBe(0);
      expect(stats.completedCount).toBe(0);
      expect(stats.pendingCount).toBe(0);
    });

    it('should calculate stats with single pass for mixed appointments', () => {
      const apps = [
        createMockAppointment({ status: 'completed', amount_collected: 25 }),
        createMockAppointment({ status: 'completed', amount_collected: 50 }),
        createMockAppointment({ status: 'pending' }),
      ];
      const stats = calculateDayStats(apps);
      expect(stats.totalAppointments).toBe(3);
      expect(stats.completedCount).toBe(2);
      expect(stats.pendingCount).toBe(1);
      expect(stats.totalAmount).toBe(75);
    });

    it('should treat undefined amount_collected as 0', () => {
      const apps = [
        createMockAppointment({ status: 'completed', amount_collected: undefined }),
      ];
      const stats = calculateDayStats(apps);
      expect(stats.totalAmount).toBe(0);
    });
  });

  describe('calculateEmployeeStats', () => {
    it('should return empty map for empty array', () => {
      const stats = calculateEmployeeStats([]);
      expect(stats.size).toBe(0);
    });

    it('should calculate stats per employee', () => {
      const apps = [
        createMockAppointment({ employee_id: 'emp-1', status: 'completed', amount_collected: 25 }),
        createMockAppointment({ employee_id: 'emp-2', status: 'completed', amount_collected: 50 }),
        createMockAppointment({ employee_id: 'emp-1', status: 'pending' }),
      ];
      const stats = calculateEmployeeStats(apps);
      expect(stats.size).toBe(2);
      expect(stats.get('emp-1')?.totalAppointments).toBe(2);
      expect(stats.get('emp-1')?.totalAmount).toBe(25);
      expect(stats.get('emp-2')?.totalAmount).toBe(50);
    });
  });
});
``` 

# Commands Verifications

# Build
cd app-web && ng build

# Tests (todos los existentes + nuevos)
cd app-web && ng test --include='**/daily-close.facade.spec.ts'

# Manual check
# Navegar a http://localhost:4200/bo/daily-close y verificar:
# - Stats del día correctas
# - Stats por empleado correctas
# - Filtrado por empleado funciona
# - Navegación de fechas funciona
# - Generación de PDF funciona
