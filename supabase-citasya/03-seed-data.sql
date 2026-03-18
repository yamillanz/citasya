-- ============================================================================
-- CitasYa - DATOS INICIALES (SEED)
-- Proyecto: SaaS de Gestión de Citas para Pymes
-- Fecha: 2026-03-17
-- ============================================================================

-- ============================================================================
-- 1. INSERTAR PLANES DE SUSCRIPCIÓN
-- ============================================================================

INSERT INTO plans (id, name, price, max_users, max_companies) VALUES
    (uuid_generate_v4(), 'Básico', 25.00, 10, 1),
    (uuid_generate_v4(), 'Medio', 60.00, 20, 2),
    (uuid_generate_v4(), 'Custom', 0.00, 999, 999)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. EJEMPLO DE EMPRESA (Para pruebas)
-- ============================================================================

-- Nota: El company_id se genera automáticamente
-- Para insertar datos de prueba, primero necesitas crear un usuario en Supabase Auth
-- y luego insertar su perfil en la tabla profiles

-- ============================================================================
-- 3. CONSULTAS ÚTILES PARA VERIFICACIÓN
-- ============================================================================

-- Ver todos los planes
SELECT * FROM plans;

-- Ver todas las tablas creadas
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Ver todas las políticas RLS creadas
SELECT 
    policyname, 
    tablename, 
    cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- 4. NOTAS IMPORTANTES
-- ============================================================================

/*
IMPORTANT: Antes de insertar empresas y usuarios, necesitas:

1. Crear una cuenta en Supabase Auth (vía email/password o Google)
2. El usuario se creará automáticamente en la tabla "auth.users"
3. Luego debes crear el perfil en "profiles" asociado a ese usuario

EJEMPLO después de tener un usuario en auth.users:

-- Obtener el ID del usuario creado
SELECT id, email FROM auth.users WHERE email = 'tu-email@ejemplo.com';

-- Insertar perfil de superadmin (primero usuario)
INSERT INTO profiles (id, email, full_name, role, is_active)
VALUES (
    'UUID-DEL-USUARIO-AQUI',
    'tu-email@ejemplo.com',
    'Tu Nombre',
    'superadmin',
    true
);

-- Insertar empresa de ejemplo
INSERT INTO companies (name, slug, address, phone)
VALUES (
    'Peluquería Ejemplo',
    'peluqueria-ejemplo',
    'Calle Principal 123',
    '+1234567890'
);

-- Asignar empresa al usuario (después de crear la empresa)
UPDATE profiles 
SET company_id = 'UUID-DE-LA-EMPRESA' 
WHERE email = 'tu-email@ejemplo.com';
*/

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
