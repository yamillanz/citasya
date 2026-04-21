# CitasYa - Product Requirements Document (PRD)

> **Versión:** 1.0
> **Fecha:** Abril 2026
> **Estado:** En desarrollo (MVP funcional, casi completo)

---

## 1. Vision & Vision Statement

**CitasYa** es una plataforma SaaS de gestión de citas médicas y de estética, diseñada específicamente para emprendedores y pequeños negocios en Latinoamérica. A diferencia de competidores globales como Calendly o SimplyBook, CitasYa ofrece:

- **Precio accesible** para pequeños negocios de salud y belleza
- **Diseño pensado para el mercado latinoamericano** (idioma, moneda, flujos locales)
- **Atención directa al cliente** como diferenciador de servicio

**Visión:** Democratizar la gestión de citas para negocios de salud y estética en Latinoamérica, permitiendo que consultorios, clínicas, spas y barberías puedan operar profesionalmente sin invertir en sistemas costosos.

---

## 2. Problem Statement

Los pequeños negocios de salud y estética en Latinoamérica enfrentan:

- **Falta de herramientas accesibles:** Los sistemas de booking internacionales son costosos o no están adaptados al contexto local
- **Gestión manual inefficient:** WhatsApp, papel o Excel para gestionar citas genera errores y perdida de clientes
- **Sin integración de pagos/comisiones:** No hay forma fácil de trackear ingresos y pagarle a empleados
- **Experiencia de cliente fragmentada:** Los clientes no tienen una forma fácil de reservar y recordar sus citas

---

## 3. User Segments & Personas

### 3.1 Superadmin - Administrador de Plataforma

**Descripción:** Equipo interno de CitasYa que gestiona el ecosistema completo.

**Responsabilidades:**
- Gestionar empresas (crear, editar, activar/desactivar)
- Gestionar planes y asignaciones
- Gestionar usuarios (crear managers y empleados)
- Ver transacciones y métricas de plataforma

**Accesso:** Panel `/bo/superadmin/*`

---

### 3.2 Manager - Gestor de Negocio

**Descripción:** Dueño o administrador de un negocio (clínica, spa, barbería).

**Responsabilidades:**
- Configurar perfil del negocio
- Gestionar empleados (agregar, editar, desactivarlos)
- Gestionar servicios ofrecidos (con precios y comisión)
- Gestionar citas (ver, crear, cancelar, reprogramar)
- Realizar cierre diario (registrar monto final de cada cita)
- Revisar reportes semanales de comisiones
- Ver métricas del día (citas completadas, ingresos)

**Accesso:** Panel `/bo/manager/*` - Dashboard principal `/bo/dashboard`

---

### 3.3 Employee - Profesional de Servicio

**Descripción:** Empleado del negocio (doctor, estilista, terapeuta).

**Responsabilidades:**
- Ver su calendario de citas
- Ver historial de citas completadas
- Solo puede visualizar, no modificar citas

**Accesso:** Panel `/bo/employee/*`

---

### 3.4 Cliente Público

**Descripción:** Persona que reserva una cita sin necesidad de crear cuenta.

**Flujo:**
1. Visita `/c/:company_slug` - ve lista de empleados
2. Selecciona empleado y fecha/hora disponible
3. Llena formulario con sus datos
4. Recibe confirmación de la cita

**Accesso:** Portal público sin autenticación

---

## 4. Product Features

### 4.1 Portal Público de Reservas (Sin Auth)

#### 4.1.1 Directorio de Empresas
- Página `/c/:company_slug` muestra empleados del negocio
- Cada empleado muestra: nombre, foto, especialidad
- Enlace al calendario de reservas

#### 4.1.2 Calendario Público del Empleado
- Ruta `/c/:company_slug/e/:employee_id`
- Muestra disponibilidad del empleado
- Slots disponibles según horarios configurados
- Vista mensual/semanal con horarios disponibles

#### 4.1.3 Formulario de Reserva
- Recolecta: nombre cliente, teléfono, email (opcional), notas (opcional)
- Muestra resumen de la reserva antes de confirmar
- Crea cita con status "pending"
- Mensaje de confirmación con detalles

**Tech:** Angular 20, PrimeNG, Supabase

---

### 4.2 Panel Manager

#### 4.2.1 Dashboard
- Resumen del día: total citas, completadas, pendientes
- Ingresos del día (suma de amount_collected de citas completadas)
- Lista de citas de hoy con status y acciones rápidas

#### 4.2.2 Gestión de Citas
- Lista de todas las citas con filtros (fecha, empleado, estado)
- Estados: `pending`, `completed`, `cancelled`, `no_show`
- Crear, editar, cancelar citas
- Ver detalle de cita

#### 4.2.3 Gestión de Empleados
- CRUD de empleados
- Campos: nombre, email, teléfono, horarios, especialidad
- Asignar servicios que puede realizar
- Activo/Inactivo

