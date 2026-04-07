# DailyCloseFacade Specification

## Overview
Centralized service that extracts all business logic from DailyCloseComponent, handling appointment data management, status changes, and daily close operations.

## Functional Requirements

### FR1: Appointment Data Management
- **Given** the facade is initialized
- **When** `loadAppointments(date)` is called
- **Then** it should fetch appointments for the specified date from the API
- **And** expose them as a readable signal

### FR2: Status Change Operations
- **Given** appointments are loaded
- **When** `changeStatus(appointmentId, newStatus)` is called
- **Then** it should validate the status transition
- **And** call the appropriate API endpoint
- **And** update the local state optimistically
- **And** rollback on API failure

### FR3: Daily Close Action
- **Given** appointments exist for the day
- **When** `closeDay(date)` is called
- **Then** it should validate all appointments have final status
- **And** call the daily close API
- **And** emit success/error state

### FR4: State Management
- **Given** any operation is in progress
- **Then** loading states should be exposed via signals
- **And** error states should be captured and exposed
- **And** computed values should derive from base state

## Interface

```typescript
interface DailyCloseFacade {
  // State signals
  readonly appointments: Signal<Appointment[]>;
  readonly loading: Signal<boolean>;
  readonly error: Signal<string | null>;
  readonly canCloseDay: Signal<boolean>;
  
  // Methods
  loadAppointments(date: Date): Promise<void>;
  changeStatus(appointmentId: string, status: AppointmentStatus): Promise<void>;
  closeDay(date: Date): Promise<void>;
  refresh(): Promise<void>;
}
```

## Test Requirements
- 100% method coverage
- All error paths tested
- Signal state changes verified
- API interactions mocked
