```markdown
# Flujo de Trabajo OpenSpec: Desarrollo por Fases

### 1. Inicializar el proyecto (En tu Terminal)
Asegúrate de estar en la carpeta vacía de tu frontend y ejecuta el siguiente comando para crear la estructura base con las carpetas `specs/` y `changes/`:
`openspec init`

### 2. Iniciar la Primera Fase (En el Chat de OpenCode)
Carga tu documento general de contexto y el archivo Markdown específico de tu **Primera Fase**, y luego usa el siguiente comando para generar los artefactos de planificación (`proposal.md`, especificaciones, `design.md` y `tasks.md`) en un solo paso:
`/opsx:propose nombre-de-la-fase`
*(Ejemplo: `/opsx:propose fase-1-setup`)*

### 3. Implementar el Código (En el Chat de OpenCode)
Una vez que revises y estés de acuerdo con los pasos generados en el archivo `tasks.md`, ordena a la IA que comience a escribir el código ejecutando:
`/opsx:apply`
*Nota: La IA trabajará tarea por tarea y marcará las casillas con un `[x]` a medida que las complete.*

### 4. Verificar y Archivar (En el Chat de OpenCode)
De manera opcional, para validar que la implementación coincida con tus artefactos (revisando completitud, corrección y coherencia), ejecuta:
`/opsx:verify`

Luego, finaliza el cambio para mover los requerimientos recién construidos a la fuente de la verdad (la carpeta principal `specs/`) y guardar la fase completada en el historial:
`/opsx:archive`

### 5. Repetir el ciclo
Carga el archivo Markdown de tu **Fase 2** y repite desde el paso 2 utilizando el comando `/opsx:propose nombre-fase-2` para continuar construyendo tu proyecto de forma orgánica.
```