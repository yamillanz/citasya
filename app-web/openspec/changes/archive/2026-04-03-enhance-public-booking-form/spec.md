# Specification: Enhance Public Booking Form

## Files to Modify

### 1. `src/app/features/public/booking-form/booking-form.component.ts`

**Current State:**
- Basic reactive form with validation
- No real-time validation feedback
- No phone formatting
- No character counter for notes

**Changes:**
- Add `notesLength` computed signal
- Add `formatPhone()` method for auto-formatting
- Add `onPhoneInput()` method for real-time formatting
- Enhance validation feedback on valueChanges
- Add animation triggers definitions
- Improve error handling with visual states

**New Methods:**
```typescript
notesLength = computed(() => this.bookingForm.get('notes')?.value?.length || 0);

formatPhone(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
}

onPhoneInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  const formatted = this.formatPhone(input.value);
  this.bookingForm.patchValue({ client_phone: formatted });
}
```

### 2. `src/app/features/public/booking-form/booking-form.component.html`

**Current State:**
- Basic 3-step wizard
- Simple card layout
- Functional but minimal design

**Changes:**
- Add Angular animations syntax (`@fadeInUp`, etc.)
- Redesign Step 1 summary with premium cards
- Floating labels for form fields
- Enhanced error message display
- Success page with animations
- Improved progress steps

**Key Structural Changes:**

**Step 1 Summary:**
- Larger icons in circular containers
- Service duration as badge
- Price with prominent styling
- Employee avatar/photo display

**Step 2 Form:**
- Floating label inputs
- Inline validation icons
- Phone auto-formatting
- Notes character counter

**Step 3 Success:**
- Animated check circle
- Confetti particles (CSS-only)
- Staggered summary reveal

### 3. `src/app/features/public/booking-form/booking-form.component.scss`

**Current State:**
- Basic styles with sage color theme
- Functional but plain design
- Limited visual polish

**Changes:**

#### Header Section
- Larger logo display
- More prominent branding
- Enhanced background with subtle gradient

#### Progress Steps
- Larger circles (40px)
- Gradient background for active step
- Check icon for completed steps
- Line transition animations
- Better mobile scaling

#### Step Cards
- Premium shadow effects
- Rounded corners (16-24px)
- Smooth hover states
- Fade-in animations
- Enhanced backgrounds

#### Summary Sections
- Large circular icon containers (48px)
- Employee photo/avatar with gradient background
- Service duration badge (pill style)
- Price box with gradient background
- Better spacing and hierarchy

#### Form Fields
- Floating label containers
- Icon + label alignment
- Focus state with brand color glow
- Error state with shake animation
- Success state with check icon
- Character counter for notes

#### Buttons
- Gradient backgrounds
- Hover lift effect
- Shadow transitions
- Loading spinner improvement
- Better mobile sizing

#### Success Page
- Large animated check circle
- Confetti particles CSS animation
- Summary box with sage background
- Reminder info box
- Prominent CTA button

#### Responsive Styles
- Full-width cards on mobile
- Reduced padding for small screens
- Stacked elements on mobile
- Touch-friendly sizes (min 44px)

### 4. `src/app/features/public/booking-form/booking-form.animations.ts` (NEW FILE)

**Purpose:** Encapsulate all animation definitions

**Export:**
```typescript
import { trigger, transition, style, animate, keyframes } from '@angular/animations';

export const fadeInUp = trigger('fadeInUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);

export const stepComplete = trigger('stepComplete', [
  transition('void => *', [
    style({ transform: 'scale(0)' }),
    animate('0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
      style({ transform: 'scale(1)' }))
  ])
]);

export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('0.3s ease-in', style({ opacity: 1 }))
  ])
]);

export const shakeError = trigger('shakeError', [
  transition('* => *', [
    animate('0.5s', keyframes([
      style({ transform: 'translateX(0)', offset: 0 }),
      style({ transform: 'translateX(-10px)', offset: 0.1 }),
      style({ transform: 'translateX(10px)', offset: 0.2 }),
      style({ transform: 'translateX(-10px)', offset: 0.3 }),
      style({ transform: 'translateX(10px)', offset: 0.4 }),
      style({ transform: 'translateX(0)', offset: 0.5 })
    ]))
  ])
]);
```

