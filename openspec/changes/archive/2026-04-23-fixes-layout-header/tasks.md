## 1. Layout and Visual Balance

- [x] 1.1 Increase logo font-size from `36px` to `42px` and font-weight from `600` to `700` in `landing-header.component.scss`
- [x] 1.2 Standardize header container `max-width` to `1200px` (was `1280px`)
- [x] 1.3 Remove horizontal padding from header container (`padding: 0` instead of `padding: 0 var(--space-lg)`)
- [x] 1.4 Fix hero container width by adding `width: 100%` to prevent flex-item shrink in `home.component.scss`
- [x] 1.5 Set home page `max-width` to `1200px` for consistency with header

## 2. Navigation Decluttering

- [x] 2.1 Remove `FAQ` from `menuItems` array in `landing-header.component.ts`
- [x] 2.2 Update mobile drawer menu items to match desktop navigation (5 items)

## 3. Active Page Indicator

- [x] 3.1 Inject `Router` into `LandingHeaderComponent`
- [x] 3.2 Implement `isActive()` method to handle exact path matching and hash fragments
- [x] 3.3 Apply `[class.active]="isActive(item.route)"` to desktop nav links
- [x] 3.4 Apply `[class.active]="isActive(item.route)"` to mobile drawer nav links
- [x] 3.5 Add `.active` CSS styles (`font-weight: 600`, `color: #5D6D7E`)

## 4. Accessibility

- [x] 4.1 Add skip-to-content link at the top of `landing-header.component.html`
- [x] 4.2 Style skip link with `sr-only` visual-hiding and `:focus` visibility
- [x] 4.3 Add `id="main-content"` to `home.component.html`
- [x] 4.4 Add `id="main-content"` to `pricing.component.html`
- [x] 4.5 Add `id="main-content"` to `about.component.html`
- [x] 4.6 Add `id="main-content"` to `contact.component.html`
- [x] 4.7 Add `id="main-content"` to `faq.component.html`
- [x] 4.8 Add `:focus-visible` rings to logo link (`outline: 2px solid #9DC183`, `outline-offset: 2px`)
- [x] 4.9 Add `:focus-visible` rings to nav links
- [x] 4.10 Add `:focus-visible` rings to auth buttons

## 5. Cross-Page Header Consistency

- [x] 5.1 Import and add `<app-landing-header>` to `pricing.component.ts` template
- [x] 5.2 Import and add `<app-landing-header>` to `about.component.ts` template
- [x] 5.3 Import and add `<app-landing-header>` to `contact.component.ts` template
- [x] 5.4 Import and add `<app-landing-header>` to `faq.component.ts` template

## 6. Mobile Menu Fix

- [x] 6.1 Hide `.mobile-menu-trigger` wrapper completely with `display: none` on desktop (≥1024px)
- [x] 6.2 Verify no residual layout impact from hidden mobile trigger
