## ADDED Requirements

### Requirement: Employee can access their public booking link

The system SHALL provide the employee with quick access to their public booking link from the employee backoffice interface.

#### Scenario: Desktop access from calendar
- **WHEN** employee is on the calendar view (`/emp/calendar`)
- **THEN** system displays a "Copy Booking Link" button in the calendar header
- **AND** clicking the button copies the booking link to clipboard
- **AND** system shows a toast notification confirming "Link copiado al portapapeles"

#### Scenario: Mobile access via FAB
- **WHEN** employee is on any employee view on a mobile device (< 1024px width)
- **THEN** system displays a Floating Action Button (FAB) in the lower right corner
- **AND** clicking the FAB copies the booking link to clipboard
- **AND** system shows a toast notification confirming "Link copiado al portapapeles"

#### Scenario: Booking link format
- **WHEN** employee clicks the copy button (desktop or mobile)
- **THEN** system copies link with format `/c/<companySlug>/e/<employeeId>/book`
- **WHERE** `<companySlug>` is the employee's company slug
- **AND** `<employeeId>` is the employee's user ID

### Requirement: Button visibility by device type

The system SHALL show the appropriate UI element based on device type.

#### Scenario: Desktop view
- **WHEN** viewport width is >= 1024px
- **THEN** system shows the button in EmployeeCalendar header
- **AND** system hides the FAB

#### Scenario: Mobile view
- **WHEN** viewport width is < 1024px
- **THEN** system shows the FAB in EmployeeLayout
- **AND** system may also show the button in calendar header (both can be visible)

### Requirement: User feedback on copy action

The system SHALL provide clear feedback when the booking link is copied.

#### Scenario: Success feedback
- **WHEN** employee clicks the copy button (desktop or mobile)
- **AND** copy to clipboard succeeds
- **THEN** system displays a success toast message "Link copiado al portapapeles"
- **AND** toast auto-dismisses after 3 seconds

#### Scenario: Clipboard not supported
- **WHEN** employee clicks the copy button
- **AND** browser does not support clipboard API
- **THEN** system displays a fallback message with the link
- **AND** employee can manually copy the link