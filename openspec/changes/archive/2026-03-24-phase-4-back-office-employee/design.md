# Phase 4: Design Document

## Architecture Overview

The Back Office Employee module provides restricted access to employees, showing only their personal appointments and history.

## Route Structure

```
/emp (lazy-loaded module)
├── /calendar - Employee calendar view
└── /history - Appointment history
```

## Component Hierarchy

```
AppComponent
└── EmployeeLayoutComponent (layout with nav)
    ├── EmployeeCalendarComponent
    └── EmployeeHistoryComponent
```

## Route Protection

- Routes protected by `employeeGuard`
- User must have role: 'employee' (manager/superadmin also have access via shared guard)
- All data filtered by `employee_id` from authenticated user session

## State Management

- **Local State**: Each component manages its own loading and filter states
- **Data State**: Services fetch data filtered by current employee
- **User State**: AuthService provides current user context
- **No Global Store**: Keep it simple, fetch on demand

## Service Dependencies

```
EmployeeCalendarComponent
├── AuthService (get current user)
├── AppointmentService (getByEmployee)
└── UserService (get employee details)

EmployeeHistoryComponent
├── AuthService
├── AppointmentService (getByEmployee with status filter)
└── UserService
```

## PrimeNG Component Mapping

| Feature | PrimeNG Components |
|---------|-------------------|
| Calendar | p-card, FullCalendar, p-tag |
| History List | p-card, p-table, p-paginator, p-tag |
| Layout | p-sidebar, p-button, p-avatar |

## Authentication & Authorization

- Routes protected by AuthGuard + employeeGuard
- Employee ID extracted from authenticated user
- All data filtered by employee_id
- Manager/Superadmin can also access (shared component)

## Data Flow

1. **Component Init**:
   - Get current user from AuthService
   - Extract employee_id
   - Fetch appointments using filtered query
   - Set loading = false

2. **Calendar View**:
   - Load appointments for visible date range
   - Display as calendar events
   - Click event to show details

3. **History View**:
   - Load completed appointments
   - Apply date range filter
   - Paginate results

## Error Handling

- Show error messages in UI
- Log errors to console
- Graceful fallbacks (empty states)
- Retry capability for network errors

## Performance Considerations

- OnPush change detection
- Lazy loading for employee module
- Debounce filter inputs
- Pagination for history (10 items per page)
