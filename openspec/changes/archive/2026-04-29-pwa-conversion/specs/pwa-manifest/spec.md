## ADDED Requirements

### Requirement: Web App Manifest
The application SHALL provide a valid `manifest.webmanifest` file that enables PWA installation on supported browsers.

#### Scenario: Manifest detected by browser
- **WHEN** a user visits the application in a PWA-compatible browser (Chrome, Edge, Samsung Internet)
- **THEN** the browser SHALL detect the manifest and offer an "Install app" prompt

#### Scenario: Manifest contains required metadata
- **WHEN** the manifest is parsed by the browser
- **THEN** it SHALL contain the fields `name` ("holacitas"), `short_name` ("holacitas"), `start_url` ("/"), `display` ("standalone"), `theme_color` ("#9DC183"), and `background_color` ("#FAF8F5")

#### Scenario: PWA opens in standalone mode
- **WHEN** a user launches the installed PWA from their home screen or app drawer
- **THEN** the application SHALL open in standalone display mode without browser chrome (address bar, tabs)

### Requirement: PWA Icons
The manifest SHALL reference PNG icons in multiple resolutions suitable for various devices and platforms.

#### Scenario: Icons available in required sizes
- **WHEN** the manifest is inspected
- **THEN** it SHALL reference icon files at 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, and 512x512 pixel dimensions

#### Scenario: Icon displayed on home screen
- **WHEN** a user installs the PWA on their device
- **THEN** the app icon SHALL be displayed correctly on the home screen or app drawer using the icon that matches the device's resolution

### Requirement: iOS Meta Tags
The application's `index.html` SHALL include Apple-specific meta tags for proper PWA behavior on iOS Safari.

#### Scenario: iOS standalone mode
- **WHEN** a user adds the application to their iOS home screen via Safari
- **THEN** the meta tag `apple-mobile-web-app-capable` SHALL be set to `yes`, enabling standalone mode without Safari chrome

#### Scenario: iOS status bar styling
- **WHEN** the PWA is opened on iOS
- **THEN** the `apple-mobile-web-app-status-bar-style` meta tag SHALL be `default`, and the `theme-color` meta tag SHALL be `#9DC183`

#### Scenario: iOS home screen icon
- **WHEN** a user adds the application to their iOS home screen
- **THEN** the `apple-touch-icon` link SHALL reference the 192x192 icon as the home screen icon

### Requirement: Theme Color Meta Tag
The `index.html` SHALL include a `theme-color` meta tag for browser toolbar and status bar coloring.

#### Scenario: Browser toolbar matches brand color
- **WHEN** the application is loaded in a supported mobile browser (Chrome for Android, Safari, etc.)
- **THEN** the browser toolbar SHALL use the theme color `#9DC183` (Sage green)

### Requirement: Noscript Fallback
The `index.html` SHALL include a `<noscript>` fallback message for users with JavaScript disabled.

#### Scenario: JavaScript disabled
- **WHEN** a user visits the application with JavaScript disabled in their browser
- **THEN** the page SHALL display a message indicating that JavaScript is required to use the application
