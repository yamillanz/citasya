## 1. Extract Selection Step

- [ ] 1.1 Create `selection-step` component with signal inputs for services, employees, and booking data
- [ ] 1.2 Move service selection logic from parent to selection-step component
- [ ] 1.3 Move employee selection and date/time picker logic to selection-step
- [ ] 1.4 Add `output()` emitters for selection changes and navigation events
- [ ] 1.5 Write unit tests for selection-step component

## 2. Extract Summary Step

- [ ] 2.1 Create `summary-step` component with signal input for booking data
- [ ] 2.2 Move summary display logic (services, duration, price) to summary-step
- [ ] 2.3 Style summary step with design tokens
- [ ] 2.4 Write unit tests for summary-step component

## 3. Extract Contact Form Step

- [ ] 3.1 Create `contact-form-step` component with reactive form
- [ ] 3.2 Move contact form fields (name, phone, email) and validation to component
- [ ] 3.3 Add `output()` emitter for form submission with form data
- [ ] 3.4 Write unit tests for contact-form-step component

## 4. Extract Success Step

- [ ] 4.1 Create `success-step` component with signal input for booking confirmation
- [ ] 4.2 Move success message and next steps display to success-step
- [ ] 4.3 Write unit tests for success-step component

## 5. Simplify Parent Orchestrator

- [ ] 5.1 Reduce parent to step navigation logic with `currentStep` signal
- [ ] 5.2 Wire up child outputs to parent step navigation
- [ ] 5.3 Move booking submission logic to parent `onSubmit()` handler
- [ ] 5.4 Add `initialLoading` signal for data fetch state
- [ ] 5.5 Remove extracted logic and styles from parent files

## 6. Verify and Test

- [ ] 6.1 Run full test suite — all 66 tests passing
- [ ] 6.2 Verify production build succeeds
- [ ] 6.3 Verify no breaking changes to public API or routing
