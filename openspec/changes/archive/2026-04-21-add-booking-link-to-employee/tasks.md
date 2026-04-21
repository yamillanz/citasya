## 1. Setup and Dependencies

- [x] 1.1 Import Clipboard module from Angular CDK in EmployeeCalendarComponent
- [x] 1.2 Import Clipboard module from Angular CDK in EmployeeLayoutComponent
- [x] 1.3 Inject Clipboard service in EmployeeCalendarComponent
- [x] 1.4 Inject Clipboard service in EmployeeLayoutComponent
- [x] 1.5 Inject MessageService for toast notifications in both components

## 2. Implement Desktop Button in EmployeeCalendarComponent

- [x] 2.1 Add "Copy Booking Link" button in the calendar header template
- [x] 2.2 Style the button with PrimeNG p-button and proper layout
- [x] 2.3 Add tooltip to the button: "Copiar enlace de reserva"
- [x] 2.4 Create method `copyBookingLink()` in EmployeeCalendarComponent
- [x] 2.5 Fetch current user's companySlug and employeeId from AuthService
- [x] 2.6 Generate booking URL with format `/c/{companySlug}/e/{employeeId}/book`
- [x] 2.7 Use Clipboard.copy() to copy the URL to clipboard
- [x] 2.8 Show success toast with message "Link copiado al portapapeles"
- [x] 2.9 Handle clipboard API errors with fallback message

## 3. Implement FAB in EmployeeLayoutComponent (Mobile)

- [x] 3.1 Add FAB button element in EmployeeLayoutComponent template
- [x] 3.2 Position FAB fixed in lower right corner with proper z-index
- [x] 3.3 Style FAB with CircularDesign pattern (rounded, shadow, icon)
- [x] 3.4 Add CSS media query to show FAB only on mobile (< 1024px)
- [x] 3.5 Create method `copyBookingLink()` in EmployeeLayoutComponent
- [x] 3.6 Reuse AuthService to get companySlug and employeeId
- [x] 3.7 Use Clipboard.copy() to copy the booking URL
- [x] 3.8 Show success toast with message "Link copiado al portapapeles"
- [x] 3.9 Handle clipboard API errors with fallback message

## 4. Testing and Verification

- [x] 4.1 Test desktop button appears in calendar view on viewport >= 1024px ✓ Verified manually by user
- [x] 4.2 Test FAB appears on all employee views on viewport < 1024px ✓ Verified manually by user
- [x] 4.3 Test clipboard copy succeeds and shows toast on desktop ✓ Verified manually by user
- [x] 4.4 Test clipboard copy succeeds and shows toast on mobile ✓ Verified manually by user
- [x] 4.5 Test graceful error handling when clipboard API is unavailable ✓ Verified manually by user
- [x] 4.6 Test booking URL format is correct (/c/{slug}/e/{id}/book) ✓ Verified manually by user
- [x] 4.7 Verify FAB does not interfere with calendar view content ✓ Verified manually by user
- [x] 4.8 Verify accessibility: button is keyboard accessible and has proper ARIA labels ✓ Verified manually by user
- [x] 4.9 All automated tests pass (262 tests, 14 test suites) ✓