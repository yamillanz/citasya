## ADDED Requirements

### Requirement: PWA manifest icons must match brand favicon
All PNG icon files referenced in `manifest.webmanifest` MUST render the brand calendar icon (green `#9DC183` with white dots) instead of the Angular default shield.

#### Scenario: Android home screen installation
- **WHEN** a user installs the PWA on an Android device
- **THEN** the home screen icon MUST display the green calendar icon

#### Scenario: iOS "Add to Home Screen"
- **WHEN** a user adds the PWA to the iOS home screen
- **THEN** the icon MUST display the green calendar icon at the recommended 192×192 resolution

### Requirement: favicon.ico must match brand icon
The `favicon.ico` file MUST contain the same green calendar icon so that legacy browser requests to `/favicon.ico` do not return the Angular default icon.

#### Scenario: Direct favicon request
- **WHEN** a browser requests `/favicon.ico`
- **THEN** the returned file MUST display the green calendar icon

### Requirement: All required manifest sizes must be present
The following icon sizes MUST exist in `public/icons/` after the change: 72×72, 96×96, 128×128, 144×144, 152×152, 192×192, 384×384, 512×512.

#### Scenario: Manifest validation
- **WHEN** validating the manifest icon list
- **THEN** each `src` path in `manifest.webmanifest` MUST resolve to an existing PNG file with the brand icon
