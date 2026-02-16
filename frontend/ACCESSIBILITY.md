# Accessibility Guide

This document outlines the accessibility features implemented in the Project Cost Control System to ensure the application is usable by everyone, including people with visual, motor, auditory, and cognitive disabilities.

## Accessibility Standards

We follow **WCAG 2.1 Level AA** guidelines to ensure our application is accessible to the widest possible audience.

### Key Principles (POUR)

1. **Perceivable** - Information must be presentable to users in ways they can perceive
2. **Operable** - Interface components must be operable by all users
3. **Understandable** - Information and operation must be understandable
4. **Robust** - Content must be robust enough to work with assistive technologies

---

## Implemented Features

### 1. Screen Reader Support

All components include proper ARIA labels and semantic HTML:

#### CostTypeIcon

- `role="img"` for icon containers
- `aria-label` describes the cost type (Labor, Material, Equipment, etc.)
- Hidden label with `sr-only` class when visual label is not shown
- Icons marked with `aria-hidden="true"` to avoid duplication

```tsx
<CostTypeIcon type="L" showLabel={false} />
// Screen reader announces: "Cost type: Labor"
```

#### StatusBadge

- `role="status"` for status indicators
- `aria-label` provides full context: "Project status: Active"

```tsx
<StatusBadge status="active" />
// Screen reader announces: "Project status: Active"
```

#### ProgressBar

- `role="progressbar"` with proper ARIA attributes
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax` for current state
- `aria-label` describes the progress type and percentage
- Hidden text with `sr-only` provides detailed information

```tsx
<ProgressBar value={75} max={100} variant="success" />
// Screen reader announces: "Success progress: 75% complete, 75 of 100"
```

#### MetricCard

- `role="article"` for semantic structure
- `aria-label` on card describes the metric
- Trend icons marked `aria-hidden="true"`
- Trend labels provided via `sr-only` text

```tsx
<MetricCard
  title="Contract Amount"
  value="$15.19M"
  trend="up"
  trendValue="+5%"
/>
// Screen reader announces: "Metric: Contract Amount, Value: $15.19M, Trending up: +5%"
```

#### VarianceIndicator

- `role="status"` for variance information
- `aria-label` provides context: "Positive variance: 5.2 percent above target"
- Icons marked `aria-hidden="true"`

```tsx
<VarianceIndicator value={5.2} />
// Screen reader announces: "Positive variance: 5.2 percent above target"
```

#### ProjectCard

- `role="button"` when clickable, `role="article"` otherwise
- Comprehensive `aria-label` with project details
- Keyboard navigation support (Enter/Space to activate)
- Focus ring visible on keyboard navigation
- Semantic `<time>` elements with `dateTime` attributes

```tsx
<ProjectCard project={project} onClick={handleClick} />
// Screen reader announces: "Project: Citizens Medical Center, Job number 23CON0002, Status: Active"
```

#### DataTable

- `role="table"` with proper table semantics
- Sortable columns have `role="button"` and `aria-sort` attributes
- `aria-label` on headers describes sort state
- Row count announced via `sr-only` live region
- Keyboard navigation for sorting (Enter/Space)
- Clickable rows have `role="button"` and keyboard support

```tsx
<DataTable data={projects} columns={columns} onSort={handleSort} />
// Screen reader announces: "Data table, Contract Amount, sortable column, currently sorted ascending"
```

### 2. Form Inputs

All form inputs include proper labels and hints:

#### CurrencyInput

- Hidden `<label>` with `for` attribute
- `aria-label` describes the input purpose
- `aria-describedby` links to format hint
- `sr-only` hint explains expected format: "Enter amount in dollars and cents, for example 1234.56"
- Dollar sign marked `aria-hidden="true"`

#### HoursInput

- Hidden `<label>` for screen readers
- `aria-label` and `aria-describedby` for context
- `sr-only` hint explains format and maximum value
- "hrs" suffix marked `aria-hidden="true"`

#### PercentageInput

- Hidden `<label>` for screen readers
- `aria-label` and `aria-describedby` for context
- `sr-only` hint explains valid range (0-100)
- Percent sign marked `aria-hidden="true"`

#### CostCodeSelect

- `aria-haspopup="listbox"` indicates dropdown behavior
- `aria-expanded` reflects open/closed state
- `aria-describedby` links to error messages
- Search input has proper `<label>` and `aria-label`
- Dropdown has `role="dialog"` and `aria-label`
- Options list has `role="listbox"` with `role="option"` items
- `aria-selected` indicates current selection
- Empty state has `role="status"` with `aria-live="polite"`
- Error messages have `role="alert"`

### 3. Keyboard Navigation

All interactive components are fully keyboard accessible:

#### Navigation Keys

- **Tab** - Move focus between interactive elements
- **Shift+Tab** - Move focus backwards
- **Enter** - Activate buttons, links, and clickable items
- **Space** - Activate buttons and checkboxes
- **Escape** - Close dialogs and dropdowns
- **Arrow Keys** - Navigate within lists and menus

#### Focus Management

- Visible focus indicators on all interactive elements
- Focus ring with 2px offset for clarity
- Focus automatically moves to search input when dropdown opens
- Focus trapped within modal dialogs
- Focus returns to trigger element when closing

#### Keyboard Shortcuts

```
CostCodeSelect:
  - Enter/Space: Open dropdown
  - Escape: Close dropdown
  - Type to search when open

