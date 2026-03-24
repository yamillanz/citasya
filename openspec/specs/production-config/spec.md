# production-config Specification

## Purpose
TBD - created by archiving change phase-6-polish. Update Purpose after archive.
## Requirements
### Requirement: Environment Configuration
The system SHALL have proper environment configuration for development and production.

#### Scenario: Environment Files
- **WHEN** application runs in development
- **THEN** environment.ts SHALL be used with development API URL
- **AND** when application builds for production
- **THEN** environment.prod.ts SHALL be used with production API URL

#### Scenario: Environment Variables
- **WHEN** environment files are configured
- **THEN** they SHALL include: apiUrl, appName, version
- **AND** they SHALL NOT include secrets (those should be server-side)

### Requirement: Production Build Configuration
The system SHALL have optimized production build configuration.

#### Scenario: Production Build
- **WHEN** `npm run build` runs with production flag
- **THEN** AOT compilation SHALL be enabled
- **AND** production optimizations SHALL be applied (tree shaking, minification)
- **AND** sourcemaps SHALL NOT be included

#### Scenario: Build Output
- **WHEN** production build completes
- **THEN** output directory SHALL contain optimized bundles
- **AND** index.html SHALL reference correct bundle hashes

### Requirement: Application Metadata
The system SHALL display application version and environment info.

#### Scenario: App Version Display
- **WHEN** user views the application
- **THEN** footer SHALL display app version (from environment)
- **AND** in development mode, a "DEV" badge SHALL be visible

### Requirement: Error Handling in Production
The system SHALL have graceful error handling for production.

#### Scenario: Global Error Handler
- **WHEN** an unhandled error occurs in production
- **THEN** system SHALL log error to console
- **AND** user SHALL see a friendly error message
- **AND** system SHALL NOT expose internal error details

#### Scenario: 404 Handling
- **WHEN** user navigates to non-existent route
- **THEN** a 404 page SHALL be displayed with "Página no encontrada"
- **AND** a link to go home SHALL be provided

