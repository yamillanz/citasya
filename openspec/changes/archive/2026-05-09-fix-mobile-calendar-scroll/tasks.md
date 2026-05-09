## 1. Fix mobile scroll in calendar component

- [x] 1.1 Update `.calendar-wrapper` media query for `max-width: 768px` to remove `max-height` restriction (`max-height: none`) and allow natural page scroll (`overflow: visible`).
- [x] 1.2 Verify that `.appointments-card .card-content` retains `overflow-y: auto` for internal scrolling if needed.
- [x] 1.3 Test the fix in mobile viewport to ensure all day appointments are accessible via scroll.
