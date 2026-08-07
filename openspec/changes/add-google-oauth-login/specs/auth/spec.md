# Delta Specs: Auth / Google OAuth

## ADDED Requirements

### REQ-AUTH-001: Google OAuth Sign-In Button
The system SHALL display a "Ingresar con Google" button on the login page.
- **Scenario**: Given a user on the login page, When the page loads, Then the Google button is visible below the email/password form.

### REQ-AUTH-002: OAuth Flow Initiation
When the user clicks the Google button, the system SHALL initiate OAuth flow via `supabase.auth.signInWithOAuth({ provider: 'google' })`.
- **Scenario**: Given a user clicks "Ingresar con Google", When the button is pressed, Then the browser redirects to Google's consent screen.

### REQ-AUTH-003: Session Detection on Callback
When Google redirects back to the app, the system SHALL automatically detect the session using `detectSessionInUrl: true`.
- **Scenario**: Given Google redirects to `http://localhost:4200/login#access_token=...`, When the page loads, Then Supabase establishes the session automatically.

### REQ-AUTH-004: Email Validation Against Profiles
After Google authentication, the system SHALL verify the user's email exists in `public.profiles`.
- **Scenario**: Given a user successfully authenticates with Google, When the system obtains the email, Then it queries `profiles` by that email.
- **Scenario**: Given the email does NOT exist in `profiles`, When login completion is attempted, Then the system signs out and displays error "Este correo no tiene acceso al sistema. Contacta al administrador."

### REQ-AUTH-005: Active Status Enforcement
If the email exists in `profiles` but `is_active = false`, the system SHALL reject access (same as password login).
- **Scenario**: Given a Google-authenticated user with email in `profiles`, When `is_active = false`, Then the system signs out and displays "Tu cuenta ha sido desactivada. Contacta al administrador."

### REQ-AUTH-006: Role-Based Redirect
If the email exists and is active, the system SHALL redirect based on role.
- **Scenario**: Given a successful Google login with valid user, When authentication completes, Then redirect to role-appropriate route (superadmin → /sa, manager → /bo/dashboard, employee → /emp/calendar).

### REQ-AUTH-007: No Profile Data Sync
The system SHALL NOT modify existing `profiles` data (name, photo, phone) with Google data.
- **Scenario**: Given an existing user logs in with Google, When login succeeds, Then `full_name`, `photo_url`, `phone` in `profiles` remain unchanged.

### REQ-AUTH-008: Supabase Client Configuration
The Supabase client SHALL have `detectSessionInUrl: true`.
- **Previously**: `detectSessionInUrl: false`
- **Now**: `detectSessionInUrl: true`

### REQ-AUTH-009: AuthService Handles Missing Profile
`AuthService.getCurrentUser()` SHALL handle users authenticated in `auth.users` but missing from `public.profiles`.
- **Previously**: Assumed all `auth.users` have a `profiles` record.
- **Now**: If no `profiles` record found, sign out and return null.

## Testing Requirements

### TEST-AUTH-001: signInWithGoogle calls supabase.auth.signInWithOAuth
- **Type**: Behavior (spy)
- **Method**: Verify `supabase.auth.signInWithOAuth` is called with `{ provider: 'google' }` when user clicks the Google button.

### TEST-AUTH-002: getCurrentUser signs out unregistered Google user
- **Type**: Behavior (spy)
- **Method**: Mock `supabase.auth.getUser` to return a Google user. Mock `supabase.from('profiles').select` to return empty. Verify `supabase.auth.signOut` is called and method returns null.

### TEST-AUTH-003: getCurrentUser signs out deactivated Google user
- **Type**: Behavior (spy)
- **Method**: Mock `supabase.auth.getUser` to return a Google user. Mock profile with `is_active: false`. Verify `supabase.auth.signOut` is called and method returns null.

### TEST-AUTH-004: LoginComponent renders Google button
- **Type**: Render (Testing Library)
- **Method**: Render `LoginComponent`. Verify a button with text "Ingresar con Google" or Google icon is present in the DOM.

### TEST-AUTH-005: LoginComponent calls signInWithGoogle on click
- **Type**: Behavior (spy)
- **Method**: Render `LoginComponent`. Spy on `authService.signInWithGoogle`. Click the Google button. Verify the spy was called.

### TEST-AUTH-006: LoginComponent displays error for unregistered Google user
- **Type**: Render (Testing Library)
- **Method**: Mock `authService.getCurrentUser` to return null (simulating post-OAuth callback with unregistered user). Render component. Verify error message "Este correo no tiene acceso al sistema" is displayed.