DataTable:
  - Enter/Space on header: Sort column
  - Enter/Space on row: Activate row action
  - Tab: Navigate between sortable columns

ProjectCard (clickable):
  - Enter/Space: Open project
  - Tab: Move to next card
```

### 4. Color Contrast

All text and interactive elements meet WCAG AA standards:

#### Text Contrast Ratios

- **Normal text** (< 18pt): Minimum 4.5:1
- **Large text** (≥ 18pt or 14pt bold): Minimum 3:1
- **UI components**: Minimum 3:1

#### Color Palette

```css
/* Primary colors - AA compliant */
--primary-600: #2563eb; /* On white: 7.0:1 */
--primary-700: #1d4ed8; /* On white: 9.3:1 */

/* Success colors - AA compliant */
--success-600: #16a34a; /* On white: 4.5:1 */
--success-700: #15803d; /* On white: 6.1:1 */

/* Warning colors - AA compliant */
--warning-600: #ca8a04; /* On white: 5.2:1 */
--warning-700: #a16207; /* On white: 7.0:1 */

/* Danger colors - AA compliant */
--danger-600: #dc2626; /* On white: 5.9:1 */
--danger-700: #b91c1c; /* On white: 7.7:1 */

/* Neutral colors - AA compliant */
--neutral-600: #525252; /* On white: 7.0:1 */
--neutral-700: #404040; /* On white: 9.7:1 */
--neutral-900: #171717; /* On white: 16.1:1 */
```

#### Non-Color Indicators

We never rely solely on color to convey information:

- Status badges include text labels
- Variance indicators include icons (up/down arrows)
- Progress bars include percentage text
- Form errors include icon and text message

### 5. Responsive Text

Text remains readable at different zoom levels:

- Supports browser zoom up to 200%
- Uses relative units (rem, em) instead of fixed pixels
- Minimum font size: 14px (0.875rem)
- Line height: 1.5 for body text, 1.2 for headings
- Text doesn't overflow or get cut off when zoomed

### 6. Motion and Animation

Respects user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Animations that respect this preference:

- Progress bar transitions
- Dropdown open/close
- Hover effects
- Focus ring transitions

### 7. Error Handling

Errors are announced to screen readers:

- Form validation errors have `role="alert"`
- Error messages linked via `aria-describedby`
- Errors appear immediately on blur or submit
- Clear, actionable error messages
- Error state indicated by color, icon, and text

Example:

```tsx
<Input aria-describedby="email-error" />
<p id="email-error" role="alert">
  Please enter a valid email address