## Animation Triggers

### 1. fadeInUp
- **Use:** Card entrance animations
- **Duration:** 400ms
- **Easing:** ease-out
- **Effect:** Fade from 0 opacity + slide from bottom

### 2. stepComplete
- **Use:** Progress step completion
- **Duration:** 300ms
- **Easing:** cubic-bezier (bounce effect)
- **Effect:** Scale from 0 to 1 with overshoot

### 3. fadeIn
- **Use:** General fade transitions
- **Duration:** 300ms
- **Easing:** ease-in
- **Effect:** Simple opacity fade

### 4. shakeError
- **Use:** Form validation errors
- **Duration:** 500ms
- **Effect:** Horizontal shake animation

## Style Tokens (CSS Variables)

### Existing (Use)
- `--color-sage` (#9DC183)
- `--color-sage-dark` (#7BA366)
- `--color-sage-light` (#B8D4A3)
- `--color-sage-pale` (#E8F0E0)
- `--color-cream` (#FAF8F5)
- `--color-text-primary` (#2C3E50)
- `--color-text-secondary` (#5D6D7E)
- `--color-text-muted` (#95A5A6)

### New (Add to :root or component)
```scss
:host {
  --shadow-soft: 0 4px 20px rgba(44, 62, 80, 0.08);
  --shadow-card: 0 8px 30px rgba(157, 193, 131, 0.12);
  --shadow-hover: 0 12px 40px rgba(157, 193, 131, 0.18);
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --transition-smooth: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

## Validation Rules

### Existing Rules (Keep)
- Name: required, minLength(2)
- Phone: required, minLength(8)
- Email: optional

### Enhanced Validation
- Add email validator: `Validators.email`
- Real-time validation feedback
- Visual states: pristine, touched, valid, invalid

## Behavioral Changes

### Phone Input Auto-Formatting
```typescript
// On every input, format phone number
// User types: 5551234567
// Displays as: 555-123-4567
```

### Character Counter
- Show count: "0/500 characters"
- Update in real-time
- Visual warning at 450+ characters

### Improved Error Handling
```typescript
// When form invalid on submit:
// 1. Mark all fields as touched
// 2. Trigger shake animation on form card
// 3. Show inline errors below each field
// 4. Focus first invalid field
// 5. Show error toast/box at bottom
```

## Performance Considerations

### Animation Performance
- Use CSS animations for simple effects (confetti)
- Use Angular Animations for state-based transitions
- Use `transform` and `opacity` for GPU acceleration
- Avoid animating `width`, `height`, or `margin`

### Bundle Size
- No new dependencies
- Existing @angular/animations module
- CSS-only confetti (no library)

## Accessibility Requirements

### ARIA Labels
- All icons have `aria-hidden="true"`
- Form fields have proper `for` and `id` associations
- Error messages linked via `aria-describedby`
- Progress steps have proper labels

### Keyboard Navigation
- Tab through all form fields
- Submit on Enter
- Proper focus order
- Focus trap within form (if using modal)

### Color Contrast
- All text meets WCAG AA (4.5:1 ratio)
- Verified using existing design system colors
- Error messages use sufficient contrast

## Testing Checklist

### Visual Testing
- [ ] Card renders correctly on all form steps
- [ ] Animations play smoothly
- [ ] Progress steps animate correctly
- [ ] Buttons have proper hover/focus states
- [ ] Icons display correctly

### Functional Testing
- [ ] Form validation works in real-time
- [ ] Phone auto-formatting works as expected
- [ ] Character counter updates in real-time
- [ ] Error states display correctly
- [ ] Success page shows with animations

### Mobile Testing
- [ ] Touch targets are 44px minimum
- [ ] Cards are full-width on mobile
- [ ] Form fields are easily tappable
- [ ] Text is readable on small screens
- [ ] No horizontal scroll

### Accessibility Testing
- [ ] Screen reader reads all elements
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Color contrast passes WCAG AA

## Implementation Order

1. **Create animation definitions file** (new file)
2. **Update component TypeScript** (enhance logic)
3. **Update component HTML** (apply animations and redesign)
4. **Update component SCSS** (new styles)
5. **Test visual and functional**
6. **Test mobile and accessibility**