#### 4.2.4 Gestión de Servicios
- CRUD de servicios
- Campos: nombre, precio, duración, comisión (%)
- Cada servicio tiene `% comisión` para cálculo de pago a empleado

#### 4.2.5 Cierre Diario
- Ruta: `/bo/manager/daily-close`
- Lista citas pendientes/completadas del día seleccionado
- Por cada cita completada, el manager ingresa `amount_collected` (monto final)
- Al confirmar cierre, las citas pasan a status `completed` y se registra el monto
- Estadísticas del día: total citas, ingresos, distribución por empleado

#### 4.2.6 Reporte Semanal
- Ruta: `/bo/manager/reports/weekly`
- Tabla resumen por empleado: nombre, total citas, total monto, total comisión
- Filtro por rango de fechas (default: semana actual)
- Filtro por empleado
- Totales al final de la tabla
- Modal detalle por empleado con lista de citas
- Exportar a CSV (UTF-8 con BOM para Excel)
- Cálculo de comisión por servicio: `commission_percentage` configurable

**Tech:** Angular 20 Signals, PrimeNG, OnPush

---

### 4.3 Panel Employee

#### 4.3.1 Calendario
- Vista FullCalendar con month/week/day
- Muestra citas propias con hora y nombre del cliente
- Click en cita abre dialog con detalle

#### 4.3.2 Historial
- Lista de citas pasadas con detalle
- Solo lectura (no puede modificar)

---

### 4.4 Panel Superadmin

#### 4.4.1 Gestión Central
- Vista unificada de todas las empresas, usuarios, planes

#### 4.4.2 Gestión de Planes
- CRUD de planes (nombre, precio, features)
- Asignar plan a empresas

#### 4.4.3 Gestión de Usuarios
- Lista de todos los usuarios (managers y empleados)
- CRUD de usuarios
- Asignar empresa y rol
- Activar/desactivar usuarios

#### 4.4.4 Transacciones
- Ver métricas de uso y transacciones de plataforma

---

## 5. Data Model

### 5.1 Entities Core

**Company**
```typescript
{
  id: string
  name: string
  slug: string  // para URL pública /c/:slug
  logo_url?: string
  phone?: string
  address?: string
  plan_id: string
  is_active: boolean
  created_at: timestamp
}
```

**User**
```typescript
{
  id: string
  email: string
  full_name: string
  phone?: string
  role: 'superadmin' | 'manager' | 'employee'
  company_id?: string  // null para superadmin
  is_active: boolean
  created_at: timestamp
}
```

**Service**
```typescript
{
  id: string
  company_id: string
  name: string
  price: number
  duration_minutes: number
  commission_percentage: number  // 0-100
  is_active: boolean
}
```

**Appointment**
```typescript
{
  id: string
  company_id: string
  employee_id: string
  services: Service[]  // múltiples servicios por cita
  client_name: string
  client_phone: string
  client_email?: string
  appointment_date: string  // YYYY-MM-DD
  appointment_time: string  // HH:mm
  status: 'pending' | 'completed' | 'cancelled' | 'no_show'
  amount_collected?: number  // seteado en cierre diario
  notes?: string
  created_at: timestamp
}
```

**Plan**
```typescript
{
  id: string
  name: string
  price_monthly: number
  features: string[]
}
```

### 5.2 Calculations

**Employee Weekly Commission:**
```
Para cada appointment completed:
 Por cada service:
    service_proportion = service.price / sum(all services prices)
    commission += amount_collected * service_proportion * (commission_percentage / 100)

Total commission = sum de todas las comisiones de servicios
```

---

## 6. User Flows

### 6.1 Reserva de Cita (Cliente)

```
1. Cliente accede a /c/mi-negocio
2. Ve lista de empleados disponibles
3. Selecciona empleado
4. Ve calendario con slots disponibles
5. Selecciona fecha/hora
6. Ve resumen (empleado, servicio, fecha, hora, precio)
7. Llena formulario (nombre, teléfono, email opcional)
8. Click "Confirmar Reserva"
9. Ve mensaje de confirmación con detalles
```

### 6.2 Cierre Diario (Manager)

```
1. Manager accede a /bo/daily-close
2. Navega a la fecha deseada (default: hoy)
3. Ve lista de citas del día
4. Por cada cita completada, ingresa el monto final (amount_collected)
5. Al final, click "Confirmar Cierre"
6. Sistema actualiza citas a completed y guarda montos
7. Ve resumen del día: total citas, ingresos, etc.
```

### 6.3 Revisión de Comisiones (Manager)

