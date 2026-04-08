## 1. Database Schema

- [x] 1.1 Create migration file `YYYYMMDD_create_appointment_services.sql`
- [x] 1.2 Define `appointment_services` table with `appointment_id`, `service_id`, `created_at`
- [x] 1.3 Add primary key constraint `PRIMARY KEY (appointment_id, service_id)`
- [x] 1.4 Add foreign key constraints with `ON DELETE CASCADE` for appointments and `ON DELETE RESTRICT` for services
- [x] 1.5 Create index `idx_appointment_services_appointment` on `appointment_id`
- [x] 1.6 Create index `idx_appointment_services_service` on `service_id`
- [x] 1.7 Enable RLS on `appointment_services` table
- [x] 1.8 Create RLS policy for SELECT (users can view services for their appointments)
- [x] 1.9 Create RLS policy for INSERT (public can insert for new appointments, users for their appointments)
- [x] 1.10 Create RLS policy for DELETE (users can delete for their appointments)
- [ ] 1.11 Run migration in development environment
- [ ] 1.12 Verify table structure in Supabase dashboard

## 2. Data Migration

- [x] 2.1 Create migration file `YYYYMMDD_populate_appointment_services.sql`
- [x] 2.2 Write script to copy data from `appointments.service_id` to `appointment_services`
- [x] 2.3 Add verification to check record counts match
- [ ] 2.4 Run migration in development environment
- [ ] 2.5 Verify all appointments have corresponding records in `appointment_services`
- [ ] 2.6 Create backup script `rollback_appointment_services.sql` to delete all records if needed

## 3. Backend Models

- [x] 3.1 Create `src/app/core/models/appointment-service.model.ts` with `AppointmentService` interface
- [x] 3.2 Update `Appointment` interface in `appointment.model.ts` to add `services?: Service[]`
- [x] 3.3 Add helper function `calculateTotalDuration(services: Service[]): number` to `appointment.model.ts`
- [x] 3.4 Add helper function `calculateTotalPrice(services: Service[]): number` to `appointment.model.ts`
- [x] 3.5 Add helper function `formatServicesList(services: Service[]): string` to `appointment.model.ts`
- [x] 3.6 Update `CreateAppointmentDto` to change `service_id: string` to `service_ids: string[]`
- [x] 3.7 Create `UpdateAppointmentServicesDto` interface in `appointment.model.ts`

## 4. Backend Services - AppointmentService

- [x] 4.1 Add private method `getServicesByIds(ids: string[]): Promise<Service[]>` to `AppointmentService`
- [x] 4.2 Add private method `flattenServices(appointment: any): Appointment` to transform Supabase response
- [x] 4.3 Update `create()` method to accept `service_ids` array and create `appointment_services` records
- [x] 4.4 Add validation in `create()` to ensure `service_ids` array is not empty
- [x] 4.5 Calculate total duration in `create()` before availability check
- [x] 4.6 Update availability validation in `create()` to use total duration
- [x] 4.7 Create transaction in `create()` to insert both appointment and appointment_services
- [x] 4.8 Update `getById()` to join with `appointment_services` and load services
- [x] 4.9 Apply `flattenServices()` transformation in `getById()`
- [x] 4.10 Update `getByEmployeeAll()` to join with `appointment_services`
- [x] 4.11 Apply `flattenServices()` transformation in `getByEmployeeAll()`
- [x] 4.12 Update `getByCompany()` to join with `appointment_services`
- [x] 4.13 Apply `flattenServices()` transformation in `getByCompany()`
- [x] 4.14 Update `getByDate()` to join with `appointment_services`
- [x] 4.15 Apply `flattenServices()` transformation in `getByDate()`
- [x] 4.16 Add `updateServices(appointmentId: string, serviceIds: string[]): Promise<Appointment>` method
- [x] 4.17 Add validation in `updateServices()` to ensure `serviceIds` array is not empty
- [x] 4.18 Add validation in `updateServices()` to check appointment status is `pending`
- [x] 4.19 Calculate total duration in `updateServices()` before availability check
- [x] 4.20 Update availability validation in `updateServices()` to exclude current appointment
- [x] 4.21 Update `checkAvailability()` to calculate duration for each existing appointment from its services
- [x] 4.22 Add `addMinutes()` helper method to `AppointmentService`
- [x] 4.23 Add `slotsOverlap()` helper method to `AppointmentService`
- [ ] 4.24 Write unit tests for `getServicesByIds()`
- [ ] 4.25 Write unit tests for `calculateTotalDuration()`
- [ ] 4.26 Write unit tests for `calculateTotalPrice()`
- [ ] 4.27 Write unit tests for `formatServicesList()`
- [ ] 4.28 Write unit tests for `create()` with multiple services
- [ ] 4.29 Write unit tests for `create()` validation (empty services)
- [ ] 4.30 Write unit tests for `updateServices()` success case
- [ ] 4.31 Write unit tests for `updateServices()` validation (empty services, wrong status)
- [ ] 4.32 Write unit tests for `checkAvailability()` with multiple services

