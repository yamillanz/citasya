## Context

La aplicación actualmente usa la marca "CitasYa" con dominio `citasya.app`. El dominio `holacitas.app` está disponible y se quiere migrar toda la marca. El cambio es puramente visual/textual — no afecta lógica de negocio, APIs, ni base de datos.

**Estado actual:**
- Logo: SVG inline con texto `CITASYA.APP` (mayúsculas, verde + gris) en 18 instancias across 10 templates
- Copy: "CitasYa" aparece en 16 lugares de texto across 7 archivos
- Favicon: Rectángulo verde redondeado con letra "C" blanca (inline SVG en index.html + favicon.ico)
- Dominio: `soporte@citasya.app` y `hola@citasya.app` en 2 archivos
- Title: "CitasYa - Gestiona tus citas profesionales" en index.html

## Goals / Non-Goals

**Goals:**
- Actualizar toda la marca visual y textual a "holacitas" (minúsculas)
- Rediseñar el favicon con un icono de calendario estilizado
- Actualizar dominio de email a `@holacitas.app`
- Mantener coherencia visual con los colores existentes (verde salvia `#9DC183`, gris cálido `#5D6D7E`)

**Non-Goals:**
- Cambios en Supabase, project ID, o URLs de API
- Cambios en DNS, hosting, o deployment
- Cambios en package.json o angular.json (ya usan "app-web" genérico)
- Refactorización de componentes o lógica de negocio
- Cambios en funcionalidad o comportamiento

## Decisions

### 1. Logo SVG — Todo minúsculas con separación de color

**Decisión:** El logo será `holacitas` (verde `#9DC183`) + `.app` (gris `#5D6D7E`), todo en minúsculas, manteniendo el patrón visual actual de dos colores.

**Rationale:** Mantiene la jerarquía visual donde el nombre de marca destaca y el TLD es secundario. Minúsculas para consistencia con la identidad de marca.

**Alternativa considerada:** Un solo color o sin `.app` — rechazado porque pierde la conexión con el dominio y la jerarquía visual.

### 2. Ajuste de viewBox y font-size

**Decisión:** "holacitas" tiene 9 letras vs "CITASYA" que tiene 7. Se ajustará el `font-size` de 24 a ~22 y se ampliará el `viewBox` width proporcionalmente donde sea necesario para evitar desbordamiento.

**Rationale:** El texto en minúsculas con 9 caracteres necesita espacio adicional. Reducir ligeramente el font-size mantiene la legibilidad sin romper el layout.

### 3. Favicon — Calendario minimalista

**Decisión:** SVG inline con rectángulo redondeado verde `#9DC183`, líneas blancas simulando un calendario (header + grid de 2x3), y un punto verde oscuro en una celda indicando "cita agendada".

**Rationale:** Comunica inmediatamente la funcionalidad del producto. Legible a 16x16px. Coherente con los colores de marca.

**SVG propuesto (inline en index.html):**
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect fill="#9DC183" rx="20" width="100" height="100"/>
  <rect fill="white" x="20" y="25" width="60" height="55" rx="6"/>
  <rect fill="#9DC183" x="20" y="25" width="60" height="14" rx="6"/>
  <rect fill="white" x="20" y="33" width="60" height="6"/>
  <circle cx="35" cy="55" r="4" fill="#9DC183"/>
  <circle cx="50" cy="55" r="4" fill="#E0E0E0"/>
  <circle cx="65" cy="55" r="4" fill="#E0E0E0"/>
  <circle cx="35" cy="68" r="4" fill="#E0E0E0"/>
  <circle cx="50" cy="68" r="4" fill="#E0E0E0"/>
  <circle cx="65" cy="68" r="4" fill="#E0E0E0"/>
</svg>
```

### 4. Copy — Todo minúsculas consistente

**Decisión:** Todas las menciones de "CitasYa" en texto de páginas se cambian a "holacitas" en minúsculas, incluso al inicio de oraciones.

**Rationale:** Consistencia con la identidad de marca. Marcas como "iphone", "netflix" usan minúsculas deliberadamente.

### 5. Documentación archivada

**Decisión:** Actualizar referencias en docs de `openspec/changes/archive/` para mantener consistencia histórica, pero marcar como cambios cosméticos.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Logo desborda en contenedores pequeños (mobile sidebar) | Ajustar viewBox y font-size; verificar en viewport 320px |
| Favicon no legible a 16x16px | Probar en Chrome/Firefox; simplificar si es necesario |
| Texto en minúsculas pierde énfasis al inicio de oración | Aceptar como trade-off de marca; es intencional |
| `favicon.ico` binario no se regenera automáticamente | Generar manualmente con herramienta de conversión SVG→ICO o dejar solo el inline SVG como fallback |
