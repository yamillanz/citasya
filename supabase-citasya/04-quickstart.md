# CitasYa - Guía Rápida de Configuración Supabase

## ✅ Checklist Previo

- [ ] Cuenta de Supabase creada
- [ ] Proyecto de Supabase creado
- [ ] Proyecto Angular configurado con credenciales

---

## 🚀 Ejecución Rápida (5 minutos)

### Paso 1: Copiar y Ejecutar SQL

1. Abre **Supabase Dashboard**
2. Ve a **SQL Editor** en el menú lateral
3. Haz click en **New query**
4. Copia el contenido de los archivos en este orden:

```
┌─────────────────────────────────────────────────────────────┐
│  ORDEN DE EJECUCIÓN (importante seguir este orden)         │
├─────────────────────────────────────────────────────────────┤
│  1. 01-tables.sql       → Crea todas las tablas           │
│  2. 02-rls-policies.sql → Configura seguridad             │
│  3. 03-seed-data.sql    → Inserta datos iniciales         │
└─────────────────────────────────────────────────────────────┘
```

### Paso 2: Verificar Creación

Después de ejecutar cada script, verifica en **Table Editor**:

| Tabla | Qué verificar |
|-------|--------------|
| `companies` | Se creó con columnas: id, name, slug |
| `plans` | 3 registros (Básico, Medio, Custom) |
| `profiles` | Estructura con campos role, company_id |
| `services` | Estructura con duration_minutes |
| `appointments` | Estados: pending, completed, cancelled, no_show |
| `schedules` | day_of_week de 0-6 |
| `daily_closes` | UNIQUE en company_id + close_date |
| `contact_messages` | Estado: new, read, replied |

### Paso 3: Verificar Políticas RLS

En **Table Editor** → selecciona una tabla → pestaña **Policies**:

Deberías ver políticas como:
- `companies_public_select`
- `services_public_select`
- `appointments_insert`
- `profiles_select_own`

---

## 🔍 Cómo Probar la Integración

### 1. Probar Auth (Sign Up)

```bash
# Desde la app Angular, crear usuario
# Ir a /login
# Click en "Sign Up"
# Ingresar email y password
```

### 2. Verificar que se creó el perfil

```sql
-- En SQL Editor
SELECT * FROM profiles;
```

### 3. Probar Portal Público

```bash
# En el navegador
# Ir a http://localhost:4200/c/miempresa
# (antes de crear empresas, esto mostrará error 404)
```

---

## ⚠️ Problemas Comunes

### Error: "relation does not exist"

**Causa:** No ejecutaste `01-tables.sql`  
**Solución:** Ejecuta el script de tablas primero

### Error: "permission denied"

**Causa:** RLS bloqueando operaciones  
**Solución:** Verifica las políticas en cada tabla

### Error: "duplicate key value"

**Causa:** slug de empresa duplicado  
**Solución:** Usa un slug único

---

## 📊 Estructura de Datos Final

```
┌──────────────────────────────────────────────────────────────┐
│                    ESQUEMA COMPLETO                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  auth.users ──────► profiles                                │
│       │                 │                                   │
│       │                 ▼                                   │
│       │           companies ◄── plans                        │
│       │                 │                                   │
│       │                 ├──► services                       │
│       │                 │        │                          │
│       │                 │        └──► employee_services     │
│       │                 │                                   │
│       │                 ├──► schedules                      │
│       │                 │                                   │
│       │                 ├──► appointments                  │
│       │                 │        │                          │
│       │                 │        └──► daily_closes          │
│       │                 │                                   │
│       │                 └─────────────► contact_messages   │
│       │                                                     │
│       └────────────── (trigger automático)                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔗 Recursos

| Recurso | URL |
|---------|-----|
| Dashboard Supabase | https://supabase.com/dashboard |
| Documentación SQL | https://supabase.com/docs/guides/database |
| Tabla Editor | https://supabase.com/docs/guides/database/table-editor |
| RLS | https://supabase.com/docs/guides/auth/row-level-security |

---

## ✅ Siguiente Paso

Una vez configurada la base de datos:

1. **Crea tu primer usuario** desde la app Angular
2. **Accede al dashboard** como manager
3. **Crea tu empresa** desde el panel de superadmin
4. **Comienza a usar** el sistema de citas

---

*¿Necesitas ayuda? Revisa el README.md principal o consulta la documentación de Supabase.*
