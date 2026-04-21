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

#### Scenario: Unauthenticated request to create user
- **WHEN** the Edge Function `create-user` receives a request without a valid JWT
- **THEN** the system returns a 401 Unauthorized response

#### Scenario: Duplicate email on user creation
- **WHEN** the Edge Function `create-user` receives a request with an email that already exists in `auth.users`
- **THEN** the system returns a 409 Conflict response with message "El email ya está registrado"

#### Scenario: Missing required fields
- **WHEN** the Edge Function `create-user` receives a request without `email`, `password`, `full_name`, or `role`
- **THEN** the system returns a 400 Bad Request response
