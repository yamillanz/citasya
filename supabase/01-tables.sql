-- ============================================================================
-- CitasYa - CREACIÓN DE TABLAS
-- Proyecto: SaaS de Gestión de Citas para Pymes
-- Fecha: 2026-03-17
-- ============================================================================

-- ============================================================================
-- 1. HABILITAR EXTENSIONES
-- ============================================================================

-- Extension UUID para generar IDs únicos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABLA: companies (Empresas/Negocios)
-- ============================================================================

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    address TEXT,
    phone TEXT,
    logo_url TEXT,
    plan_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE companies IS 'Empresas o negocios que usan el sistema CitasYa';
COMMENT ON COLUMN companies.name IS 'Nombre de la empresa';
COMMENT ON COLUMN companies.slug IS 'URL amigable única (ej: peluqueria-juan)';
COMMENT ON COLUMN companies.plan_id IS 'Referencia al plan de suscripción';

-- ============================================================================
-- 3. TABLA: plans (Planes de suscripción)
-- ============================================================================

CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    max_users INT NOT NULL,
    max_companies INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE plans IS 'Planes de suscripción disponibles';
COMMENT ON COLUMN plans.name IS 'Nombre del plan (Básico, Medio, Custom)';
COMMENT ON COLUMN plans.price IS 'Precio mensual en dólares';
COMMENT ON COLUMN plans.max_users IS 'Cantidad máxima de usuarios (manager + empleados)';
COMMENT ON COLUMN plans.max_companies IS 'Cantidad máxima de empresas';

-- ============================================================================
-- 4. TABLA: profiles (Usuarios del sistema)
-- ============================================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    photo_url TEXT,
    role TEXT CHECK (role IN ('superadmin', 'manager', 'employee')) DEFAULT 'employee',
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Perfiles de usuario asociados a auth.users';
COMMENT ON COLUMN profiles.role IS 'Rol: superadmin (sistema), manager (dueño), employee (empleado)';
COMMENT ON COLUMN profiles.company_id IS 'Empresa a la que pertenece el usuario';
COMMENT ON COLUMN profiles.is_active IS 'Si el usuario está activo en el sistema';

-- ============================================================================
-- 5. TABLA: services (Servicios por empresa)
-- ============================================================================

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration_minutes INT NOT NULL,
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE services IS 'Servicios que ofrece cada empresa';
COMMENT ON COLUMN services.name IS 'Nombre del servicio (corte, manicure, etc.)';
COMMENT ON COLUMN services.duration_minutes IS 'Duración del servicio en minutos';
COMMENT ON COLUMN services.price IS 'Precio de referencia del servicio';

-- ============================================================================
-- 6. TABLA: employee_services (Relación empleado-servicios)
-- ============================================================================

CREATE TABLE employee_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, service_id)
);

COMMENT ON TABLE employee_services IS 'Define qué servicios puede realizar cada empleado';

-- ============================================================================
-- 7. TABLA: schedules (Horario de la empresa)
-- ============================================================================

CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    day_of_week INT CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true
);

COMMENT ON TABLE schedules IS 'Horario de atención de cada empresa';
COMMENT ON COLUMN schedules.day_of_week IS 'Día: 0=Domingo, 1=Lunes, ..., 6=Sábado';

-- ============================================================================
-- 8. TABLA: appointments (Citas/Turnos)
-- ============================================================================

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'cancelled', 'no_show')) DEFAULT 'pending',
    amount_collected DECIMAL(10,2),
    notes TEXT,
    cancellation_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE appointments IS 'Citas agendadas por clientes';
COMMENT ON COLUMN appointments.status IS 'Estado: pending (pendiente), completed (completada), cancelled (cancelada), no_show (no asistió)';
COMMENT ON COLUMN appointments.amount_collected IS 'Monto cobrado al cliente';
COMMENT ON COLUMN appointments.cancellation_token IS 'Token para cancelar/reprogramar sin login';

-- ============================================================================
-- 9. TABLA: daily_closes (Cierres diarios)
-- ============================================================================

CREATE TABLE daily_closes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    close_date DATE NOT NULL,
    total_appointments INT DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    generated_by UUID REFERENCES profiles(id),
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, close_date)
);

COMMENT ON TABLE daily_closes IS 'Cierres diarios de caja por empresa';
COMMENT ON COLUMN daily_closes.close_date IS 'Fecha del cierre';
COMMENT ON COLUMN daily_closes.total_appointments IS 'Cantidad de citas del día';
COMMENT ON COLUMN daily_closes.total_amount IS 'Total cobrado en el día';
COMMENT ON COLUMN daily_closes.generated_by IS 'Usuario que generó el cierre';

-- ============================================================================
-- 10. TABLA: contact_messages (Mensajes de contacto)
-- ============================================================================

CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE contact_messages IS 'Mensajes del formulario de contacto en landing page';
COMMENT ON COLUMN contact_messages.status IS 'Estado: new (nuevo), read (leído), replied (respondido)';

-- ============================================================================
-- 11. ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================================================

-- Índices para appointments (búsquedas frecuentes)
CREATE INDEX idx_appointments_company_date ON appointments(company_id, appointment_date);
CREATE INDEX idx_appointments_employee_date ON appointments(employee_id, appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Índices para schedules
CREATE INDEX idx_schedules_company_day ON schedules(company_id, day_of_week);

-- Índices para servicios
CREATE INDEX idx_services_company ON services(company_id);

-- Índices para perfiles
CREATE INDEX idx_profiles_company ON profiles(company_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ============================================================================
-- 12. FUNCIONES ÚTILES
-- ============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para companies
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para appointments
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
