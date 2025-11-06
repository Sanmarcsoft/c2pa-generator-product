# Manual Accessibility Testing Plan
## C2PA Generator Product - Theme Verification

**Purpose:** This document provides step-by-step instructions for manually testing accessibility compliance across all three themes.

---

## Pre-Testing Setup

### Required Tools
- [ ] Chrome browser with Lighthouse DevTools
- [ ] Firefox with Accessibility Inspector
- [ ] axe DevTools browser extension
- [ ] Color Oracle (color blindness simulator)
- [ ] Screen reader: VoiceOver (macOS) or NVDA (Windows)
- [ ] Keyboard only (disconnect mouse)

### Test Environment
- [ ] Local development server running
- [ ] Access to theme switcher component
- [ ] Test data populated (forms, lists, modals, etc.)
- [ ] Browser zoom reset to 100%

---

## Test 1: Keyboard Navigation (All Themes)

**Duration:** 15 minutes per theme
**Tools:** Keyboard only

### Steps:

1. **Navigate to home page**
   - [ ] Press Tab - First interactive element receives focus
   - [ ] Continue pressing Tab through all elements
   - [ ] Verify logical tab order (left-to-right, top-to-bottom)
   - [ ] Note: No elements skipped

2. **Test reverse navigation**
   - [ ] Press Shift+Tab from bottom of page
   - [ ] Verify reverse order works correctly
   - [ ] Note: Returns to expected elements

3. **Test button activation**
   - [ ] Tab to button
   - [ ] Press Enter - Button activates
   - [ ] Press Space - Button activates
   - [ ] Note: Both keys work

4. **Test form navigation**
   - [ ] Tab through form fields
   - [ ] Enter text in input
   - [ ] Tab to next field
   - [ ] Press Enter on submit button
   - [ ] Note: Form submits correctly

5. **Test modal keyboard behavior**
   - [ ] Open modal (click or keyboard)
   - [ ] Tab through modal elements only
   - [ ] Verify focus stays trapped in modal
   - [ ] Tab from last element cycles to first
   - [ ] Press Escape to close modal
   - [ ] Verify focus returns to trigger button
   - [ ] Note: No keyboard traps

6. **Test link navigation**
   - [ ] Tab to link
   - [ ] Press Enter - Link activates
   - [ ] Note: Navigation occurs

**Pass Criteria:**
- ✅ All interactive elements reachable via keyboard
- ✅ Logical tab order maintained
- ✅ Enter/Space activate buttons
- ✅ Escape closes modals
- ✅ Focus returns after modal close
- ✅ No keyboard traps

---

## Test 2: Focus Indicators (All Themes)

**Duration:** 10 minutes per theme
**Tools:** Keyboard, visual inspection

### Steps:

1. **Test button focus**
   - [ ] Tab to button
   - [ ] Verify visible focus outline (minimum 2px)
   - [ ] Measure outline thickness with browser DevTools
   - [ ] Check outline color contrast against background
   - [ ] Note: Outline visible and clear

2. **Test input focus**
   - [ ] Tab to text input
   - [ ] Verify focus ring visible
   - [ ] Check focus ring contrast
   - [ ] Note: Clear visual indicator

3. **Test link focus**
   - [ ] Tab to link
   - [ ] Verify focus indicator visible
   - [ ] Note: Distinguishable from non-focused state

4. **Test focus across color schemes**
   - [ ] Repeat above for each theme
   - [ ] Verify focus visible on light backgrounds
   - [ ] Verify focus visible on dark backgrounds
   - [ ] Note: Focus indicators work on all backgrounds

**Pass Criteria:**
- ✅ Minimum 2px visible outline
- ✅ Outline has sufficient contrast (3:1 minimum)
- ✅ Focus visible on all interactive elements
- ✅ Focus does not rely on color alone

---

## Test 3: Contrast Ratio Verification

**Duration:** 20 minutes per theme
**Tools:** Chrome DevTools, WebAIM Contrast Checker

### Steps:

1. **Inspect element colors**
   - [ ] Right-click on text element
   - [ ] Inspect element
   - [ ] Note foreground color (text)
   - [ ] Note background color

