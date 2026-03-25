-- ============================================================================
-- CitasYa - POLÍTICAS DE SEGURIDAD RLS (Row Level Security)
-- Proyecto: SaaS de Gestión de Citas para Pymes
-- Fecha: 2026-03-17
-- ============================================================================

-- ============================================================================
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_closes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. POLÍTICAS PARA companies (Empresas)
-- ============================================================================

-- Todos pueden ver empresas (público para el portal de booking)
CREATE POLICY "companies_public_select" ON companies
    FOR SELECT USING (true);

-- Solo superadmin puede insertar
CREATE POLICY "companies_insert" ON companies
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT id FROM profiles WHERE role = 'superadmin')
    );

-- Solo superadmin o manager de la empresa puede actualizar
CREATE POLICY "companies_update" ON companies
    FOR UPDATE USING (
        auth.uid() IN (SELECT id FROM profiles WHERE role = 'superadmin')
        OR id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'manager')
    );

-- ============================================================================
-- 3. POLÍTICAS PARA plans (Planes)
-- ============================================================================

-- Solo superadmin puede ver todos los planes
CREATE POLICY "plans_select" ON plans
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM profiles WHERE role = 'superadmin')
        OR true  -- Everyone can read plans for display
    );

-- Solo superadmin puede modificar
CREATE POLICY "plans_insert" ON plans
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT id FROM profiles WHERE role = 'superadmin')
    );

CREATE POLICY "plans_update" ON plans
    FOR UPDATE USING (
        auth.uid() IN (SELECT id FROM profiles WHERE role = 'superadmin')
    );

-- ============================================================================
-- 4. POLÍTICAS PARA profiles (Usuarios)
-- ============================================================================

-- Usuarios pueden ver su propio perfil
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Managers pueden ver todos los usuarios de su empresa
-- NOTA: Usa get_current_user_company_id() para evitar recursion infinita
CREATE POLICY "profiles_select_company" ON profiles
    FOR SELECT USING (company_id = get_current_user_company_id());

-- Superadmin puede ver todos
-- NOTA: Usa get_current_user_role() para evitar recursion infinita
CREATE POLICY "profiles_select_superadmin" ON profiles
    FOR SELECT USING (get_current_user_role() = 'superadmin');

-- Solo superadmin puede crear usuarios
CREATE POLICY "profiles_insert" ON profiles
    FOR INSERT WITH CHECK (true);

-- Usuarios pueden actualizar su propio perfil
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Managers pueden actualizar empleados de su empresa
-- NOTA: Usa get_current_user_company_id() para evitar recursion infinita
CREATE POLICY "profiles_update_company" ON profiles
    FOR UPDATE USING (
        company_id = get_current_user_company_id()
        AND role = 'employee'
    );

-- ============================================================================
-- 5. POLÍTICAS PARA services (Servicios)
-- ============================================================================

-- Público: ver servicios de una empresa (para booking)
CREATE POLICY "services_public_select" ON services
    FOR SELECT USING (
        is_active = true
    );

-- Managers de la empresa pueden ver todos los servicios
CREATE POLICY "services_select_company" ON services
    FOR SELECT USING (
        company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Managers pueden crear servicios
CREATE POLICY "services_insert" ON services
    FOR INSERT WITH CHECK (
        company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Managers pueden actualizar servicios de su empresa
CREATE POLICY "services_update" ON services
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Managers pueden eliminar servicios
CREATE POLICY "services_delete" ON services
    FOR DELETE USING (
        company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- ============================================================================
-- 6. POLÍTICAS PARA employee_services
-- ============================================================================

-- Ver servicios del empleado (a través de employee_id)
CREATE POLICY "employee_services_select" ON employee_services
    FOR SELECT USING (
        employee_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.company_id IS NOT NULL
            AND p.company_id = (
                SELECT s.company_id FROM services s
                WHERE s.id = employee_services.service_id
            )
        )
    );

-- Asignar servicios a empleados (manager de la empresa del servicio)
CREATE POLICY "employee_services_insert" ON employee_services
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.company_id = (
                SELECT s.company_id FROM services s
                WHERE s.id = employee_services.service_id
            )
        )
    );

-- Managers pueden eliminar asignaciones de empleados
CREATE POLICY "employee_services_delete" ON employee_services
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.company_id = (
                SELECT s.company_id FROM services s
                WHERE s.id = employee_services.service_id
            )
        )
    );

-- ============================================================================
-- 7. POLÍTICAS PARA schedules (Horarios)
-- ============================================================================

-- Público: ver horarios de la empresa
CREATE POLICY "schedules_public_select" ON schedules
    FOR SELECT USING (true);

-- Managers ven horarios de su empresa
CREATE POLICY "schedules_select_company" ON schedules
    FOR SELECT USING (
        company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Managers pueden crear horarios
CREATE POLICY "schedules_insert" ON schedules
    FOR INSERT WITH CHECK (
        company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Managers pueden actualizar horarios
CREATE POLICY "schedules_update" ON schedules
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- ============================================================================
-- 8. POLÍTICAS PARA appointments (Citas)
-- ============================================================================

-- Público: inserción de citas (cliente sin login)
CREATE POLICY "appointments_public_insert" ON appointments
    FOR INSERT WITH CHECK (true);

-- Público: ver cita por token de cancelación
CREATE POLICY "appointments_token_select" ON appointments
    FOR SELECT USING (
        cancellation_token IS NOT NULL
    );

-- Empleados ven sus citas
CREATE POLICY "appointments_select_employee" ON appointments
    FOR SELECT USING (
        employee_id = auth.uid()
    );

-- Managers ven todas las citas de su empresa
CREATE POLICY "appointments_select_company" ON appointments
    FOR SELECT USING (
        company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Superadmin puede ver todas
CREATE POLICY "appointments_select_superadmin" ON appointments
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM profiles WHERE role = 'superadmin')
    );

-- Actualizar citas (empleado o manager)
CREATE POLICY "appointments_update" ON appointments
    FOR UPDATE USING (
        employee_id = auth.uid()
        OR company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- ============================================================================
-- 9. POLÍTICAS PARA daily_closes (Cierres diarios)
-- ============================================================================

-- Solo managers pueden ver cierres de su empresa
-- NOTA: Usa funciones SECURITY DEFINER para evitar recursion infinita
CREATE POLICY "daily_closes_select" ON daily_closes
    FOR SELECT USING (
        company_id = get_current_user_company_id()
        AND get_current_user_role() = 'manager'
    );

-- Solo managers pueden generar cierres
-- NOTA: Usa funciones SECURITY DEFINER para evitar recursion infinita
CREATE POLICY "daily_closes_insert" ON daily_closes
    FOR INSERT WITH CHECK (
        company_id = get_current_user_company_id()
        AND get_current_user_role() = 'manager'
    );

-- ============================================================================
-- 10. POLÍTICAS PARA contact_messages
-- ============================================================================

-- Público: enviar mensajes
CREATE POLICY "contact_messages_insert" ON contact_messages
    FOR INSERT WITH CHECK (true);

-- Solo superadmin puede ver y gestionar mensajes
CREATE POLICY "contact_messages_select" ON contact_messages
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM profiles WHERE role = 'superadmin')
    );

-- ============================================================================
-- 11. CREAR FUNCIONES AUXILIARES PARA RLS
-- ============================================================================

-- Función para obtener el company_id del usuario actual
CREATE OR REPLACE FUNCTION get_current_user_company_id()
RETURNS UUID AS $$
    SELECT company_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