## 5. UI Booking - EmployeeCalendarComponent

- [x] 5.1 Import `CheckboxModule` from PrimeNG in `employee-calendar.component.ts`
- [x] 5.2 Import `FormsModule` for ngModel in `employee-calendar.component.ts`
- [x] 5.3 Change service selection from dropdown to checkboxes in template
- [x] 5.4 Add `selectedServiceIds = signal<string[]>([])` to hold selected services
- [x] 5.5 Add `services = signal<Service[]>([])` to hold available services
- [x] 5.6 Create `totalDuration = computed()` to calculate total duration from selected services
- [x] 5.7 Create `totalPrice = computed()` to calculate total price from selected services
- [x] 5.8 Create `selectedServicesText = computed()` to format services as comma-separated text
- [x] 5.9 Add validation to check `selectedServiceIds().length > 0` before navigation
- [x] 5.10 Update `proceedToBooking()` to pass `serviceIds` as comma-separated query param
- [x] 5.11 Add summary section showing selected services, total duration, and total price
- [x] 5.12 Add subscription to load services from employee on init
- [x] 5.13 Update availability check to use `totalDuration()` instead of single service duration
- [ ] 5.14 Write component tests for service selection
- [ ] 5.15 Write component tests for duration/price calculations
- [ ] 5.16 Write component tests for navigation with service IDs

## 6. UI Booking - BookingFormComponent

- [x] 6.1 Import helper functions from `appointment.model.ts`
- [x] 6.2 Add `serviceIds = signal<string[]>([])` to hold service IDs from query params
- [x] 6.3 Add `selectedServices = signal<Service[]>([])` to hold service objects
- [x] 6.4 Add `totalDuration = computed()` using `calculateTotalDuration()`
- [x] 6.5 Add `totalPrice = computed()` using `calculateTotalPrice()`
- [x] 6.6 Parse `serviceIds` query param in `ngOnInit()` (split by comma)
- [x] 6.7 Load services by IDs using `loadServicesByIds()` method
- [x] 6.8 Update template to display list of services with name, duration, price
- [x] 6.9 Add total duration display in summary section
- [x] 6.10 Add total price display in summary section
- [x] 6.11 Update `onSubmit()` to pass `service_ids` array to `appointmentService.create()`
- [x] 6.12 Add error handling for empty services array
- [ ] 6.13 Write component tests for service loading from query params
- [ ] 6.14 Write component tests for duration/price display
- [ ] 6.15 Write component tests for form submission with multiple services

## 7. UI Backoffice - EmployeeHistoryComponent

- [ ] 7.1 Import helper functions from `appointment.model.ts` in `employee-history.component.ts`
- [ ] 7.2 Add `formatServices(services: Service[]): string` method
- [ ] 7.3 Add `calculateDuration(services: Service[]): number` method
- [ ] 7.4 Add `calculatePrice(services: Service[]): number` method
- [ ] 7.5 Add `getStatusSeverity(status: AppointmentStatus)` method for p-tag
- [ ] 7.6 Update template to display services as `{{ formatServices(apt.services) }}`
- [ ] 7.7 Add column for total duration: `{{ calculateDuration(apt.services) }} min`
- [ ] 7.8 Add column for total price: `${{ calculatePrice(apt.services) }}`
- [ ] 7.9 Update p-table columns to accommodate multiple services text
- [ ] 7.10 Handle empty/undefined services array gracefully
- [ ] 7.11 Write component tests for formatServices method
- [ ] 7.12 Write component tests for calculateDuration method
- [ ] 7.13 Write component tests for calculatePrice method

## 8. UI Backoffice - AppointmentDetailDialogComponent

- [ ] 8.1 Import helper functions from `appointment.model.ts`
- [ ] 8.2 Import `CheckboxModule` from PrimeNG
- [ ] 8.3 Add `availableServices = signal<Service[]>([])` to hold services offered by employee
- [ ] 8.4 Add `isEditingServices = signal(false)` to track edit mode
- [ ] 8.5 Add `editedServiceIds = signal<string[]>([])` to hold edited selection
- [ ] 8.6 Add `totalDuration = computed()` to calculate from appointment services
- [ ] 8.7 Add `totalPrice = computed()` to calculate from appointment services
- [ ] 8.8 Update template to display list of services in view mode
- [ ] 8.9 Add total duration and total price display
- [ ] 8.10 Add "Edit services" button visible only for `pending` appointments
- [ ] 8.11 Create edit mode section with checkboxes for all available services
- [ ] 8.12 Create `startEditServices()` method to load available services and enter edit mode
- [ ] 8.13 Pre-select current services in edit mode
- [ ] 8.14 Create `cancelEditServices()` method to exit edit mode
- [ ] 8.15 Create `saveServices()` method to call `appointmentService.updateServices()`
- [ ] 8.16 Validate at least one service is selected in `saveServices()`
- [ ] 8.17 Handle error for completed/cancelled appointments
- [ ] 8.18 Emit event to parent component after successful save
- [ ] 8.19 Add loading state during save operation
- [ ] 8.20 Add success/error toast messages
- [ ] 8.21 Write component tests for edit mode toggling
- [ ] 8.22 Write component tests for service selection in edit mode
- [ ] 8.23 Write component tests for save success/failure cases
- [ ] 8.24 Write component tests for validation (empty services)