```
1. Manager accede a /bo/reports/weekly
2. Ve tabla con empleados (default: semana actual)
3. Cada fila: nombre, total citas, total monto, total comisión
4. Click en fila de empleado abre modal con detalle de citas
5. Puede filtrar por empleado o rango de fechas
6. Click "Exportar CSV" para descargar reporte
```

---

## 7. Technical Architecture

### 7.1 Stack

- **Frontend:** Angular 20.3 (Standalone components, Signals, OnPush)
- **UI Framework:** PrimeNG 19
- **Backend:** Supabase (Postgres + Auth + RLS)
- **Styling:** Tailwind CSS + custom SCSS tokens
- **Calendar:** FullCalendar

### 7.2 Project Structure

```
app-web/
├── src/
│   ├── app/
│   │   ├── core/                 # Servicios, modelos, guards
│   │   │   ├── models/          # Interfaces TypeScript
│   │   │   ├── services/        # Auth, Appointments, Companies, etc.
│   │   │   └── guards/          # Auth, Role guards
│   │   ├── features/
│   │   │   ├── landing/         # Landing page pública
│   │   │   ├── public/          # Portal booking (company, calendar, form)
│   │   │   ├── auth/            # Login
│   │   │   ├── backoffice/
│   │   │   │   ├── manager/     # Dashboard, employees, services, daily-close, reports
│   │   │   │   ├── employee/    # Calendar, history
│   │   │   │   └── superadmin/  # Central management, plans, users
│   │   │   └── shared/          # Componentes reutilizables
│   │   └── app.config.ts
│   └── styles/
│       └── STYLES.MD            # Design tokens y guías de estilo
```

### 7.3 API (Supabase)

Autenticación via Supabase Auth con RLS (Row Level Security) para:
- Clientes: acceso público a booking (sin auth)
- Employees: solo ven sus propias citas
- Managers: ven todas las citas de su empresa
- Superadmins: acceso completo

---

## 8. Non-Functional Requirements

### 8.1 Performance
- Tiempo de carga < 3s en conexiones 3G
- Lazy loading para módulos del backoffice

### 8.2 Accessibility
- WCAG AA compliance
- Focus management en modals
- Color contrast ratios

### 8.3 Responsive
- Mobile-first design
- Breakpoints: 640px, 768px, 1024px, 1280px

### 8.4 SEO
- Meta tags en landing page
- URLs amigables (`/c/:slug`)

---

## 9. Future Roadmap (Post-MVP)

### 9.1 Near-term (Después de primeras monetizaciones)
- **Integración WhatsApp:** Notificaciones y recordatorios via WhatsApp Business API

### 9.2 Mid-term
- Integración con calendarios externos (Google Calendar, Outlook)
- Pasarelas de pago (MercadoPago, Stripe)
- App móvil nativa

### 9.3 Long-term
- Marketplace de servicios
- Sistema de reseñas
- Programas de lealtad

---

## 10. Out of Scope (MVP)

- Mobile app nativa
- Integración con redes sociales
- Sistema de pagos integrado
- Notificaciones push
- Multi-idioma (foco en español)
- White-label

---

## 11. Glossary

| Término | Definición |
|---------|------------|
| **Manager** | Usuario que gestiona un negocio (crea empleados, servicios, citas) |
| **Employee** | Profesional que presta servicios en un negocio |
| **Company/Slug** | Empresa/negocio con URL pública `/c/:slug` |
| **Cierre Diario** | Proceso de registrar el monto final de cada cita completada |
| **Comisión** | Porcentaje del monto que recibe el employee según servicio |
| **RLS** | Row Level Security - seguridad a nivel de fila en Supabase |

---

## 12. Appendix

### A. Tech Stack Details
- Angular 20.3.0
- PrimeNG 19.x
- Supabase JS Client
- Tailwind CSS 3.x
- FullCalendar 6.x

### B. Design Tokens
Ver `app-web/src/styles/STYLES.MD` para tokens completos:
- Primary: Verde Salvia `#9DC183`
- Secondary: Gris Cálido `#5D6D7E`
- Background: Crema `#FAF8F5`
- White: `#FFFFFF`

### C. Routes Summary

| Ruta | Descripción | Auth |
|------|-------------|------|
| `/` | Landing page | No |
| `/c/:slug` | Lista empleados empresa | No |
| `/c/:slug/e/:id` | Calendario público empleado | No |
| `/login` | Login | No |
| `/bo/dashboard` | Dashboard manager | Manager |
| `/bo/employees` | Lista empleados | Manager |
| `/bo/services` | Lista servicios | Manager |
| `/bo/appointments` | Lista citas | Manager |
| `/bo/daily-close` | Cierre diario | Manager |
| `/bo/reports/weekly` | Reporte semanal | Manager |
| `/bo/employee/calendar` | Calendario employee | Employee |
| `/bo/employee/history` | Historial employee | Employee |
| `/bo/superadmin/*` | Panel superadmin | Superadmin |