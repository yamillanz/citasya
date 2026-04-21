# AppointmentActionService Specification

## Overview
Command pattern implementation for appointment operations, encapsulating each action as a discrete command object with undo capability where applicable.

## Functional Requirements

### FR1: Command Pattern Structure
- **Given** an action needs to be performed
- **When** the service creates a command
- **Then** the command should encapsulate all parameters
- **And** provide an `execute()` method
- **And** optionally provide an `undo()` method

### FR2: Status Change Command
- **Given** a status change is requested
- **When** `createStatusChangeCommand(appointmentId, newStatus)` is called
- **Then** it should return a command object
- **And** execution should call the API
- **And** success should update local state
- **And** failure should trigger error handling

### FR3: Batch Operations
- **Given** multiple operations need to be performed
- **When** `executeBatch(commands)` is called
- **Then** it should execute all commands sequentially
- **And** provide progress updates
- **And** support partial failure handling

### FR4: Command History
- **Given** commands have been executed
- **When** history is requested
- **Then** it should return executed commands
- **And** support undo for reversible commands
- **And** clear history when needed

## Interface

```typescript
interface AppointmentActionService {
  createStatusChangeCommand(
    appointmentId: string, 
    newStatus: AppointmentStatus,
    previousStatus: AppointmentStatus
  ): StatusChangeCommand;
  
  createCloseDayCommand(date: Date, appointments: Appointment[]): CloseDayCommand;
  executeBatch(commands: Command[]): Promise<BatchResult>;
  getHistory(): Command[];
  canUndo(): boolean;
  undo(): Promise<void>;
}

interface Command {
  readonly id: string;
  readonly type: string;
  execute(): Promise<void>;
  undo?(): Promise<void>;
}
```

## Test Requirements
- All command types tested
- Execute and undo paths covered
- Batch operation scenarios tested
- Error handling verified
