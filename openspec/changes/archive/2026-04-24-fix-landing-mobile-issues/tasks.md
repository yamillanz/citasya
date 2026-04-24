## 1. Header Mobile

- [x] 1.1 Agregar padding horizontal a `.header-container` en mobile (max-width: 1024px) para que el logo no toque el borde
- [x] 1.2 Verificar que el menú hamburguesa siga alineado correctamente tras el cambio de padding

## 2. Mobile Drawer (Menú Hamburguesa)

- [x] 2.1 Corregir el header del drawer para que muestre el título "Menú" y el logo correctamente
- [x] 2.2 Reducir el tamaño de fuente de `.mobile-nav-link` de `1.0625rem` a `1rem`
- [x] 2.3 Reducir el padding vertical de los botones de auth en el drawer mobile
- [x] 2.4 Ajustar el padding del `.mobile-menu-content` para que no se vea cortado

## 3. Anti-Patterns y Calidad Visual

- [x] 3.1 Reemplazar gradient text de `.headline-accent` con `color: var(--color-sage-dark)`
- [x] 3.2 Eliminar `border-left: 3px solid` de `.mock-apt` y reemplazar con indicador sutil (`::before` con 4px y border-radius)
- [x] 3.3 Cambiar animación de nav-link `transition: width` por `transform: scaleX()`

## 4. Verificación

- [x] 4.1 Compilar la aplicación sin errores (`ng build`)
- [x] 4.2 Verificar visualmente en emulación mobile (iPhone 14 Pro Max) que el header tiene margen y el drawer se ve proporcionado
