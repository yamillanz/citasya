# Refactor: DailyClose Facade - Computed Signals a Métodos Privados

## Intent
Convertir los 7 computed signals complejos de `DailyCloseFacade` en métodos privados + 2 funciones puras standalone. Se mantiene `computed()` como wrapper para preservar memoización. Se agregan tests unitarios para las funciones puras extraídas.

## Scope
- **In**: Refactorizar 7 computed signals, extraer 2 funciones puras, optimizar `dayStats` de 3 pasadas a 1 pasada, agregar tests para funciones puras
- **Out**: Cambios en template, componente, servicios

## Approach
Cada computed signal se convierte en un método privado. Las funciones de cálculo puro se extraen como funciones standalone fuera de la clase (SRP + testeabilidad sin TestBed). Se mantiene `computed()` como wrapper para memoización.