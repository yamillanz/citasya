# CitasYa - Reglas Específicas del Proyecto

**IMPORTANT** the folder of the project ins ./app-web

## UI Framework (PrimeNG) - SOLO PARA ESTE PROYECTO

- **Use PrimeNG components exclusively** for all UI elements
- **Before creating any component**, consult PrimeNG documentation via Context7 MCP to find appropriate components
- **Available components**: p-button, p-card, p-inputText, p-accordion, p-table, p-dialog, p-tabView, p-dropdown, p-calendar, etc.
- **Reference**: https://primeng.org

### Workflow obligatorio:
```
1. Identify UI need (e.g., "need a form with inputs and buttons")
2. Query Context7 MCP for PrimeNG components
3. Select appropriate components (p-inputText, p-button, p-card)
4. Implement using PrimeNG - NEVER custom HTML/CSS when PrimeNG alternative exists
5. This project uses **OpenSpec** for phased development. See commands in `app-web/README.md` or use `/opsx:` in the chat
```

### Componentes disponibles en PrimeNG (memorizar):
- **Forms**: p-inputText, p-inputTextarea, p-dropdown, p-calendar, p-checkbox, p-radioButton
- **Buttons**: p-button, p-splitButton, p-speedDial
- **Data**: p-table, p-dataView, p-orderList, p-pickList, p-tree, p-timeline
- **Overlays**: p-dialog, p-sidebar, p-tooltip, p-overlayPanel, p-confirmDialog
- **Menus**: p-menubar, p-tabMenu, p-breadcrumb, p-steps, p-tieredMenu
- **Messages**: p-toast, p-messages, p-confirmPopup
- **Panels**: p-accordion, p-panel, p-fieldset, p-card, p-tabView, p-divider
- **Media**: p-image, p-galleria, p-carousel, p-avatar
- **Misc**: p-badge, p-tag, p-skeleton, p-progressBar, p-progressSpinner

### Ejemplos de conversión:
- ❌ NO usar: `<input type="text">` 
- ✅ USAR: `<input pInputText>`
- ❌ NO usar: `<button>`
- ✅ USAR: `<p-button>`
- ❌ NO usar: `<div class="card">`
- ✅ USAR: `<p-card>`

---

## Esquema de Colores (Verde Salvia)

| Color | Código Hex | Uso |
|-------|------------|-----|
| **Verde Salvia** | `#9DC183` | Primary color, botones principales |
| **Gris Cálido** | `#5D6D7E` | Texto secundario, bordes |
| **Blanco Puro** | `#FFFFFF` | Fondos |

---

## Convenciones de Código

### Componentes
- Siempre standalone components
- ChangeDetection: OnPush
- Usar `inject()` en lugar de constructor
- Separar template y styles si >25 líneas / >6 líneas respectivamente

### Servicios
- `providedIn: 'root'` por defecto
- Nombres descriptivos terminados en `Service`

### Modelos
- Interfaces en `src/app/core/models/`
- Nomenclatura: `nombre.model.ts`

---

*Estas reglas aplican SOLO al proyecto CitasYa*
