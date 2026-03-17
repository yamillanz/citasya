# CitasYa - SaaS de Gestión de Citas para Pymes

## 1. Overview del Proyecto

**Nombre:** CitasYa  
**Tipo:** SaaS B2B (Software como Servicio)  
**Target:** Pymes de estética corporal (peluquerías, manicure, masajes, etc.) y odontólogos  
**Modelo de Negocio:** Suscripción por cantidad de usuarios

---

## 2. Descripción del Producto

CitasYa es una plataforma que permite a pequeños negocios de servicios personales gestionar sus citas y empleados de manera eficiente, sin requerir que los clientes se registren para agendar.

### Problema que resuelve

- Clientes deben crearse cuenta para agendar = fricción = pérdida de citas
- Gestión manual de citas y cobros = errores y pérdida de tiempo
- Sin visibilidad de ingresos diarios por empleado
- Dificultad para cerrar el día y saber qué hizo cada empleado

### Solución

- Citas públicas sin registro del cliente (enlace directo al calendario del empleado)
- Back Office para Manager y empleados
- Cierre diario automatizado con PDF por empresa

---

## 3. Tech Stack

| Capa | Tecnología |
|------|-------------|
| Frontend | Angular 20+ (Mobile First / Responsive / PWA) - Ubicación: `app-web/` |
| Backend | Supabase (Auth, Database, Storage) |
| PDF | jsPDF |
| Calendario | FullCalendar |
| UI Framework | PrimeNG + TailwindCSS v3 |
| PWA | Angular PWA (@angular/pwa) |

---

## 3.1 Esquema de Colores (Aplicado a PrimeNG)

| Color | Código Hex | Uso Principal | Significado Psicológico |
| :--- | :--- | :--- | :--- |
| **Blanco Puro** | `#FFFFFF` | Fondos, espacios de contenido principal | Limpieza, pureza, máxima legibilidad |
| **Verde Salvia** | `#9DC183` | Primary de PrimeNG, acentos, botones principales | Salud, crecimiento, calma natural, confianza |
| **Gris Cálido** | `#5D6D7E` | Texto secundario, bordes, elementos de estructura | Estabilidad, equilibrio, sofisticación cálida |

### Configuración de Tema PrimeNG con Colores Personalizados

```typescript
// app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: '.my-app-dark',
                    cssLayer: {
                        name: 'primeng',
                        order: 'theme, base, primeng'
                    }
                }
            },
            palette: {
                primary: {
                    50: '#F0F7EB',
                    100: '#D9EACD',
                    200: '#B8D4A3',
                    300: '#97BE79',
                    400: '#7BA366',
                    500: '#9DC183',  // Verde Salvia - Color principal
                    600: '#5D8A4E',
                    700: '#4A6F3C',
                    800: '#39542B',
                    900: '#28391A',
                    950: '#141F0D'
                },
                surface: {
                    0: '#FFFFFF',
                    50: '#F8F9FA',
                    100: '#F1F3F5',
                    200: '#E9ECEF',
                    300: '#DEE2E6',
                    400: '#CED4DA',
                    500: '#ADB5BD',
                    600: '#6C757D',
                    700: '#5D6D7E',  // Gris Cálido
                    800: '#495057',
                    900: '#343A40',
                    950: '#212529'
                }
            }
        })
    ]
};
```

### Variables CSS

```css
:root {
  --color-primary: #9DC183;      /* Verde Salvia - principal */
  --color-primary-dark: #7BA366; /* Verde Salvia oscuro */
  --color-primary-light: #B8D4A3; /* Verde Salvia claro */
  
  --color-text-primary: #2C3E50; /* Gris muy oscuro para texto */
  --color-text-secondary: #5D6D7E; /* Gris Cálido */
  --color-text-muted: #95A5A6;
  
  --color-background: #FFFFFF;
  --color-surface: #F8F9FA;
  --color-border: #E5E8EB;
  
  --color-success: #9DC183;
  --color-warning: #F4D03F;
  --color-error: #E74C3C;
  --color-info: #3498DB;
}
```

---

## 3.2 PWA (Progressive Web App)

La aplicación será instalable en dispositivos móviles y de escritorio.

### Características PWA
- **Installable**: Los usuarios pueden instalar la app en su dispositivo
- **Offline**: Funcionalidad básica sin conexión
- **Push Notifications**: Notificaciones para recordatorios de citas
- **Home Screen**: Icono en pantalla de inicio
- **Splash Screen**: Pantalla de carga personalizada

### Archivos PWA
- `manifest.json`: Configuración de instalación
- `ngsw-config.json`: Service Worker para offline
- Iconos: 192x192, 512x512, Apple Touch Icon

---

## 4. Modelo de Datos

### 4.1 Tablas Principales

