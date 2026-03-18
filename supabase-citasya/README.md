# Supabase CitasYa - Configuración de Base de Datos

Este directorio contiene todos los scripts SQL necesarios para configurar la base de datos de Supabase para el proyecto CitasYa.

## 📋 Requisitos Previos

1. ✅ Tener una cuenta en [Supabase](https://supabase.com)
2. ✅ Haber creado un proyecto nuevo en Supabase
3. ✅Tener las credenciales en `app-web/src/environments/environment.ts`

## 🚀 Pasos de Configuración

### Paso 1: Ejecutar las Migraciones

1. Abre tu **Supabase Dashboard**
2. Ve a la sección **SQL Editor**
3. Copia y ejecuta los archivos en este orden:

| Orden | Archivo | Descripción |
|-------|---------|-------------|
| 1 | `01-tables.sql` | Crea todas las tablas del sistema |
| 2 | `02-rls-policies.sql` | Configura seguridad RLS |
| 3 | `03-seed-data.sql` | Inserta datos iniciales (planes) |

### Paso 2: Verificar Configuración

Después de ejecutar cada script, verifica en **Table Editor** que las tablas se crearon correctamente.

### Paso 3: Probar la Aplicación

Una vez configurada la base de datos, la aplicación Angular debería poder:
- ✅ Autenticarse con Supabase Auth
- ✅ Crear empresas y usuarios
- ✅ Gestionar servicios y empleados
- ✅ Reservar citas desde el portal público

## 📁 Estructura de Archivos

```
supabase-citasya/
├── README.md              # Este archivo
├── 01-tables.sql         # Creación de tablas
├── 02-rls-policies.sql   # Políticas de seguridad RLS
├── 03-seed-data.sql      # Datos iniciales
└── 04-quickstart.md      # Guía rápida de verificación
```

## 🔧 Scripts opcionales

### Regenerar después de cambios

Si necesitas regenerar la base de datos desde cero:
1. Ve a **Settings** → **API** en Supabase
2. Busca **Reset database** 
3. ⚠️ **ADVERTENCIA**: Esto borrará todos los datos

### Ver logs en tiempo real

```bash
# Instalar Supabase CLI
brew install supabase/tap/supabase

# Ver logs
supabase projects list
supabase db remote commit
```

## 📞 Soporte

- **Documentación Supabase**: https://supabase.com/docs
- **Referencia SQL**: https://supabase.com/docs/guides/database/sql
- **RLS Policies**: https://supabase.com/docs/guides/auth/row-level-security

---

*Última actualización: 2026-03-17*
*Proyecto: CitasYa - SaaS de Gestión de Citas*
