# Spec: Daily Close with PDF

## Overview

Enable managers to generate daily close reports summarizing completed appointments and revenue, with PDF export capability.

## Requirements

### R1: Date Selection
- Date picker to select close date
- Default to current date
- Load appointments when date changes

### R2: Summary Display
- Total number of appointments
- Number of completed appointments
- Total amount collected
- Breakdown by employee

### R3: PDF Generation
- Generate PDF using jsPDF
- Include:
  - Company header
  - Close date
  - List of completed appointments
  - Total amount
- Download PDF to user's device

### R4: Close Record
- Prevent duplicate closes for same date
- Save close record to database
- Show confirmation when close is generated

## Scenarios

### S1: Generate Daily Close
**Given** appointments exist for the selected date
**When** the manager selects a date
**And** clicks "Generar Cierre"
**Then** a PDF is generated
**And** a close record is saved
**And** success message is shown

### S2: Prevent Duplicate Close
**Given** a close already exists for the date
**When** the manager tries to generate another close
**Then** an error message is shown
**And** no duplicate is created

### S3: View Employee Breakdown
**Given** multiple employees have appointments
**When** viewing the daily close
**Then** each employee's appointment count and total is shown

### S4: Empty Date
**Given** no appointments for selected date
**When** viewing the daily close page
**Then** empty state is displayed
**And** close button is disabled or shows warning

## API Requirements

- `GET /appointments?company_id={id}&date={date}` - Get appointments by date
- `POST /daily_closes` - Create close record
- Check for existing close before creating

## Technical Notes

- Use jsPDF library for PDF generation
- PDF should be downloadable, not stored (for now)
- Include proper formatting and spacing in PDF

## UI Components Needed

- p-calendar for date selection
- p-card for summary statistics
- p-table for appointment breakdown
- p-button for generate action
- p-messages for success/error feedback