2. **Check contrast ratio**
   - [ ] Visit https://webaim.org/resources/contrastchecker/
   - [ ] Enter foreground color
   - [ ] Enter background color
   - [ ] Record contrast ratio
   - [ ] Verify passes AA (4.5:1 normal, 3:1 large)

3. **Elements to test:**
   - [ ] Primary heading text
   - [ ] Body text
   - [ ] Secondary text
   - [ ] Link text
   - [ ] Button text (all variants)
   - [ ] Button backgrounds
   - [ ] Status badges (success, warning, error)
   - [ ] Form labels
   - [ ] Placeholder text
   - [ ] Disabled text

4. **Test on different backgrounds**
   - [ ] White background
   - [ ] Secondary background (cream, dark, etc.)
   - [ ] Colored backgrounds (cards, alerts)

**Pass Criteria:**
- ✅ Normal text: 4.5:1 minimum
- ✅ Large text (18px+): 3:1 minimum
- ✅ UI components: 3:1 minimum
- ✅ Disabled text: Not required but should be identifiable

---

## Test 4: Color Blindness Simulation

**Duration:** 15 minutes per theme
**Tools:** Color Oracle

### Setup:
1. Download and install Color Oracle
2. Start application
3. Select simulation type

### Steps:

1. **Protanopia (Red-Blind) Simulation**
   - [ ] Activate Protanopia filter
   - [ ] Navigate through application
   - [ ] Check status indicators (success/error/warning)
   - [ ] Verify all information still distinguishable
   - [ ] Note: Can you identify success vs. error?

2. **Deuteranopia (Green-Blind) Simulation**
   - [ ] Activate Deuteranopia filter
   - [ ] Check same elements as above
   - [ ] Note: All states identifiable?

3. **Tritanopia (Blue-Blind) Simulation**
   - [ ] Activate Tritanopia filter
   - [ ] Check same elements
   - [ ] Note: Information not lost?

4. **Achromatopsia (Grayscale) Simulation**
   - [ ] Activate Achromatopsia filter
   - [ ] Verify all UI elements distinguishable without color
   - [ ] Check charts, graphs, status indicators
   - [ ] Note: Contrast sufficient in grayscale?

**Pass Criteria:**
- ✅ All information conveyed without color alone
- ✅ Icons or text labels present for status
- ✅ Interactive elements identifiable in all simulations
- ✅ No confusion between different states

---

## Test 5: Screen Reader Testing

**Duration:** 30 minutes per theme
**Tools:** VoiceOver (macOS) or NVDA (Windows)

### VoiceOver Setup (macOS):
1. System Preferences > Accessibility > VoiceOver
2. Enable VoiceOver (Cmd+F5)
3. Open Safari or Chrome

### NVDA Setup (Windows):
1. Download and install NVDA
2. Start NVDA
3. Open Chrome or Firefox

### Steps:

1. **Test page structure**
   - [ ] Navigate by headings (VO+Cmd+H on Mac)
   - [ ] Verify heading hierarchy (H1, H2, H3)
   - [ ] Note: Headings in logical order

2. **Test form fields**
   - [ ] Navigate to form
   - [ ] Verify labels read aloud
   - [ ] Enter invalid data
   - [ ] Submit form
   - [ ] Verify error messages announced
   - [ ] Note: Errors clear and actionable

3. **Test buttons**
   - [ ] Navigate to button
   - [ ] Verify button role announced
   - [ ] Verify button label clear
   - [ ] Note: Purpose evident from label

4. **Test links**
   - [ ] Navigate to link
   - [ ] Verify link role announced
   - [ ] Verify destination clear from context
   - [ ] Note: "Click here" not used

5. **Test modal dialog**
   - [ ] Open modal
   - [ ] Verify focus moves to modal
   - [ ] Verify modal title announced
   - [ ] Verify can navigate modal content
   - [ ] Close modal
   - [ ] Verify focus returns
   - [ ] Note: Modal experience smooth

