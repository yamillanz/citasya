## Context

The employee history page currently displays completed appointments in a PrimeNG table with date filters. Employees need enhanced functionality to better manage their appointment history, including global search, detailed views, and data export.

**Current State:**
- Basic table with date range filters (from/to)
- Client name and phone displayed inline
- Amount collected column
- Status tag (completed/pending/cancelled/no_show)
- Pagination with 10/25/50 rows per page

**Constraints:**
- Must use PrimeNG components exclusively
- Must follow Angular 20+ best practices (standalone components, signals, OnPush)
- Must integrate with existing `AppointmentService`
- Must maintain current color scheme (Verde Salvia #9DC183)

## Goals / Non-Goals

**Goals:**
- Add global search across client name, service, and notes
- Implement appointment detail modal for complete information
- Add table column sorting functionality
- Improve client information accessibility
- Maintain current filter functionality (date range)

**Non-Goals:**
- Real-time appointment updates (out of scope)
- Calendar view integration (separate feature)
- Appointment editing functionality (separate feature)
- Multi-select operations (future enhancement)

## Decisions

### 1. Global Search Implementation
**Decision:** Use client-side filtering with computed signals over server-side search.

**Rationale:**
- History data is already loaded client-side
- Small dataset (completed appointments per employee)
- Better UX with instant results
- No additional API calls needed

**Alternatives considered:**
- Server-side search: Rejected due to unnecessary complexity for small datasets
- Debounced search: Considered but adds complexity without clear benefit

### 2. Detail View Approach
**Decision:** Use PrimeNG Dialog component (`p-dialog`) for appointment details.

**Rationale:**
- Consistent with PrimeNG-first approach
- Non-modal option available for reference comparison
- Clean separation from table view
- Mobile-friendly overlay

**Alternatives considered:**
- Expandable rows: Rejected as it clutters the main table
- Separate page: Rejected as it breaks UX flow
- Sidebar panel: Considered but dialog is more standard

### 3. Sortable Columns
**Decision:** Enable PrimeNG table built-in sorting on date, client name, and amount columns.

**Rationale:**
- Native PrimeNG feature
- No custom code needed
- Consistent UX across the application

### 4. Export Functionality
**Decision:** Implement CSV export on the client side.

**Rationale:**
- No server changes required
- Sufficient for employee-level data
- Can extend to server-side later if needed

**Alternatives considered:**
- Excel export: Requires additional dependency (xlsx)
- PDF export: Too complex for simple list export

## Risks / Trade-offs

**Performance with large datasets** → Mitigation: Implement pagination and virtual scrolling is already in place. Export will have a max limit.

**Dialog mobile responsiveness** → Mitigation: PrimeNG Dialog handles responsive design automatically with configurable breakpoints.

**Search performance** → Mitigation: Use computed() signal with efficient filtering; consider virtualization if datasets grow beyond 1000 records.