```sql
-- Empresas/Negocios
companies:
  - id (uuid, pk)
  - name (text)
  - slug (text, unique)
  - address (text)
  - phone (text)
  - logo_url (text)
  - plan_id (uuid, fk)
  - created_at (timestamp)
  - updated_at (timestamp)

-- Planes de suscripción
plans:
  - id (uuid, pk)
  - name (text)
  - price (decimal)
  - max_users (int)
  - max_companies (int)
  - created_at (timestamp)

-- Todos los usuarios del sistema
users:
  - id (uuid, pk)
  - email (text, unique)
  - full_name (text)
  - phone (text)
  - photo_url (text)
  - role (enum: superadmin, manager, employee)
  - company_id (uuid, fk, nullable)
  - is_active (boolean)
  - created_at (timestamp)
  - updated_at (timestamp)

-- Servicios por empresa
services:
  - id (uuid, pk)
  - company_id (uuid, fk)
  - name (text)
  - duration_minutes (int)
  - price (decimal)
  - is_active (boolean)
  - created_at (timestamp)

-- Relación empleado-servicios
employee_services:
  - id (uuid, pk)
  - employee_id (uuid, fk)
  - service_id (uuid, fk)
  - created_at (timestamp)

-- Horario de la empresa
schedules:
  - id (uuid, pk)
  - company_id (uuid, fk)
  - day_of_week (int, 0-6)
  - start_time (time)
  - end_time (time)
  - is_active (boolean)

-- Citas/Turnos
appointments:
  - id (uuid, pk)
  - company_id (uuid, fk)
  - employee_id (uuid, fk)
  - service_id (uuid, fk)
  - client_name (text)
  - client_phone (text)
  - client_email (text, nullable)
  - appointment_date (date)
  - appointment_time (time)
  - status (enum: pending, completed, cancelled, no_show)
  - amount_collected (decimal, nullable)
  - notes (text)
  - cancellation_token (text, nullable)
  - created_at (timestamp)
  - updated_at (timestamp)

-- Cierres diarios
daily_closes:
  - id (uuid, pk)
  - company_id (uuid, fk)
  - close_date (date)
  - total_appointments (int)
  - total_amount (decimal)
  - generated_by (uuid, fk)
  - pdf_url (text)
  - created_at (timestamp)
```

### 4.2 Enums

```sql
-- Roles de usuario
user_role: superadmin | manager | employee

-- Estado de cita
appointment_status: pending | completed | cancelled | no_show
```

---

## 5. Roles y Permisos

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **Superadmin** | Administrador del sistema | CRUD empresas, usuarios, planes. Vista de datos consolidado (solo BD, no UI) |
| **Manager** | Dueño/gerente del negocio (1 por empresa) | Back Office completo: todas las citas, empleados, servicios, configuración, cierre diario |
| **Employee** | Empleado del negocio | Vista limitada: mi calendario, mi historial de citas atendidas |

### Reglas de Negocio por Rol

- **1 Manager por empresa** - Creado directamente por Superadmin
- **Empleados** - Creados por Manager, asignados a empresa
- **Empleados ven solo sus servicios** - Los que el Manager les asignó
- **Cierre diario** - Solo Manager puede generarlo, solo una vez por día
- **Edición de cita** - Solo antes de generar cierre diario

---

## 6. Modelos de Suscripción

| Plan | Precio | Usuarios | Empresas |
|------|--------|----------|----------|
| Básico | $25/mes | 10 (1 Manager + 9 Empleados) | 1 |
| Medio | $60/mes | 20 (1 Manager + 19 Empleados) | 2 |
| Custom | Negociado | Custom | Custom |

### Notas
- El plan define límites, no funcionalidades
- Superadmin asigna plan al crear empresa
- MVP: No hay upgrade desde la app (Superadmin lo gestiona)

---

## 7. Vistas del Sistema

### 7.1 Portal Público (Sin Login)

**Rutas:**
- `/c/:company_slug` - Listado de empleados con servicios disponibles
- `/c/:company_slug/e/:employee_id` - Calendario público de empleado específico

**Funcionalidades:**
- Ver empleados disponibles de una empresa
- Ver servicios que ofrece cada empleado
- Seleccionar fecha y hora disponible
- Formulario de booking:
  - Nombre (obligatorio)
  - Teléfono (obligatorio)
  - Email (opcional)
  - Servicio (obligatorio)
- Confirmación de cita
- Cancelación/reprogramación: mediante token en URL o búsqueda por teléfono/email

### 7.2 Back Office - Manager

**Rutas:**
- `/bo/dashboard` - Dashboard principal
- `/bo/employees` - Gestión de empleados
- `/bo/services` - Gestión de servicios
- `/bo/appointments` - Lista de todas las citas
- `/bo/calendar` - Vista calendario de todas las citas
- `/bo/close` - Generar cierre diario
- `/bo/settings` - Configuración de empresa

