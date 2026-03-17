## 1. Create Core Services

- [x] 1.1 Create CompanyService with getBySlug, getById, getAll, create, update methods
- [x] 1.2 Create UserService with getEmployeesByCompany, getByCompany, getById, create, update, delete methods
- [x] 1.3 Create ServiceService with getByCompany, getByEmployee, getById, create, update, delete methods
- [x] 1.4 Create ScheduleService with getByCompany, create, update, delete methods
- [x] 1.5 Create AppointmentService with getAvailableSlots and create methods

## 2. Create Company List Page

- [x] 2.1 Create CompanyListComponent with route parameter for companySlug
- [x] 2.2 Implement company loading by slug in ngOnInit
- [x] 2.3 Implement employee list loading for the company
- [x] 2.4 Create HTML template with company header and employee cards
- [x] 2.5 Create SCSS styles for company list page
- [x] 2.6 Add navigation links to employee calendar pages

## 3. Create Employee Calendar Page

- [x] 3.1 Create EmployeeCalendarComponent with route parameters
- [x] 3.2 Load company, employee, and services data
- [x] 3.3 Configure FullCalendar with dayGrid and timeGrid plugins
- [x] 3.4 Implement date selection handling
- [x] 3.5 Create service selection UI
- [x] 3.6 Create time slots grid display
- [x] 3.7 Implement navigation to booking form with query params
- [x] 3.8 Create HTML template and SCSS styles

## 4. Create Booking Form Page

- [x] 4.1 Create BookingFormComponent with route and query params
- [x] 4.2 Load company, employee, service from params
- [x] 4.3 Create reactive form with client_name, client_phone, client_email, notes
- [x] 4.4 Implement form validation (required fields)
- [x] 4.5 Create appointment on form submission
- [x] 4.6 Display success message after booking
- [x] 4.7 Create HTML template and SCSS styles

## 5. Add Public Routes

- [x] 5.1 Add route for `/c/:companySlug` → CompanyListComponent
- [x] 5.2 Add route for `/c/:companySlug/e/:employeeId` → EmployeeCalendarComponent
- [x] 5.3 Add route for `/c/:companySlug/e/:employeeId/book` → BookingFormComponent

## 6. Implement Slot Availability Logic

- [x] 6.1 Implement getAvailableSlots in AppointmentService
- [x] 6.2 Get employee schedule for the selected date
- [x] 6.3 Get existing appointments for the date
- [x] 6.4 Generate time slots based on schedule and service duration
- [x] 6.5 Filter out slots that overlap with existing appointments

## 7. Testing

- [ ] 7.1 Test company page with valid slug
- [ ] 7.2 Test company page with invalid slug (error handling)
- [ ] 7.3 Test employee calendar page loading
- [ ] 7.4 Test FullCalendar interaction
- [ ] 7.5 Test slot availability calculation
- [ ] 7.6 Test booking form validation
- [ ] 7.7 Test complete booking flow end-to-end
