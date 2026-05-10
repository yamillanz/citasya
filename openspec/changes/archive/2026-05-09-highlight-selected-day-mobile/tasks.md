## 1. Highlight selected day in mobile calendar

- [x] 1.1 Update `calendarOptions` computed to read `selectedDate()` as reactive dependency.
- [x] 1.2 Extend `getDayCellClassNames` to append `selected-day` class when cell date matches `selectedDate`.
- [x] 1.3 Add CSS rule for `.selected-day .fc-daygrid-day-frame` inside mobile media query with `box-shadow: inset 0 0 0 2px var(--color-sage)`.
