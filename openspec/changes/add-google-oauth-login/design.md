# Design: Add Google OAuth Login

## Architecture Decisions

### OAuth Flow: Implicit (not PKCE)
- **Chosen**: Implicit flow via `supabase.auth.signInWithOAuth()`
- **Why**: This is a Single Page Application (Angular) without Server-Side Rendering. PKCE requires a server endpoint to exchange the authorization code for tokens. Supabase handles implicit flow securely for SPAs by returning tokens in the URL fragment.
- **Alternative considered**: PKCE with a callback route handler. Rejected because it requires backend infrastructure we don't have.

### Email-Only Validation, No Data Sync
- **Chosen**: Validate only that the Google email exists in `profiles`. Do NOT sync Google profile data (name, photo) into `profiles`.
- **Why**: 1. Admin wants full control over user data. 2. Prevents accidental overwrites of administratively-managed fields. 3. Maintains separation between Google identity and business profile.
- **Trade-off**: Users may see their Google name in the auth session but the app will display the name from `profiles`.

### Reuse Existing getCurrentUser() for Validation
- **Chosen**: Use the existing `getCurrentUser()` method to validate ALL login types (email/password and Google).
- **Why**: Single point of truth for access control. No code duplication. If we need to change validation logic, we change it in one place.

### detectSessionInUrl: true
- **Chosen**: Change from `false` to `true` permanently in `supabase.ts`.
- **Why**: Required for Supabase to automatically detect and establish the session when Google redirects back with tokens in the URL hash.
- **Impact**: Does NOT affect email/password login. Only activates when tokens are present in the URL.

### No Automatic Profile Creation
- **Chosen**: If a Google-authenticated user does not exist in `profiles`, reject access immediately.
- **Why**: Preserves the existing admin-controlled access model. The admin must continue creating users manually.

## Data Flow

```
User clicks "Ingresar con Google"
  ↓
LoginComponent.signInWithGoogle()
  ↓
AuthService.signInWithGoogle()
  ↓
supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: origin + '/login' } })
  ↓
Browser redirects to Google Consent Screen
  ↓
User selects account and authorizes
  ↓
Google redirects to: http://localhost:4200/login#access_token=xxx&refresh_token=yyy
  ↓
supabase.ts (detectSessionInUrl: true) auto-detects tokens and establishes session
  ↓
LoginComponent.ngOnInit() detects active session
  ↓
AuthService.getCurrentUser()
  ↓
  ├─→ supabase.auth.getUser() → gets auth user (includes email)
  ├─→ supabase.from('profiles').select('*').eq('id', userId).single()
  │     ├─→ No record found → signOut() → return null → show error
  │     └─→ Record found → check is_active
  │           ├─→ is_active = false → signOut() → return null → show error
  │           └─→ is_active = true → return User → redirect by role
  ↓
Redirect to role-appropriate dashboard
```

## File Changes

| File | Action | Purpose |
|------|--------|---------|
| `app-web/src/app/core/services/auth.service.ts` | modified | Add `signInWithGoogle()`, handle missing profile in `getCurrentUser()` |
| `app-web/src/app/core/supabase.ts` | modified | Change `detectSessionInUrl: false → true` |
| `app-web/src/app/features/auth/components/login/login.component.ts` | modified | Add `signInWithGoogle()` method, handle OAuth callback in `ngOnInit()` |
| `app-web/src/app/features/auth/components/login/login.component.html` | modified | Add Google button, separator, error message for unauthorized access |
| `app-web/src/app/features/auth/components/login/login.component.scss` | modified | Style Google button (white bg, gray border, Google colors) |
| `app-web/src/app/core/services/auth.service.spec.ts` | new | Behavior-oriented tests for `signInWithGoogle` and `getCurrentUser` with missing profile |
| `app-web/src/app/features/auth/components/login/login.component.spec.ts` | new | Behavior-oriented tests for Google button rendering and click handling |

## Testing Strategy

### Philosophy: Test Behavior, Not Implementation
1. **1st priority**: `toHaveBeenCalledWith()` and derivatives — verify methods/spies are called with correct arguments.
2. **2nd priority**: Render with Testing Library — render component and evaluate DOM.
3. **3rd priority**: `toBe()` / `toEqual()` — only for primitive values when no behavior to verify.

