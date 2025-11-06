# Responsive Design Quick Checklist

**Quick reference for developers when implementing responsive components**

---

## Before Committing: 5-Minute Check

### 1. Touch Targets
- [ ] All buttons/links are minimum 44x44px on mobile
- [ ] Spacing between touch targets is at least 8px
- [ ] Test with Chrome DevTools device toolbar

### 2. Font Sizes
- [ ] Body text is 16px (1rem) minimum
- [ ] Secondary text is 14px (0.875rem) minimum
- [ ] Use theme CSS variables (--text-base, --text-sm)

### 3. Layout
- [ ] Single column layout at 320px width
- [ ] No horizontal scrolling at any viewport size
- [ ] Content is readable without zooming

### 4. Navigation
- [ ] Hamburger menu appears on mobile (< 768px)
- [ ] Navigation items are tappable (44px height)
- [ ] Menu closes when clicking outside

### 5. Forms
- [ ] Input height is 44px minimum
- [ ] Labels are visible and associated with inputs
- [ ] Error messages are readable

---

## Breakpoint Reference

```css
/* Mobile First - No media query needed */
/* Default styles for mobile (320px+) */

/* Tablet */
@media (max-width: 1024px) {
  /* Tablet adjustments */
}

/* Mobile */
@media (max-width: 768px) {
  /* Mobile-specific styles */
  /* Hamburger menu activates here */
}

/* Ultra-narrow (optional) */
@media (max-width: 375px) {
  /* iPhone SE optimizations */
}

/* Touch devices */
@media (hover: none) and (pointer: coarse) {
  /* Touch-specific enhancements */
}
```

---

## Common Patterns

### Responsive Grid
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

### Responsive Button
```css
.button {
  min-height: 44px;
  padding: 0.75rem 1.5rem;
  font-size: var(--text-base);
}

@media (max-width: 768px) {
  .button {
    width: 100%;
  }
}
```

### Responsive Input
```css
.input {
  height: 44px;
  padding: 0 1rem;
  font-size: var(--text-base);
  width: 100%;
}
```

---

## Testing Commands

```bash
# Run responsive tests
npm test -- Responsive.test.jsx

# Start dev server
npm run dev

# Open in browser
http://localhost:5173/theme-showcase
```

### Manual Testing (Chrome DevTools)
1. Open DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Test these sizes:
   - iPhone SE: 320px
   - iPhone 8: 375px
   - iPad: 768px
   - Desktop: 1280px

---

## Quick Fixes

### Issue: Horizontal scroll on mobile
```css
.container {
  max-width: 100%;
  overflow-x: hidden;
}
```

### Issue: Button too small
```css
.button {
  min-height: 44px;
  min-width: 44px;
}
```

### Issue: Text too small
```css
.text {
  font-size: var(--text-base); /* Not px values! */
}
```

### Issue: Touch targets too close
```css
.buttons {
  display: flex;
  gap: var(--space-2); /* Minimum 8px */
}
```

---

## Don't Forget

1. Use theme CSS variables (--text-*, --space-*)
2. Test on actual mobile device if possible
3. Check hamburger menu animation
4. Verify modal fits in viewport
5. Test landscape orientation

---

## Resources

- Full Test Report: `/tests/RESPONSIVE_TEST_REPORT.md`
- Theme Context: `/frontend/src/contexts/ThemeContext.jsx`
- Component Examples: `/frontend/src/pages/ThemeShowcase.jsx`
- Design System: `/frontend/src/styles/themes/`

---

**Last Updated:** 2025-10-23
