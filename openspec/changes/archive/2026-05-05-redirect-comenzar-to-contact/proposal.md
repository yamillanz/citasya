# Redirect "Comenzar" to Contact Page

## Why
The "Comenzar" CTA button in the landing header currently links to `/signup`, but the user flow should direct visitors to the contact page where they can inquire about getting started.

## What Changes
Update the `routerLink` of the "Comenzar" button in `landing-header.component.html` from `/signup` to `/contact`.

## Scope
- `app-web/src/app/shared/components/landing-header/landing-header.component.html`
