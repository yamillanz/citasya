# Tasks: Add Google OAuth Login

## Phase 1: Infrastructure Configuration (Manual)

### 1.1 Google Cloud Console Setup
- [ ] Go to https://console.cloud.google.com/ and create/select a project
- [ ] Navigate to APIs & Services > OAuth consent screen
- [ ] Configure OAuth consent screen (App name: CitasYa, scopes: openid, email, profile)
- [ ] Navigate to APIs & Services > Credentials
- [ ] Create OAuth client ID (Web application)
- [ ] Add Authorized JavaScript origins: http://localhost:4200 and production URL
- [ ] Add Authorized redirect URI: https://jrjtkmacpxstihvqaacz.supabase.co/auth/v1/callback
- [ ] Save Client ID and Client Secret securely

### 1.2 Supabase Dashboard Setup
- [ ] Go to https://supabase.com/dashboard and select project
- [ ] Navigate to Authentication > Providers > Google
- [ ] Enable "Sign in with Google"
- [ ] Paste Client ID and Client Secret from Google Cloud Console
- [ ] Navigate to Authentication > URL Configuration
- [ ] Set Site URL to production domain
- [ ] Add redirect URLs: http://localhost:4200/** and https://production-domain.com/**
- [ ] Save all changes

## Phase 2: Core Implementation

### 2.1 Update Supabase Client Configuration
- [ ] Modify `app-web/src/app/core/supabase.ts`
- [ ] Change `detectSessionInUrl: false` to `detectSessionInUrl: true`

### 2.2 Update AuthService
- [ ] Modify `app-web/src/app/core/services/auth.service.ts`
- [ ] Add `signInWithGoogle(): Promise<void>` method
  - [ ] Call `this.supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/login' } })`
  - [ ] Handle errors
- [ ] Modify `getCurrentUser(): Promise<User | null>`
  - [ ] Handle case where `profiles` query returns no data (PGRST116 error or null)
  - [ ] If no profile found: call `this.signOut()` and return null
  - [ ] Keep existing `is_active` check

### 2.3 Update LoginComponent
- [ ] Modify `app-web/src/app/features/auth/components/login/login.component.ts`
- [ ] Add `async signInWithGoogle()` method with loading/error state
- [ ] Add `ngOnInit()` lifecycle hook
  - [ ] Check for active session (OAuth callback scenario)
  - [ ] If session exists, call `authService.getCurrentUser()`
  - [ ] If user returned: redirect by role
  - [ ] If null: show error "Este correo no tiene acceso al sistema. Contacta al administrador."
- [ ] Add `googleError` signal for OAuth-specific errors

### 2.4 Update Login Template
- [ ] Modify `app-web/src/app/features/auth/components/login/login.component.html`
- [ ] Add visual separator ("o" divider) between password form and Google button
- [ ] Add Google sign-in button with Google "G" logo (SVG inline)
- [ ] Label: "Ingresar con Google"
- [ ] Click handler: `(click)="signInWithGoogle()"`
- [ ] Add error message display for OAuth errors
- [ ] Ensure accessibility (aria-label, focus states)

### 2.5 Update Login Styles
- [ ] Modify `app-web/src/app/features/auth/components/login/login.component.scss`
- [ ] Style Google button: white background, gray border, Google colors on hover
- [ ] Style separator line with "o" text
- [ ] Ensure responsive behavior on mobile

## Phase 3: Testing

### 3.1 AuthService Tests
- [ ] Create `app-web/src/app/core/services/auth.service.spec.ts`
- [ ] Test: `signInWithGoogle` calls `supabase.auth.signInWithOAuth` with `provider: 'google'`
  - [ ] Use `jest.spyOn` + `toHaveBeenCalledWith()` matcher
- [ ] Test: `getCurrentUser` signs out when profile not found
  - [ ] Mock `supabase.auth.getUser` to return Google user
  - [ ] Mock `supabase.from('profiles').select` to return empty
  - [ ] Verify `supabase.auth.signOut` was called + result is null
- [ ] Test: `getCurrentUser` signs out when `is_active = false`
  - [ ] Mock profile with `is_active: false`
  - [ ] Verify `signOut` was called + result is null
- [ ] Test: `getCurrentUser` returns user when profile exists and is active

### 3.2 LoginComponent Tests
- [ ] Create `app-web/src/app/features/auth/components/login/login.component.spec.ts`
- [ ] Test: Renders Google button in DOM (Testing Library `render()` + `screen.getByText()`)
- [ ] Test: Clicking Google button calls `authService.signInWithGoogle` (spy + `userEvent.click()`)
- [ ] Test: Displays error for unregistered user after OAuth callback
- [ ] Test: Redirects to correct route for valid Google user

### 3.3 Run All Tests
- [ ] Run `ng test` or `npm run test`
- [ ] Verify all new tests pass
- [ ] Verify existing tests still pass (no regressions)

## Phase 4: Verification & Polish

### 4.1 Manual Testing
- [ ] Start app with `ng serve`
- [ ] Navigate to `http://localhost:4200/login`
- [ ] Verify Google button is visible and styled correctly
- [ ] Click Google button → verify redirect to Google consent screen
- [ ] Test with unregistered Gmail → verify error message after redirect
- [ ] Test with registered, active Gmail → verify login and redirect
- [ ] Test with registered, inactive Gmail → verify deactivation error
- [ ] Verify existing email/password login still works

### 4.2 Code Review Checklist
- [ ] `supabase.ts` has `detectSessionInUrl: true`
- [ ] `AuthService.signInWithGoogle()` uses correct provider and redirectTo
- [ ] `AuthService.getCurrentUser()` handles missing profile gracefully
- [ ] No data from Google is written to `profiles` table
- [ ] Google button follows project styling conventions
- [ ] All tests are behavior-oriented (spies or DOM queries, not internal state)
- [ ] Error messages are user-friendly and in Spanish