## 9. UI Backoffice - AppointmentsComponent (Manager)

- [ ] 9.1 Import helper functions from `appointment.model.ts`
- [ ] 9.2 Add `formatServices(services: Service[]): string` method
- [ ] 9.3 Add `calculateDuration(services: Service[]): number` method
- [ ] 9.4 Add `calculatePrice(services: Service[]): number` method
- [ ] 9.5 Add `getStatusSeverity(status: AppointmentStatus)` method for p-tag
- [ ] 9.6 Update template to display services as `{{ formatServices(apt.services) }}`
- [ ] 9.7 Add column for total duration: `{{ calculateDuration(apt.services) }} min`
- [ ] 9.8 Add column for total price: `${{ calculatePrice(apt.services) }}`
- [ ] 9.9 Update p-table columns to accommodate multiple services text
- [ ] 9.10 Handle empty/undefined services array gracefully
- [ ] 9.11 Ensure detail dialog can be opened from appointment row
- [ ] 9.12 Write component tests for formatServices method
- [ ] 9.13 Write component tests for calculateDuration method
- [ ] 9.14 Write component tests for calculatePrice method

## 10. Integration Testing

- [ ] 10.1 Test complete booking flow with single service
- [ ] 10.2 Test complete booking flow with multiple services
- [ ] 10.3 Test service selection checkboxes update correctly
- [ ] 10.4 Test total duration updates in real-time
- [ ] 10.5 Test total price updates in real-time
- [ ] 10.6 Test availability validation with multiple services
- [ ] 10.7 Test appointment creation in database creates both records
- [ ] 10.8 Test viewing appointment shows all services
- [ ] 10.9 Test editing services on pending appointment
- [ ] 10.10 Test adding service to pending appointment
- [ ] 10.11 Test removing service from pending appointment
- [ ] 10.12 Test cannot edit services on completed appointment
- [ ] 10.13 Test cannot edit services on cancelled appointment
- [ ] 10.14 Test availability validation when editing services
- [ ] 10.15 Test rollback scenario with empty services array
- [ ] 10.16 Test employee history displays multiple services correctly
- [ ] 10.17 Test manager appointments list displays multiple services correctly
- [ ] 10.18 Test appointment detail dialog shows all services
- [ ] 10.19 Test responsive design on mobile for service display
- [ ] 10.20 Test error handling for network failures

## 11. Database Migration Scripts

- [ ] 11.1 Create script `scripts/migrate-appointment-services.ts` for manual migration
- [ ] 11.2 Add environment variable checks for Supabase URL and service key
- [ ] 11.3 Implement migration logic: fetch appointments, create appointment_services records
- [ ] 11.4 Add verification count check in migration script
- [ ] 11.5 Add rollback script `scripts/rollback-appointment-services.ts`
- [ ] 11.6 Test migration script in development environment
- [ ] 11.7 Test rollback script in development environment
- [ ] 11.8 Document migration process in README

## 12. Documentation

- [ ] 12.1 Update README.md with multiple services feature description
- [ ] 12.2 Document database schema changes in migration guide
- [ ] 12.3 Document API changes for `POST /appointments` endpoint
- [ ] 12.4 Document new `PATCH /appointments/:id/services` endpoint
- [ ] 12.5 Document helper functions in `appointment.model.ts`
- [ ] 12.6 Document `AppointmentService` methods for multiple services
- [ ] 12.7 Add comments to complex logic in services and components
- [ ] 12.8 Create ADR (Architecture Decision Record) for N:N relationship design
- [ ] 12.9 Update API documentation with new request/response formats
- [ ] 12.10 Add examples for common use cases in documentation

## 13. Deployment Preparation

- [ ] 13.1 Run all unit tests in CI/CD pipeline
- [ ] 13.2 Run all integration tests in CI/CD pipeline
- [ ] 13.3 Create migration PR for database changes
- [ ] 13.4 Create feature PR for backend changes
- [ ] 13.5 Create feature PR for frontend changes
- [ ] 13.6 Review PRs for breaking changes
- [ ] 13.7 Test migration in staging environment
- [ ] 13.8 Verify data integrity after staging migration
- [ ] 13.9 Create deployment checklist for production
- [ ] 13.10 Schedule deployment window with team
- [ ] 13.11 Prepare rollback plan for production deployment
- [ ] 13.12 Monitor logs after deployment for errors