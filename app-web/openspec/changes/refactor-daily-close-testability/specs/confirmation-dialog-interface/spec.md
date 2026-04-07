# ConfirmationDialogInterface Specification

## Overview
Abstraction layer for confirmation dialogs to enable both PrimeNG implementation in production and mock implementation for testing.

## Functional Requirements

### FR1: Interface Definition
- **Given** the interface is implemented
- **Then** it must provide a `confirm()` method
- **And** accept a configuration object
- **And** return a Promise<boolean>

### FR2: PrimeNG Implementation
- **Given** the PrimeNG implementation is used
- **When** `confirm()` is called with config
- **Then** it should display a PrimeNG ConfirmDialog
- **And** resolve to true when user accepts
- **And** resolve to false when user rejects

### FR3: Mock Implementation
- **Given** the mock implementation is used in tests
- **When** `confirm()` is called
- **Then** it should immediately resolve to a configurable value
- **And** capture the call for assertions
- **And** allow programmatic control of the response

## Interface

```typescript
interface IConfirmationDialog {
  confirm(config: ConfirmConfig): Promise<boolean>;
}

interface ConfirmConfig {
  message: string;
  header?: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptVisible?: boolean;
  rejectVisible?: boolean;
}
```

## Implementations

### PrimeNGConfirmationDialog
- Uses PrimeNG ConfirmDialog service
- Displays modal overlay
- Handles user interaction

### MockConfirmationDialog
- Immediate resolution
- Configurable default response
- Call tracking for test assertions
- Spy-friendly interface

## Test Requirements
- Interface contract tested
- Both implementations fully covered
- Mock captures all calls
