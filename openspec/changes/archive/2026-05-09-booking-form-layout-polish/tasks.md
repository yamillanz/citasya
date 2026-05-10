## 1. Fix Double-Submit Bug

- [ ] 1.1 Add `loading()` signal guard in parent `onSubmit()` handler
- [ ] 1.2 Add `isSubmitting` flag in contact-form-step with 1s reset
- [ ] 1.3 Write 3 unit tests for double-submit prevention

## 2. Fix Contact Form Layout

- [ ] 2.1 Move `<label>` outside `.input-wrapper` in contact-form-step HTML
- [ ] 2.2 Verify `.form-field` uses `flex-direction: column` for vertical stacking
- [ ] 2.3 Confirm inputs render at full width below labels

## 3. Fix View Encapsulation Style Issues

- [ ] 3.1 Add `.step-card` and `.card-header` styles to selection-step SCSS
- [ ] 3.2 Add `.step-card` and `.card-header` styles to summary-step SCSS
- [ ] 3.3 Add `.step-card` and `.card-header` styles to contact-form-step SCSS

## 4. Design Token Compliance

- [ ] 4.1 Replace hardcoded hex colors with CSS variables in success-step SVG
- [ ] 4.2 Replace hardcoded colors in summary-step reminder box
- [ ] 4.3 Move inline styles from summary-step template to SCSS classes

## 5. Responsive Breakpoints

- [ ] 5.1 Add 480px breakpoint for mobile (stacked progress, full-width buttons)
- [ ] 5.2 Add 640px breakpoint for tablet (reduced padding, adjusted spacing)
- [ ] 5.3 Set `step-section` max-width to 600px for desktop

## 6. Verify

- [ ] 6.1 Run test suite — 66 tests passing
- [ ] 6.2 Verify production build succeeds
