# Phase 3: Design Document

## Architecture Overview

The Back Office Manager module extends the existing application with protected routes accessible only to authenticated users with manager role.

## Route Structure

```
/bo (lazy-loaded module)
├── /dashboard - Manager dashboard
├── /services - Services CRUD
│   └── /:id - Service form (new/edit)
├── /employees - Employees CRUD
│   └── /:id - Employee form (new/edit)
├── /appointments - Appointments list with filters
├── /calendar - Calendar view (future)
└── /close - Daily close interface
```

## Component Hierarchy

```
AppComponent
└── BackofficeComponent (layout with nav)
    ├── DashboardComponent
    ├── ServicesComponent
    │   └── ServiceFormComponent
    ├── EmployeesComponent
    │   └── EmployeeFormComponent
    ├── AppointmentsComponent
    ├── CalendarComponent (future)
    └── DailyCloseComponent
```

## State Management

- **Local State**: Each component manages its own loading and form states
- **Data State**: Services fetch data from Supabase on component initialization
- **User State**: AuthService provides current user context
- **No Global Store**: Keep it simple, fetch on demand

## Service Dependencies

```
DashboardComponent
├── AuthService (get current user)
└── AppointmentService (get today's appointments)

ServicesComponent
├── AuthService
└── ServiceService (CRUD operations)

EmployeesComponent
├── AuthService
├── UserService (employee CRUD)
└── ServiceService (for service assignment)

AppointmentsComponent
├── AuthService
├── AppointmentService
└── UserService (for employee filter)

DailyCloseComponent
├── AuthService
├── AppointmentService
└── DailyCloseService (generate PDF and save record)
```

## PrimeNG Component Mapping

| Feature | PrimeNG Components |
|---------|-------------------|
| Dashboard | p-card, p-button, p-divider, p-tag, p-avatar |
| Services List | p-card, p-button, p-confirmDialog |
| Service Form | p-inputText, p-inputNumber, p-button |
| Employees List | p-card, p-avatar, p-button, p-tag |
| Employee Form | p-inputText, p-checkbox, p-button |
| Appointments | p-card, p-dropdown, p-calendar, p-button, p-tag, p-inputNumber |
| Daily Close | p-calendar, p-card, p-table, p-button, p-messages |

## Authentication & Authorization

- Routes protected by AuthGuard
- Check user role on initialization
- Company ID from authenticated user context
- All data filtered by company_id

## Data Flow

1. **Component Init**:
   - Get current user from AuthService
   - Extract company_id
   - Fetch related data using services
   - Set loading = false

2. **Form Submission**:
   - Validate form
   - Call service method
   - Show loading state
   - Handle success/error
   - Navigate on success

3. **Status Updates**:
   - Immediate UI update for responsiveness
   - Background API call
   - Rollback on error

## Error Handling

- Show error messages in UI
- Log errors to console
- Graceful fallbacks (empty states)
- Retry capability for network errors

## Performance Considerations

- OnPush change detection
- Lazy loading for backoffice module
- Debounce filter inputs
- Pagination for large lists (future)

## Security

- All API calls authenticated via Supabase
- RLS policies ensure data isolation by company
- No sensitive data in client-side storage
- HTTPS only