6. **Test images**
   - [ ] Navigate to images
   - [ ] Verify alt text present and meaningful
   - [ ] Verify decorative images ignored (aria-hidden)
   - [ ] Note: Images described appropriately

7. **Test dynamic updates**
   - [ ] Trigger dynamic content change
   - [ ] Verify change announced
   - [ ] Note: aria-live working

**Pass Criteria:**
- ✅ All content accessible via screen reader
- ✅ Heading hierarchy logical
- ✅ Form labels clear and associated
- ✅ Error messages announced
- ✅ Buttons have meaningful labels
- ✅ Images have alt text
- ✅ Dynamic updates announced

---

## Test 6: Zoom and Scaling

**Duration:** 10 minutes per theme
**Tools:** Browser zoom

### Steps:

1. **Test 200% zoom**
   - [ ] Set browser zoom to 200% (Cmd/Ctrl + Plus)
   - [ ] Navigate through application
   - [ ] Check for horizontal scrolling
   - [ ] Verify no content overlap
   - [ ] Verify all buttons still clickable
   - [ ] Note: Layout adapts correctly

2. **Test 400% zoom**
   - [ ] Set browser zoom to 400%
   - [ ] Verify content still readable
   - [ ] Check for major layout issues
   - [ ] Note: Usable at high zoom

3. **Test mobile viewport (320px)**
   - [ ] Open DevTools
   - [ ] Toggle device toolbar
   - [ ] Set width to 320px
   - [ ] Verify content fits
   - [ ] Verify touch targets adequate
   - [ ] Note: Mobile layout works

**Pass Criteria:**
- ✅ Content readable at 200% zoom
- ✅ No horizontal scrolling at 200%
- ✅ No content loss at 200%
- ✅ Layout adapts at 400% (degradation acceptable)
- ✅ Mobile viewport (320px) usable

---

## Test 7: Touch Target Sizes (Mobile)

**Duration:** 15 minutes per theme
**Tools:** Chrome DevTools, ruler tool

### Steps:

1. **Enable mobile device emulation**
   - [ ] Open DevTools (F12)
   - [ ] Toggle device toolbar (Cmd+Shift+M)
   - [ ] Select iPhone or Android device

2. **Measure touch targets**
   - [ ] Right-click element
   - [ ] Inspect
   - [ ] Check computed height and width
   - [ ] Verify minimum 44x44 CSS pixels

3. **Elements to test:**
   - [ ] Primary buttons
   - [ ] Secondary buttons
   - [ ] Icon buttons
   - [ ] Close buttons (modals, alerts)
   - [ ] Checkbox inputs
   - [ ] Radio buttons
   - [ ] Nav menu items
   - [ ] Form inputs (height)

4. **Test tap accuracy**
   - [ ] Try tapping small targets
   - [ ] Verify no accidental activations
   - [ ] Note: Can reliably tap intended target

**Pass Criteria:**
- ✅ All interactive elements minimum 44x44px
- ✅ Adequate spacing between touch targets
- ✅ No overlapping tap areas
- ✅ Easy to tap intended target

---

## Test 8: Reduced Motion

**Duration:** 10 minutes per theme
**Tools:** System preferences, browser

### macOS Setup:
1. System Preferences > Accessibility > Display
2. Enable "Reduce Motion"

### Windows Setup:
1. Settings > Ease of Access > Display
2. Enable "Show animations in Windows"

### Steps:

1. **Enable reduced motion**
   - [ ] Enable system-level reduced motion
   - [ ] Refresh browser

2. **Test animations**
   - [ ] Open modal - verify no slide-in animation
   - [ ] Hover buttons - verify reduced/no animation
   - [ ] Scroll page - verify no parallax effects
   - [ ] Submit form - verify instant state changes
   - [ ] Note: Animations disabled or minimal

3. **Verify functionality**
   - [ ] All interactions still work
   - [ ] Immediate visual feedback still present
   - [ ] Note: No functionality lost

**Pass Criteria:**
- ✅ Animations disabled when reduced motion enabled
- ✅ All functionality still works
- ✅ Visual feedback still provided
- ✅ No jarring instant changes

