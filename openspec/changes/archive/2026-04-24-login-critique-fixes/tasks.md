## 1. Fase 1 — Accesibilidad Crítica

- [x] 1.1 Eliminar enlace "¿Olvidaste tu contraseña?" del template HTML
- [x] 1.2 Agregar `inputId="email"` al `pInputText` de email
- [x] 1.3 Agregar `inputId="password"` al `p-password` de contraseña
- [x] 1.4 Agregar `autocomplete="email"` al input de email
- [x] 1.5 Agregar `autocomplete="current-password"` al input de password
- [x] 1.6 Agregar asterisco rojo a labels de campos obligatorios (email, password)
- [x] 1.7 Verificar que labels `for="email"` y `for="password"` apunten correctamente
- [x] 1.8 Testear en navegador que clickear en label enfoca el input

## 2. Fase 2 — Visual Cleanup (Distill)

- [x] 2.1 Remover bloque `auth-social-proof` (avatares + texto) del HTML
- [x] 2.2 Remover `.auth-decoration` y `.deco-shape-*` del HTML
- [x] 2.3 Remover SCSS de `.auth-decoration`, `.deco-shape`, `.auth-social-proof`, `.proof-*`
- [x] 2.4 Reducir `.auth-blob` a 1 solo blob en lugar de 2 (o mantener solo el grid pattern)
- [x] 2.5 Remover keyframes `float` si ya no se usan
- [x] 2.6 Verificar que el layout sigue centrado y visualmente agradable
