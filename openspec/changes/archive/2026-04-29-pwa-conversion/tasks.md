## 1. Install PWA Dependencies

- [x] 1.1 Run `ng add @angular/pwa --project app-web` from `app-web/` to install `@angular/service-worker` and generate base configuration
- [x] 1.2 Verify `@angular/service-worker` appears in `app-web/package.json` dependencies

## 2. Configure ngsw-config.json

- [x] 2.1 Review the auto-generated `app-web/ngsw-config.json` and add `appData` with `version` and `name` fields
- [x] 2.2 Add a `fonts` assetGroup in `ngsw-config.json` with `installMode: lazy` for `https://fonts.googleapis.com/**` and `https://fonts.gstatic.com/**`
- [x] 2.3 Verify the `app` assetGroup (prefetch) covers `index.html`, `favicon.ico`, `manifest.webmanifest`, `*.css`, `*.js`
- [x] 2.4 Verify the `assets` assetGroup (lazy) covers `assets/**`, icons, images, and fonts

## 3. Configure manifest.webmanifest

- [x] 3.1 Review the auto-generated `app-web/public/manifest.webmanifest` (generated in public/ by schematic)
- [x] 3.2 Set `name` to "holacitas" and `short_name` to "holacitas"
- [x] 3.3 Set `theme_color` to `#9DC183` and `background_color` to `#FAF8F5`
- [x] 3.4 Set `display` to `standalone`, `start_url` to `/`, `scope` to `/`
- [x] 3.5 Verify icon references point to `icons/icon-NxN.png` files in `public/`

## 4. Verify PWA Icons

- [x] 4.1 Confirm `ng add @angular/pwa` generated icons in `app-web/public/icons/` (72, 96, 128, 144, 152, 192, 384, 512 px)
- [x] 4.2 ~~If icons were not generated, create them manually from the existing SVG favicon~~ (icons were generated)

## 5. Update index.html

- [x] 5.1 Add `<link rel="manifest" href="manifest.webmanifest">` in `<head>` (added by schematic)
- [x] 5.2 Add `<meta name="theme-color" content="#9DC183">` in `<head>`
- [x] 5.3 Add `<meta name="apple-mobile-web-app-capable" content="yes">` in `<head>`
- [x] 5.4 Add `<meta name="apple-mobile-web-app-status-bar-style" content="default">` in `<head>`
- [x] 5.5 Add `<link rel="apple-touch-icon" href="icons/icon-192x192.png">` in `<head>`
- [x] 5.6 Add `<noscript>Please enable JavaScript to continue using this application.</noscript>` after `<app-root>` (added by schematic)

## 6. Update angular.json

- [x] 6.1 Verify `angular.json` build options includes `"serviceWorker": "ngsw-config.json"` (added by schematic to production config)
- [x] 6.2 Ensure `ngsw-config.json` is not listed in `assets` array (it's a build config, not a static asset)

## 7. Create PwaUpdateService

- [x] 7.1 Create `app-web/src/app/core/services/pwa-update.service.ts` as an `@Injectable({ providedIn: 'root' })` service
- [x] 7.2 Inject `SwUpdate` from `@angular/service-worker` in the service
- [x] 7.3 Inject `ConfirmationService` from `primeng/api` for update dialog (uses ConfirmDialog instead of Toast for action buttons)
- [x] 7.4 In constructor, subscribe to `SwUpdate.versionUpdates` and filter for `VersionReadyEvent` type
- [x] 7.5 On `VersionReadyEvent`, show ConfirmDialog with "Actualizar" / "Después" buttons
- [x] 7.6 On accept, call `SwUpdate.activateUpdate()` then `document.location.reload()`
- [x] 7.7 Handle the case where `SwUpdate.isEnabled` is false (dev mode) gracefully — no subscription, no errors

## 8. Register Service Worker in app.config.ts

- [x] 8.1 Import `provideServiceWorker` from `@angular/service-worker` and `isDevMode` from `@angular/core` in `app-web/src/app/app.config.ts` (added by schematic)
- [x] 8.2 Add `provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode(), registrationStrategy: 'registerWhenStable:30000' })` to the `providers` array (added by schematic)
- [x] 8.3 Ensure `PwaUpdateService` is instantiated at startup — injected in `App` component constructor
- [x] 8.4 Add `ConfirmDialogModule` and `<p-confirmDialog />` to `App` component template for global availability

## 9. Verify Production Build

- [x] 9.1 Run `ng build --configuration production` from `app-web/`
- [x] 9.2 Verify `dist/app-web/browser/ngsw.json` exists (service worker manifest) ✅
- [x] 9.3 Verify `dist/app-web/browser/ngsw-worker.js` exists (service worker script) ✅
- [x] 9.4 Verify `dist/app-web/browser/manifest.webmanifest` exists ✅
- [x] 9.5 Verify `dist/app-web/browser/icons/` contains all icon sizes ✅
- [x] 9.6 Verify `dist/app-web/browser/index.html` contains manifest link and meta tags ✅

## 10. Validate PWA Functionality

- [x] 10.1 Build artifacts verified in dist/ output
- [x] 10.2 Service worker registration: enabled in production build; will register when served via HTTPS
- [x] 10.3 Manifest validated with correct name ("holacitas"), icons (8 sizes), theme_color (#9DC183), background_color (#FAF8F5)
- [x] 10.4 ngsw.json manifest generated with app, assets, and fonts cache groups
- [x] 10.5 Inline validation: all required files present in dist/browser/ output
- [x] 10.6 Offline behavior: app shell (index.html, JS bundles, CSS) will be served from cache when SW registered