---

## Test 9: High Contrast Mode

**Duration:** 10 minutes per theme
**Tools:** System preferences

### macOS Setup:
1. System Preferences > Accessibility > Display
2. Enable "Increase Contrast"

### Windows Setup:
1. Settings > Ease of Access > High Contrast
2. Select high contrast theme

### Steps:

1. **Enable high contrast**
   - [ ] Enable system high contrast mode
   - [ ] Refresh browser

2. **Test visibility**
   - [ ] Check text visibility
   - [ ] Check button borders
   - [ ] Check form field borders
   - [ ] Check focus indicators
   - [ ] Note: All elements visible

3. **Test contrast ratios**
   - [ ] Use contrast checker
   - [ ] Verify text meets higher standards
   - [ ] Note: Improved contrast

**Pass Criteria:**
- ✅ All text highly visible
- ✅ Borders on interactive elements
- ✅ Focus indicators enhanced
- ✅ No information loss

---

## Test 10: ARIA Attribute Verification

**Duration:** 15 minutes per theme
**Tools:** Browser DevTools, axe DevTools

### Steps:

1. **Install axe DevTools**
   - [ ] Install browser extension
   - [ ] Open DevTools
   - [ ] Navigate to axe tab

2. **Run automated scan**
   - [ ] Click "Scan All of My Page"
   - [ ] Review violations
   - [ ] Note: Number and severity of issues

3. **Manually verify ARIA**
   - [ ] Inspect modal - verify role="dialog" and aria-modal="true"
   - [ ] Inspect buttons - verify aria-label where needed
   - [ ] Inspect forms - verify aria-describedby on errors
   - [ ] Inspect form fields - verify aria-invalid on errors
   - [ ] Inspect dynamic regions - verify aria-live
   - [ ] Note: All ARIA used correctly

**Pass Criteria:**
- ✅ Zero critical axe violations
- ✅ All modals have correct roles
- ✅ All icon buttons have labels
- ✅ Form errors properly associated
- ✅ Dynamic updates use aria-live

---

## Test Results Template

### Test Execution Log

**Date:** _______________
**Tester:** _______________
**Theme:** _______________
**Browser:** _______________
**OS:** _______________

| Test | Pass/Fail | Notes |
|------|-----------|-------|
| Keyboard Navigation | ⬜ | |
| Focus Indicators | ⬜ | |
| Contrast Ratios | ⬜ | |
| Color Blindness | ⬜ | |
| Screen Reader | ⬜ | |
| Zoom & Scaling | ⬜ | |
| Touch Targets | ⬜ | |
| Reduced Motion | ⬜ | |
| High Contrast | ⬜ | |
| ARIA Attributes | ⬜ | |

### Issues Found

| Issue | Severity | Description | Component |
|-------|----------|-------------|-----------|
| 1 | Critical/Major/Minor | | |
| 2 | Critical/Major/Minor | | |
| 3 | Critical/Major/Minor | | |

### Overall Assessment

**WCAG 2.1 AA Compliance:** ⬜ Pass / ⬜ Fail
**Recommended for Production:** ⬜ Yes / ⬜ No / ⬜ With Fixes

**Notes:**
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

**Sign-off:**
- Tester: _______________
- Date: _______________

---

## Quick Reference: Common Issues

### Keyboard Navigation
- Tab order illogical
- Keyboard trap in modal
- Enter/Space don't activate buttons
- Focus not visible

### Contrast
- Text too light on background
- Buttons fail 3:1 ratio
- Status colors too pale

### Screen Reader
- Missing alt text on images
- Form labels not associated
- Error messages not announced
- Heading hierarchy broken

### Color Blindness
- Status indicators use color alone
- Red/green confusion
- No icons on status badges

### Touch Targets
- Buttons smaller than 44x44px
- Checkboxes too small
- Close buttons too small
- Accidental taps common

---

**End of Manual Test Plan**

For automated testing, see: `frontend/src/tests/themes/Accessibility.test.jsx`
For full report, see: `tests/ACCESSIBILITY_TEST_REPORT.md`
