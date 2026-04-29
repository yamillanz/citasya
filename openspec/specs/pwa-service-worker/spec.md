# pwa-service-worker Specification

## Purpose
TBD - created by archiving change pwa-conversion. Update Purpose after archive.
## Requirements
### Requirement: Service Worker Registration
The application SHALL register an Angular service worker that caches static assets for offline availability of the app shell.

#### Scenario: First visit with network connection
- **WHEN** a user visits the application for the first time with an active internet connection
- **THEN** the service worker SHALL register successfully and precache essential app shell files (index.html, favicon.ico, manifest.webmanifest, JavaScript bundles, CSS stylesheets)

#### Scenario: Subsequent visit without network connection
- **WHEN** a user revisits the application without an internet connection after a previous successful visit
- **THEN** the service worker SHALL serve the cached app shell, displaying the application UI and navigation structure

#### Scenario: Service worker registration in production only
- **WHEN** the application is built and served in production mode
- **THEN** the service worker SHALL be registered and active
- **WHEN** the application runs in development mode
- **THEN** the service worker SHALL NOT be registered

### Requirement: Static Asset Caching
The service worker SHALL cache static assets in two tiers: app shell (prefetch) and non-critical assets (lazy).

#### Scenario: App shell prefetch on install
- **WHEN** the service worker is installed for the first time
- **THEN** it SHALL prefetch and cache index.html, favicon.ico, manifest.webmanifest, all .js bundles, and all .css files

#### Scenario: Lazy caching of images and fonts
- **WHEN** the application requests an image or icon asset for the first time
- **THEN** the service worker SHALL cache it lazily (on first request) for subsequent offline access

### Requirement: Google Fonts Caching
The service worker SHALL cache Google Fonts CDN resources to make DM Sans and Fraunces typefaces available offline.

#### Scenario: Fonts cached on first load with network
- **WHEN** the application loads Google Fonts from fonts.googleapis.com and fonts.gstatic.com with an active network connection
- **THEN** the fonts SHALL be cached by the service worker for offline use

#### Scenario: Fonts served from cache offline
- **WHEN** the application loads without a network connection after fonts have been cached
- **THEN** the cached font files SHALL be served, displaying text in DM Sans and Fraunces as designed

