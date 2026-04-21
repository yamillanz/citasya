## ADDED Requirements

### Requirement: Edge Function creates users in Supabase Auth and profiles
The system SHALL expose an Edge Function named `create-user` that creates a user in Supabase Auth and their corresponding profile atomically.

#### Scenario: Superadmin creates a user successfully
- **WHEN** the Edge Function `create-user` receives a POST request with valid `email`, `password`, `full_name`, `role`, and optional `phone`, `company_id`, `can_be_employee`
- **AND** the authenticated caller has `role = 'superadmin'` in `profiles`
- **THEN** the system creates the user in `auth.users` with `email_confirm: true`
- **AND** the system inserts a corresponding row in `profiles` with `is_active = true`
- **AND** the system returns the created user object with a 201 status

#### Scenario: Non-superadmin attempts to create a user
- **WHEN** the Edge Function `create-user` receives a valid request from an authenticated user whose `role` is not `'superadmin'`
- **THEN** the system returns a 403 Forbidden response

#### Scenario: Duplicate email on user creation
- **WHEN** the Edge Function `create-user` receives a request with an email that already exists in `auth.users`
- **THEN** the system returns a 409 Conflict response with message "El email ya está registrado"

## MODIFIED Requirements

### Requirement: Superadmin can create a user
The system SHALL allow superadmin to create a new user with email, full name, role, password, and optional company assignment.

#### Scenario: Create user form displays
- **WHEN** superadmin clicks "Nuevo Usuario" button
- **THEN** system shows a dialog with fields: Email, Full Name, Password, Role (dropdown), Company (dropdown), Phone

#### Scenario: Create user successfully
- **WHEN** superadmin fills all required fields including a password of at least 6 characters and clicks "Guardar"
- **THEN** system creates the user in Supabase Auth and the corresponding profile
- **AND** system shows success toast message

#### Scenario: Create user with duplicate email
- **WHEN** superadmin enters an email that already exists
- **THEN** system shows validation error "El email ya existe"

#### Scenario: Create user with short password
- **WHEN** superadmin enters a password with fewer than 6 characters
- **THEN** system shows validation error "La contraseña debe tener al menos 6 caracteres"

## ADDED Requirements

### Requirement: Login blocks inactive users
The system SHALL reject authentication for users whose `profiles.is_active` is `false`.

#### Scenario: Inactive user attempts login
- **WHEN** a user with valid email and password but `is_active = false` attempts to sign in
- **THEN** the system rejects the authentication
- **AND** the system displays the message "Tu cuenta ha sido desactivada. Contacta al administrador."

#### Scenario: Active user logs in successfully
- **WHEN** a user with valid credentials and `is_active = true` attempts to sign in
- **THEN** the system authenticates successfully
- **AND** the system redirects the user based on their role

### Requirement: Current session validates user active status
The system SHALL invalidate the session of a user whose `is_active` becomes `false`.

#### Scenario: Inactive user session is rejected
- **WHEN** the application checks the current authenticated user via `getCurrentUser()`
- **AND** the user's `profiles.is_active` is `false`
- **THEN** the system returns `null` and signs the user out