**Funcionalidades:**

| Módulo | Descripción |
|--------|-------------|
| Dashboard | Citas del día, totalcobrado, próximos turnos |
| Empleados | CRUD: nombre, foto, teléfono, servicios asignados |
| Servicios | CRUD: nombre, duración (min), precio referencia |
| Citas | Ver todas, filtrar por empleado/fecha/estado |
| Asistencia | Marcar cliente asistido + monto cobrado |
| Cierre Diario | Botón generar → PDF + guardar en BD + sellar datos |
| Configuración | Horario empresa, datos fiscales, logo |

### 7.3 Back Office - Employee

**Rutas:**
- `/emp/calendar` - Mi calendario de citas
- `/emp/history` - Mi historial de citas atendidas

**Funcionalidades:**
- Ver mis citas asignadas
- Ver historial: cliente, servicio, monto cobrado
- NO puede generar cierre diario
- NO puede marcar asistencia

### 7.4 Panel Superadmin

**Rutas:**
- `/sa/companies` - Gestión de empresas
- `/sa/users` - Gestión de usuarios
- `/sa/plans` - Gestión de planes

**Funcionalidades:**
- Crear/editar/empresas
- Asignar plan a empresa
- Crear Manager por empresa
- Crear Employees asociados a empresa

---

## 8. Flujo de Citas

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE CITA                             │
└─────────────────────────────────────────────────────────────┘

1. EXPOSICIÓN PÚBLICA
   ├─ Manager comparte enlace de empresa: citasya.app/c/miempresa
   └─ O empleado comparte su enlace: citasya.app/c/miempresa/e/empleado1

2. CLIENTE AGENDA (SIN REGISTRO)
   ├─ Selecciona servicio
   ├─ Selecciona fecha/hora disponible
   ├─ Ingresa: nombre, teléfono, (email opcional)
   └─ Confirma → Cita creada con estado "pending"

3. GESTIÓN INTERNA
   ├─ Employee ve cita en su calendario
   ├─ Manager ve todas las citas
   └─ Manager marca asistencia + monto → estado "completed"

4. CIERRE DIARIO
   ├─ Manager hace clic en "Generar Cierre"
   ├─ Sistema genera PDF con:
   │  ├─ Fecha
   │  ├─ Citas por empleado
   │  ├─ Total por empleado
   │  └─ Total general
   ├─ Se guarda en BD (daily_closes)
   └─ Datos quedan sellados (no editables)
```

---

## 9. Seguridad y RLS (Row Level Security)

### Políticas Supabase

```sql
-- Companies: Superadmin ve todas, Manager ve la suya
CREATE POLICY "companies_select" ON companies
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'superadmin')
    OR id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Users: Superadmin ve todos, Manager ve los de su empresa
CREATE POLICY "users_select" ON users
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'superadmin')
    OR company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Appointments: cada uno ve los de su empresa
CREATE POLICY "appointments_select" ON appointments
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Daily Closes: solo Manager de la empresa
CREATE POLICY "daily_closes_select" ON daily_closes
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) = 'manager'
  );
