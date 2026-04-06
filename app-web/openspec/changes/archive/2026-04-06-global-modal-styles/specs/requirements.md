# Requirements Specification

## 1. Global Dialog Background

**Given** a PrimeNG dialog is opened  
**When** the dialog renders  
**Then** the dialog container shall have a warm‑white background (`var(--color-warm-white)`)  
**And** the background shall be opaque (no transparency).

## 2. Dialog Rounded Corners

**Given** a dialog is visible  
**When** the dialog container is rendered  
**Then** the dialog shall have rounded corners with a radius of `var(--radius-lg)` (20px).

## 3. Dialog Shadow

**Given** a dialog is open  
**When** the dialog is displayed  
**Then** the dialog shall have a box‑shadow of `var(--shadow-xl)` to create depth.

## 4. Dialog Header Styling

**Given** a dialog header exists  
**When** the header is rendered  
**Then** the header background shall be `var(--color-linen)`  
**And** the header shall have a bottom border of `1px solid var(--color-border)`  
**And** the header title shall use the font `var(--font-display)` at size `1.25rem` and weight `600`  
**And** the header padding shall be `var(--space-md)` vertical and `var(--space-lg)` horizontal.

## 5. Dialog Content Padding

**Given** a dialog content area exists  
**When** the content is rendered  
**Then** the content shall have padding of `var(--space-lg)` on all sides.

## 6. Dialog Footer Styling

**Given** a dialog footer exists  
**When** the footer is rendered  
**Then** the footer shall have a top border of `1px solid var(--color-border)`  
**And** the footer padding shall be `var(--space-md)` vertical and `var(--space-lg)` horizontal.

## 7. Dialog Overlay

**Given** a modal dialog is open (mask visible)  
**When** the overlay is rendered  
**Then** the overlay background shall be semi‑transparent dark (`rgba(44, 62, 80, 0.5)`).

## 8. Close Button Styling

**Given** a dialog header contains a close button  
**When** the close button is rendered  
**Then** the button icon color shall be `var(--color-text-secondary)`  
**And** on hover the icon color shall change to `var(--color-text-primary)`.

## 9. Responsive Behavior

**Given** a dialog is open on a mobile device (viewport width ≤ 640px)  
**When** the dialog is rendered  
**Then** the dialog width shall be `100vw`  
**And** the dialog content padding shall remain `var(--space-lg)`.

## 10. Design Token Integration

**Given** the global design system includes a CSS custom property `--color-border`  
**When** any border in the dialog uses `var(--color-border)`  
**Then** the border color shall be `#E8E4DD` (warm sand).