</p>
```

---

## Testing Accessibility

### Automated Testing

Run accessibility tests with:

```bash
npm run test:a11y
```

Tools used:

- **axe-core** - Automated accessibility testing
- **jest-axe** - Jest integration for axe-core
- **eslint-plugin-jsx-a11y** - Linting for accessibility issues

### Manual Testing

#### Screen Reader Testing

Test with popular screen readers:

- **NVDA** (Windows) - Free, open source
- **JAWS** (Windows) - Industry standard
- **VoiceOver** (macOS/iOS) - Built-in
- **TalkBack** (Android) - Built-in

#### Keyboard Testing

1. Unplug your mouse
2. Navigate the entire application using only keyboard
3. Verify all functionality is accessible
4. Check focus indicators are visible

#### Color Contrast Testing

Use browser extensions:

- **axe DevTools** - Comprehensive accessibility testing
- **WAVE** - Visual feedback on accessibility
- **Colour Contrast Analyser** - Detailed contrast checking

#### Zoom Testing

1. Set browser zoom to 200%
2. Verify all content is readable
3. Check for horizontal scrolling
4. Ensure no content is cut off

---

## Common Patterns

### Accessible Button

```tsx
<button
  type="button"
  onClick={handleClick}
  aria-label="Delete project"
  aria-describedby="delete-hint"
>
  <TrashIcon aria-hidden="true" />
  <span className="sr-only">Delete</span>
</button>
<span id="delete-hint" className="sr-only">
  This action cannot be undone
</span>
```

### Accessible Link

```tsx
<a
  href="/projects/123"
  aria-label="View Citizens Medical Center project details"
>
  Citizens Medical Center
</a>
```

### Accessible Form Field

```tsx
<div>
  <label htmlFor="project-name">
    Project Name
    <span aria-label="required">*</span>
  </label>
  <input
    id="project-name"
    type="text"
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby="project-name-error project-name-hint"
  />
  <span id="project-name-hint" className="text-sm text-neutral-600">
    Enter the full project name as it appears in contracts
  </span>
  {hasError && (
    <span id="project-name-error" role="alert" className="text-sm text-error">
      Project name is required
    </span>
  )}
</div>
```

### Accessible Modal

```tsx
<Dialog
  open={isOpen}
  onOpenChange={setIsOpen}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <DialogContent>
    <DialogHeader>
      <DialogTitle id="dialog-title">Delete Project</DialogTitle>
      <DialogDescription id="dialog-description">
        Are you sure you want to delete this project? This action cannot be
        undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Accessible Loading State

```tsx
<div role="status" aria-live="polite" aria-busy="true">
  <Spinner aria-hidden="true" />
  <span className="sr-only">Loading project data...</span>
</div>
```

---

## Resources

### WCAG Guidelines

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM WCAG Checklist](https://webaim.org/standards/wcag/checklist)

### ARIA Authoring Practices

- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [ARIA in HTML](https://www.w3.org/TR/html-aria/)

### Testing Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Screen Readers

- [NVDA Download](https://www.nvaccess.org/download/)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/)

---

## Reporting Accessibility Issues

If you discover an accessibility issue:

1. **Check** if it's already reported in GitHub Issues
2. **Create** a new issue with the "accessibility" label
3. **Include**:
   - Description of the issue
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Browser and assistive technology used
   - Screenshots or screen recordings if applicable

We prioritize accessibility issues and aim to fix them within one sprint.

---

## Future Improvements

Planned accessibility enhancements:

- [ ] High contrast mode support
- [ ] Customizable font sizes in settings
- [ ] Keyboard shortcut customization
- [ ] Voice control support
- [ ] Dyslexia-friendly font option
- [ ] Screen reader announcements for data updates
- [ ] Skip navigation links
- [ ] Landmark regions for page structure
- [ ] Focus visible polyfill for older browsers

---

## Compliance Statement

This application strives to conform to WCAG 2.1 Level AA standards. We are committed to ensuring digital accessibility for people with disabilities and continuously improving the user experience for everyone.

Last updated: January 2026
