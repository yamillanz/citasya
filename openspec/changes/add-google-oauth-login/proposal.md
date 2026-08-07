# Proposal: Add Google OAuth Login

## Intent
Enable users to sign in to CitasYa using their Google/Gmail account via a "Sign in with Google" button, while preserving the existing admin-controlled access model where only pre-registered users can access the system.

## Scope

### In
- Add a "Ingresar con Google" button to the existing login page
- Implement OAuth flow using Supabase Auth with Google provider
- Validate that the Google-authenticated email exists in the `profiles` table
- Enforce `is_active` check for Google-authenticated users (same as email/password)
- Redirect to appropriate dashboard based on user role after successful Google login
- Handle error cases: unregistered email, deactivated account, OAuth cancellation
- Update `AuthService` to support Google OAuth sign-in
- Configure Supabase client for OAuth (implicit flow)
- **Behavior-oriented tests** for the OAuth flow and validation logic
- **Step-by-step configuration guide** for Google Cloud Console and Supabase Dashboard

### Out
- No changes to user registration flow (admin still creates users manually)
- No changes to existing email/password login
- No automatic creation of `profiles` records for new Google users
- No data sync from Google profile (name, photo) into `profiles` table
- No changes to password reset or email confirmation flows
- No changes to role assignment logic
- No changes to guards or route protection

## Approach
1. **Configuration Phase**: Set up Google Cloud Console OAuth credentials and Supabase Auth provider (documented in tasks.md)
2. **Frontend**: Add Google sign-in button to `login.component.html` using PrimeNG styling, call `AuthService.signInWithGoogle()`
3. **AuthService**: Add `signInWithGoogle()` method using `supabase.auth.signInWithOAuth({ provider: 'google' })`
4. **Callback handling**: After Google redirects back, extract session and validate user against `profiles` table
5. **Validation**: Reuse existing `getUserData()` logic to check email existence and `is_active` status
6. **Security**: If email not found in `profiles` or `is_active = false`, immediately sign out and show error
7. **Testing**: Write behavior-oriented tests using spies and Testing Library (per project testing philosophy)