```

---

## 10. Consideraciones Técnicas

### 10.1 Calendario Público
- No mostrar horarios ocupaos por otras citas
- Respetar horario de la empresa (schedule)
- Validar que el empleado brinde ese servicio

### 10.2 Generación de PDF
- Usar jsPDF o similar en el cliente
- Incluir: fecha, empleado, servicio, cliente, monto
- Guardar URL en Supabase Storage

### 10.3 URLs Públicas
- Slug de empresa: único, amigable (ej: `peluqueria-juan`)
- Enlace empleado: `/c/:slug/e/:id`
- Cancelación: token generado aleatoriamente en la cita

---

## 11. Landing Page

La landing page es el punto de entrada público para captar nuevos clientes (dueños de negocios).

### 11.1 Estructura de la Landing Page

```
/
├── Hero Section
│   - Título principal: "Gestiona tus citas profesionales desde un solo lugar"
│   - Subtítulo: "La solución perfecta para salones de belleza, clínicas dentales y profesionales independientes"
│   - CTA: "Comenzar prueba gratuita" → /signup
│   - Imagen: Mockup de la aplicación en móvil
│
├── Features Section
│   - 4-6 tarjetas de características principales:
│     - ✓ Citas sin registro del cliente
│     - ✓ Calendario público personalizado
│     - ✓ Cierre diario automático
│     - ✓ Gestión de empleados
│     - ✓ Reportes por empleado
│     - ✓ 100% Mobile First
│
├── How It Works Section
│   - Paso 1: Crea tu cuenta
│   - Paso 2: Agrega tus servicios y empleados
│   - Comparte tu enlace público
│   - Recibe citas y cierra el día
│
├── Testimonials Section
│   - 3 testimonios de usuarios (pueden ser placeholders)
│   - Foto, nombre, negocio, quote
│
├── Pricing Section
│   - Plan Básico: $25/mes - 10 usuarios
│   - Plan Medio: $60/mes - 20 usuarios
│   - Plan Custom: Negociado
│   - CTA en cada plan
│
├── About Us Section
│   - Historia de la empresa
│   - Equipo fundador:
│     - Nombre, foto, rol, bio corta
│     - Visión y misión
│
├── Contact Section
│   - Formulario de contacto:
│     - Nombre
│     - Email
│     - Teléfono
│     - Mensaje
│   - Información de contacto
│   - Redes sociales
│
├── Footer
│   - Logo
│   - Links: Privacidad, Términos, FAQ
│   - Copyright
```

### 11.2 Rutas de Landing Page

```typescript
// app.routes.ts
{
  path: '',
  loadComponent: () => import('./features/landing/home/home.component').then(m => m.HomeComponent)
},
{
  path: 'features',
  loadComponent: () => import('./features/landing/features/features.component').then(m => m.FeaturesComponent)
},
{
  path: 'pricing',
  loadComponent: () => import('./features/landing/pricing/pricing.component').then(m => m.PricingComponent)
},
{
  path: 'contact',
  loadComponent: () => import('./features/landing/contact/contact.component').then(m => m.ContactComponent)
},
{
  path: 'about',
  loadComponent: () => import('./features/landing/about/about.component').then(m => m.AboutComponent)
}
```

### 11.3 Componentes de Landing Page

| Componente | Descripción |
|------------|-------------|
| `HeroComponent` | Sección principal con CTA |
| `FeaturesComponent` | Grid de características |
| `HowItWorksComponent` | Pasos del proceso |
| `TestimonialsComponent` | Testimonios |
| `PricingComponent` | Tabla de precios |
| `AboutComponent` | Sobre nosotros + fundadores |
| `ContactComponent` | Formulario de contacto |
| `FooterComponent` | Footer con links |

### 11.4 Formulario de Contacto

```typescript
// contact.model.ts
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  created_at: string;
  status: 'new' | 'read' | 'replied';
}
```

```sql
-- Tabla para mensajes de contacto
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 12. Funcionalidades No Bloqueantes (MVP)

Las siguientes funcionalidades no son requeridas para el MVP pero pueden agregarse después:

- Notificaciones SMS/Email al cliente
- Recordatorios de cita
- Cancelación desde enlace público (sin login)
- Upgrade de plan desde la app
- Dashboard con gráficos/estadísticas
- App móvil para empleados

---

## 12. Milestones Sugeridos

### Milestone 1: Fundamentos
- [x] Setup proyecto Angular (en `app-web/`)
- [x] Configurar Supabase (Auth, DB, Storage)
- [x] Modelos de datos y RLS
- [x] Login/Logout

### Milestone 2: Portal Público
- [x] Ruta pública de empresa
- [x] Ruta pública de empleado
- [x] Formulario de booking
- [x] Creación de citas

### Milestone 3: Back Office Manager
- [ ] Dashboard
- [ ] CRUD Empleados
- [ ] CRUD Servicios
- [ ] Lista de citas
- [ ] Registro de asistencia
- [ ] Cierre diario con PDF

### Milestone 4: Back Office Employee
- [ ] Mi calendario
- [ ] Mi historial

### Milestone 5: Superadmin
- [ ] CRUD Empresas
- [ ] CRUD Usuarios
- [ ] Asignar planes

### Milestone 6: Polish
- [ ] UI/UX improvements
- [x] Testing (Jest + Testing Library configurado)
- [ ] Deploy

---

## 13. Respuestas a Preguntas Abiertas

1. **¿Se requiere autenticación del cliente para cancelar/reprogramar?**
   - NO. El cliente puede cancelar/reprogramar sin autenticación
   - SÍ. El empleado puede hacerlo desde su calendario en la app

2. **¿El precio del servicio es fijo o puede variar por cita?**
   - El precio es configurable por el Manager por empresa
   - Se usa como referencia, pero el Manager registra el monto real al cerrar

3. **¿Se necesita factura fiscal en el PDF del cierre?**
   - NO, solo un reporte operativo

4. **¿Los empleados tienen acceso desde móvil o solo desktop?**
   - Mobile First: la aplicación debe funcionar primariamente en móvil
   - Clientes acceden desde móvil para agendar
   - Empleados y Managers acceden desde móvil para gestionar

5. **¿Hay límite de citas por día por empleado?**
   - No definido aún (queda abierto)

---

*Documento generado para revisión*
*Versión: 1.4*
*Fecha: 2026-03-17*
*Actualizado: TailwindCSS v3, Ubicación del proyecto en app-web/*
