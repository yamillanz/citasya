# booking-phone-validation Specification

## Purpose
TBD - created by archiving change require-phone-booking-form. Update Purpose after archive.
## Requirements
### Requirement: Phone field shall be mandatory in public booking contact form

The `client_phone` field in the public booking contact form SHALL be required. The form MUST NOT submit if the phone field is empty or contains fewer than 10 digits.

#### Scenario: User leaves phone field empty
- **WHEN** the user fills name and email but leaves phone empty
- **THEN** the form shows an error message "Este campo es requerido" below the phone field and submission is blocked

#### Scenario: User enters phone with fewer than 10 digits
- **WHEN** the user enters a phone number with fewer than 10 digits
- **THEN** the form shows an error message "El teléfono debe tener al menos 10 dígitos" and submission is blocked

#### Scenario: User enters valid phone number
- **WHEN** the user enters a phone number with 10 or more digits
- **THEN** the phone field is considered valid and the form can be submitted

#### Scenario: User attempts to submit with empty phone
- **WHEN** the user clicks "Confirmar Reserva" with an empty phone field
- **THEN** the phone field is marked as touched and displays the required error message

### Requirement: Contact form header text shall reflect phone as required

The contact form step header SHALL indicate that the phone field is mandatory, removing any text that suggests phone is optional or that email can replace it.

#### Scenario: User views contact form step
- **WHEN** the user navigates to the contact form step
- **THEN** the subtitle indicates that phone is required (not "al menos un teléfono o email")

