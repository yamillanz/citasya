# Tasks: Daily Close Hybrid Panel

## 1. Data Layer

- [x] 1.1 Add `getByDateWithEmployeeAndService` method to `AppointmentService` if not exists - fetches appointments with employee and service joins for a specific date
- [x] 1.2 Add `getEmployeesMap` method to `UserService` or create computed signal with employee data indexed by id

## 2. Component Structure

- [x] 2.1 Create signal-based state in `DailyCloseComponent`:
  - `selectedDate = signal(new Date())`
  - `selectedEmployee = signal<User | null>(null)`
  - `searchQuery = signal('')`
  - `appointments = signal<Appointment[]>([])`
  - `loading = signal(false)`
  - `error = signal<string | null>(null)`
- [x] 2.2 Create computed signals:
  - `employees` - unique employees from appointments
  - `filteredEmployees` - filtered by search query
  - `appointmentsByEmployee` - appointments for selected employee
  - `employeeStats` - totals per employee (amount, completed, pending)
  - `dayStats` - global day totals

## 3. Template - Left Panel (Employee List)

- [x] 3.1 Add date navigation header with:
  - Previous day button (←)
  - Date picker (p-datepicker)
  - Next day button (→)
- [x] 3.2 Add search input with PrimeNG `p-inputText` and search icon
- [x] 3.3 Create scrollable employee list container with `max-height` and `overflow-y: auto`
- [x] 3.4 Create employee list item component/template with:
  - Employee name
  - Subtotal amount
  - Citas count (completed/total)
  - Progress indicator (optional)
  - Selection highlight state
- [x] 3.5 Add click handler to select employee and update `selectedEmployee` signal
- [x] 3.6 Add empty state when no employees found

## 4. Template - Right Panel (Appointments Detail)

- [x] 4.1 Create appointment list container
- [x] 4.2 Add header with selected employee name and total
- [x] 4.3 Create appointment card with:
  - Time badge
  - Client name
  - Service name
  - Status badge
  - Amount collected (if completed)
  - Action buttons (Completar, No Asistió, Cancelar)
- [x] 4.4 Add empty state when no appointments for selected employee

## 5. Close Appointment Actions

- [x] 5.1 Create "Completar" action handler:
  - Open drawer/modal for amount input
  - Validate amount is required and positive
  - Call `appointmentService.updateStatus(id, 'completed', amount)`
  - Refresh appointments signal
  - Show success toast
- [x] 5.2 Create drawer component for amount input:
  - Show client, service, suggested price
  - Amount input field (p-inputNumber)
  - Confirm and Cancel buttons
- [x] 5.3 Create "No Asistió" action handler:
  - Show confirmation dialog
  - Call `appointmentService.updateStatus(id, 'no_show')`
  - Refresh appointments signal
  - Show success toast
- [x] 5.4 Create "Cancelar" action handler:
  - Show confirmation dialog
  - Call `appointmentService.updateStatus(id, 'cancelled')`
  - Refresh appointments signal
  - Show success toast

## 6. Summary Bar (Bottom)

- [x] 6.1 Add fixed bottom bar with day totals:
  - Total amount
  - Total appointments
  - Completed count
  - Progress bar (visual)
- [x] 6.2 Add "Generar Cierre" button that triggers PDF generation

## 7. Date Navigation Logic

- [x] 7.1 Implement `navigateToPreviousDay()` - decrement date by 1 day and reload data
- [x] 7.2 Implement `navigateToNextDay()` - increment date by 1 day and reload data (max today)
- [x] 7.3 Implement `selectDate(date)` - set date and reload data
- [x] 7.4 Disable next button if date is today (no future dates)

## 8. Data Loading

- [x] 8.1 Create `loadAppointments(date)` method:
  - Set loading to true
  - Clear selected employee
  - Fetch appointments for date
  - Fetch employees map
  - Set appointments signal
  - Set loading to false
  - Handle errors
- [x] 8.2 Call `loadAppointments` on component init with today's date
- [x] 8.3 Call `loadAppointments` on date navigation

## 9. Styles

- [x] 9.1 Define CSS variables for panel widths (left: 30%, right: 70%)
- [x] 9.2 Style employee list with:
  - Scrollable container
  - Hover and selection states
  - Totals alignment
- [x] 9.3 Style appointment cards with:
  - Status badge colors (pending: gray, completed: green, no_show: red, cancelled: orange)
  - Action buttons layout
- [x] 9.4 Add responsive styles:
  - Collapse left panel on mobile (<768px)
  - Show employee list as drawer or overlay on mobile

## 10. PDF Generation Integration

- [x] 10.1 Keep existing "Generar Cierre" button from `DailyCloseService.generateDailyClose`
- [x] 10.2 Add check for already closed day - show warning if day has existing close record
- [x] 10.3 Pass current date and appointments to PDF generator
- [x] 10.4 Show success toast after PDF generation

## 11. Testing

- [x] 11.1 Test employee list loads and displays correctly
- [x] 11.2 Test search filters employees by name
- [x] 11.3 Test selecting employee shows their appointments
- [x] 11.4 Test completing appointment updates amount and status
- [x] 11.5 Test marking as "No Asistió" updates status
- [x] 11.6 Test canceling appointment updates status
- [x] 11.7 Test date navigation loads correct appointments
- [x] 11.8 Test totals update correctly when appointments change
- [x] 11.9 Test PDF generation with current data
- [x] 11.10 Test responsive layout on mobile viewport

## 12. Type Safety

- [x] 12.1 Ensure all signals are properly typed
- [x] 12.2 Create interface for `EmployeeStats` if needed
- [x] 12.3 Create interface for `DayStats` if needed
- [x] 12.4 Add null checks for optional fields