### AuthService Tests
```typescript
// TEST: signInWithGoogle calls supabase.auth.signInWithOAuth with correct params
it('debe llamar a signInWithOAuth con provider google', async () => {
  const spy = jest.spyOn(supabase.auth, 'signInWithOAuth');
  await authService.signInWithGoogle();
  expect(spy).toHaveBeenCalledWith({
    provider: 'google',
    options: { redirectTo: expect.any(String) }
  });
});

// TEST: getCurrentUser signs out when profile not found
it('debe cerrar sesion cuando el usuario no existe en profiles', async () => {
  jest.spyOn(supabase.auth, 'getUser').mockResolvedValue({
    data: { user: { id: 'google-user-id', email: 'unknown@gmail.com' } },
    error: null
  });
  jest.spyOn(supabase, 'from').mockReturnValue({
    select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } }) }) })
  } as any);
  const signOutSpy = jest.spyOn(supabase.auth, 'signOut').mockResolvedValue({ error: null });
  const result = await authService.getCurrentUser();
  expect(signOutSpy).toHaveBeenCalled();
  expect(result).toBeNull();
});

// TEST: getCurrentUser signs out when is_active = false
it('debe cerrar sesion cuando is_active es false', async () => {
  jest.spyOn(supabase.auth, 'getUser').mockResolvedValue({
    data: { user: { id: 'user-id', email: 'inactive@gmail.com' } },
    error: null
  });
  jest.spyOn(supabase, 'from').mockReturnValue({
    select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { id: 'user-id', is_active: false }, error: null }) }) })
  } as any);
  const signOutSpy = jest.spyOn(supabase.auth, 'signOut').mockResolvedValue({ error: null });
  const result = await authService.getCurrentUser();
  expect(signOutSpy).toHaveBeenCalled();
  expect(result).toBeNull();
});
```

### LoginComponent Tests
```typescript
// TEST: Renders Google button
it('debe mostrar el boton de Ingresar con Google', async () => {
  await render(LoginComponent);
  expect(screen.getByText(/Ingresar con Google/i)).toBeInTheDocument();
});

// TEST: Clicking Google button calls authService.signInWithGoogle
it('debe llamar a signInWithGoogle al hacer click en el boton', async () => {
  const authService = TestBed.inject(AuthService);
  const spy = jest.spyOn(authService, 'signInWithGoogle').mockResolvedValue();
  await render(LoginComponent);
  const googleButton = screen.getByText(/Ingresar con Google/i);
  await userEvent.click(googleButton);
  expect(spy).toHaveBeenCalled();
});

// TEST: Displays error for unregistered user after OAuth callback
it('debe mostrar error cuando el usuario no esta registrado', async () => {
  const authService = TestBed.inject(AuthService);
  jest.spyOn(authService, 'getCurrentUser').mockResolvedValue(null);
  await render(LoginComponent);
  expect(screen.getByText(/Este correo no tiene acceso al sistema/i)).toBeInTheDocument();
});
```

## Configuration Guide

### Step 1: Google Cloud Console Setup

#### 1.1 Create or Select a Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" if needed, name it (e.g., "CitasYa Auth")
3. Select the project

#### 1.2 Configure OAuth Consent Screen
1. Navigate: **APIs & Services > OAuth consent screen**
2. Select **User Type**: "External" (or "Internal" for Google Workspace)
3. Click "Create"
4. Fill in: App name "CitasYa", support email, developer contact
5. Click "Save and Continue"
6. On **Scopes**: add `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`
7. Click "Save and Continue"
8. On **Test Users**: add your Gmail address as test user
9. Click "Save and Continue", review, "Back to Dashboard"

#### 1.3 Create OAuth 2.0 Credentials
1. Navigate: **APIs & Services > Credentials**
2. Click "Create Credentials" > "OAuth client ID"
3. **Application type**: "Web application"
4. Name: "CitasYa Web Client"
5. **Authorized JavaScript origins**:
   - `http://localhost:4200` (dev)
   - `https://your-production-domain.com` (prod)
6. **Authorized redirect URIs**:
   - `https://jrjtkmacpxstihvqaacz.supabase.co/auth/v1/callback`
7. Click "Create"
8. **Save Client ID and Client Secret** securely

### Step 2: Supabase Dashboard Setup

#### 2.1 Enable Google Provider
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. **Authentication > Providers > Google**
4. Toggle **Enable Sign in with Google** ON

#### 2.2 Enter Google Credentials
1. Paste **Client ID** into "Client ID (for OAuth)"
2. Paste **Client Secret** into "Client Secret"
3. Click "Save"

#### 2.3 Configure Redirect URLs
1. **Authentication > URL Configuration**
2. **Site URL**: your production URL
3. **Redirect URLs**: add `http://localhost:4200/**` and `https://your-domain.com/**`
4. Click "Save"

### Troubleshooting

| Problem | Solution |
|---------|----------|
| "redirect_uri_mismatch" | Check redirect URI matches EXACTLY between Google Console and Supabase |
| "Unauthorized" error | Add your email as "Test user" in Google Console (Testing mode) |
| Tokens not detected on callback | Verify `detectSessionInUrl: true` in `supabase.ts` |
| "This app isn't verified" | Needs brand verification (takes days). Use test users during development. |
