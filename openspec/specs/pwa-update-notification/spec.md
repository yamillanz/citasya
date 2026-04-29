# pwa-update-notification Specification

## Purpose
TBD - created by archiving change pwa-conversion. Update Purpose after archive.
## Requirements
### Requirement: New Version Detection
The application SHALL detect when a new version has been deployed and is ready for activation.

#### Scenario: New version detected after deployment
- **WHEN** a new production build is deployed while a user has the application open
- **THEN** the service worker SHALL detect the new version and emit a `VersionReadyEvent` through `SwUpdate.versionUpdates`

#### Scenario: No notification for same version
- **WHEN** the service worker checks for updates and the deployed version matches the current version
- **THEN** no update notification SHALL be shown to the user

### Requirement: Update Notification via Toast
When a new version is ready, the application SHALL display a non-blocking Toast notification offering the user the option to update.

#### Scenario: Toast displayed for new version
- **WHEN** a `VersionReadyEvent` is emitted by `SwUpdate`
- **THEN** a PrimeNG Toast notification SHALL appear with the message "Nueva versión disponible" and an action button labeled "Actualizar"

#### Scenario: User chooses to update
- **WHEN** the user clicks the "Actualizar" action on the update Toast
- **THEN** the application SHALL activate the new version via `SwUpdate.activateUpdate()` and then reload the page

#### Scenario: User dismisses the Toast
- **WHEN** the user dismisses or ignores the update Toast
- **THEN** the application SHALL continue running the current version, and the new version SHALL activate on the next page reload

### Requirement: Update Service Initialization
The update notification service SHALL be initialized at application startup.

#### Scenario: Service starts listening on bootstrap
- **WHEN** the Angular application bootstraps
- **THEN** the PWA update service SHALL be instantiated and begin listening for `SwUpdate.versionUpdates` events

#### Scenario: Service disabled in development
- **WHEN** the application is running in development mode (service worker not registered)
- **THEN** the update service SHALL gracefully handle the absence of the service worker without errors

