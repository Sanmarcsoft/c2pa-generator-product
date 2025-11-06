# Contributing to Theme System

**Last Updated:** October 23, 2025
**Version:** 2.1.0
**Audience:** Contributors & Designers

---

## Table of Contents

1. [Overview](#overview)
2. [How to Propose a New Theme](#how-to-propose-a-new-theme)
3. [Design Specification Requirements](#design-specification-requirements)
4. [Code Style Guidelines](#code-style-guidelines)
5. [Component Testing Requirements](#component-testing-requirements)
6. [Accessibility Requirements](#accessibility-requirements)
7. [PR Checklist for Theme Additions](#pr-checklist-for-theme-additions)
8. [Review Process](#review-process)

---

## Overview

Thank you for your interest in contributing to the C2PA Generator theme system! This guide outlines the process for proposing, designing, and implementing new themes.

### What We're Looking For

- **Well-designed themes** that serve specific user needs
- **Accessible designs** meeting WCAG 2.1 AA standards (minimum)
- **Consistent implementations** following our design system
- **Performant code** that doesn't impact app speed
- **Clear documentation** for users and developers

### What We're NOT Looking For

- Themes too similar to existing ones
- Themes that don't meet accessibility standards
- Single-purpose themes (e.g., "Red Theme", "Blue Theme")
- Themes that require significant structural changes
- Personal preference themes without broader appeal

---

## How to Propose a New Theme

### Step 1: Check Existing Themes

Before proposing, review our current themes:

1. **8-Bit Retro**: Nostalgic, gaming-inspired, neon aesthetics
2. **Modern Minimalist**: Clean, professional, whitespace-focused
3. **Friendly & Approachable**: Warm, welcoming, rounded shapes
4. **Tech-Savvy & Trustworthy**: Dark, technical, precision-focused

**Ask yourself:**
- Does my theme serve a distinct user need?
- Is it different enough from existing themes?
- Would a significant number of users benefit?

### Step 2: Open a Discussion Issue

Create a GitHub Discussion (not an issue) with:

**Title**: `[Theme Proposal] Your Theme Name`

**Content**:
```markdown
## Theme Name
[Your theme name]

## Target Audience
Who is this theme for? (e.g., designers, data analysts, mobile users)

## Design Philosophy
Brief description of the visual and interaction philosophy

## Key Differentiators
How is this different from existing themes?

## Use Cases
3-5 specific scenarios where this theme excels

## Visual References
Links to inspiration, mockups, or similar designs

## Accessibility Considerations
How will this theme meet accessibility standards?

## Implementation Complexity
Estimated development effort (low/medium/high)
```

**Example**:
```markdown
## Theme Name
High-Contrast Professional

## Target Audience
Users with visual impairments, users in bright sunlight

## Design Philosophy
Maximum contrast and legibility with professional aesthetics

## Key Differentiators
- Higher contrast than Modern Minimalist (WCAG AAA)
- Stronger borders and separators
- Optimized for bright environments

## Use Cases
1. Users with low vision
2. Outdoor use in sunlight
3. Projection on screens in bright rooms
4. Users who prefer high-contrast interfaces
5. Accessibility-first organizations

## Visual References
- https://example.com/high-contrast-mockup.png
- Inspired by Windows High Contrast themes

## Accessibility Considerations
- Minimum 7:1 contrast for all text
- WCAG AAA compliant
- Enhanced focus indicators (4px)

## Implementation Complexity
Low (similar structure to Modern Minimalist)
```

### Step 3: Community Feedback

Wait for community discussion (minimum 7 days). Address questions and concerns.

### Step 4: Maintainer Approval

A maintainer will review and either:
- ✅ **Approve**: Move to design phase
- 🤔 **Request changes**: Refine proposal
- ❌ **Decline**: Explain why it doesn't fit

---

## Design Specification Requirements

Once approved, create a detailed design specification.

### Required Document Structure

Create `docs/designs/THEME_XX_YOUR_THEME_NAME.md`:

```markdown
# Theme XX: Your Theme Name

## Design Philosophy
[2-3 paragraphs explaining design intent]

---

## Color Palette

### Primary Colors
```css
--color-50: #XXXXXX   /* Lightest */
--color-100: #XXXXXX
...
--color-900: #XXXXXX  /* Darkest */
```

### Accent Colors
```css
--accent-blue: #XXXXXX
--accent-green: #XXXXXX
--accent-yellow: #XXXXXX
--accent-red: #XXXXXX
```

### Semantic Colors
```css
--background-primary: #XXXXXX
--background-secondary: #XXXXXX
--text-primary: #XXXXXX
--text-secondary: #XXXXXX
--border-color: #XXXXXX
```

---

## Typography

### Font Families
```css
--font-primary: 'Font Name', fallback
--font-code: 'Mono Font', monospace
```

### Type Scale
[Define all text sizes]

### Font Weights
[Define all weights used]

---

## Component Specifications

[For each major component, provide:]

### 1. Header
- Desktop layout (ASCII diagram)
- Mobile layout
- Specifications (heights, padding, colors)
- Interaction states

### 2. Buttons
- Visual specifications
- All states (default, hover, active, disabled)
- Variants (primary, secondary, ghost)

### 3. Forms
[Detailed specs for inputs, selects, checkboxes, etc.]

### 4. Cards
[Specs for card components]

[... continue for all major UI elements ...]

---

## Accessibility Standards

### WCAG Compliance Level
AA / AAA

### Color Contrast Ratios
| Element | Ratio | Status |
|---------|-------|--------|
| Body text on background | 4.5:1 | Pass |
| Heading on background | 4.5:1 | Pass |
| Button text on accent | 4.5:1 | Pass |
[... all combinations tested ...]

### Focus States
[Describe focus indicator design]

### Screen Reader Support
[Any special considerations]

---

## Responsive Behavior
[How theme adapts to different screen sizes]

---

## Browser Support
[Minimum browser versions]

---

## Implementation Notes
[Technical considerations for developers]
```

### Design Tools & Assets

**Required Deliverables**:
- Complete design specification (Markdown)
- Color palette (with hex codes and usage)
- Typography scale
- Component mockups (Figma, Sketch, or similar)
- Accessibility audit results
- Optional: Interactive prototype

**Recommended Tools**:
- **Figma**: For design mockups
- **Coolors.co**: For color palette generation
- **WebAIM Contrast Checker**: For accessibility
- **Fontsquirrel**: For font pairing

### Accessibility Requirements

**Mandatory**:
1. ✅ **Contrast Ratios**:
   - Normal text: 4.5:1 minimum
   - Large text (18px+): 3:1 minimum
   - UI components: 3:1 minimum

2. ✅ **Focus Indicators**:
   - Visible on all interactive elements
   - Minimum 2px outline
   - Color contrast 3:1 from background

3. ✅ **Color Independence**:
   - Don't rely solely on color to convey information
   - Use icons, labels, or patterns in addition to color

4. ✅ **Reduced Motion**:
   - Animations can be disabled via `prefers-reduced-motion`

**Testing Tools**:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- Chrome Lighthouse
- Screen readers (NVDA, VoiceOver)

---

## Code Style Guidelines

### CSS Custom Properties

**Naming Convention**:
```css
/* Semantic names */
--background-primary       /* ✅ Good */
--bg-main                  /* ❌ Avoid abbreviations */

/* Use existing conventions */
--accent-blue              /* ✅ Matches other themes */
--primary-button-color     /* ❌ Too specific */

/* Numeric scales */
--space-4                  /* ✅ Good (4 × 0.25rem = 1rem) */
--medium-spacing           /* ❌ Vague */
```

**Required Variables**:

All themes MUST define these variables:

```css
/* Colors (minimum 18) */
--background-primary
--background-secondary
--background-tertiary
--text-primary
--text-secondary
--text-tertiary
--accent-blue
--accent-blue-light
--accent-green
--accent-yellow
--accent-red
--border-color

/* Typography (minimum 15) */
--font-primary
--font-code
--text-display
--text-h1
--text-h2
--text-h3
--text-h4
--text-base
--text-sm
--text-xs
--weight-regular
--weight-semibold
--weight-bold
--leading-tight
--leading-normal

/* Spacing (minimum 10) */
--space-0 through --space-12

/* Layout (minimum 8) */
--radius-sm
--radius-md
--radius-lg
--radius-xl
--box-shadow-sm
--box-shadow-md
--transition-fast
--transition-normal
```

### CSS Organization

```css
/**
 * Theme Name
 *
 * Brief description
 * Author: Your Name
 * Date: YYYY-MM-DD
 */

[data-theme="your-theme-id"] {
  /* ===== COLOR SYSTEM ===== */
  /* Group by category */

  /* ===== TYPOGRAPHY ===== */
  /* Font families, sizes, weights, line heights */

  /* ===== SPACING ===== */
  /* Space scale */

  /* ===== BORDERS & RADII ===== */
  /* Border widths and radii */

  /* ===== SHADOWS ===== */
  /* Box shadows */

  /* ===== TRANSITIONS ===== */
  /* Timing and easing */
}

/* ===== GLOBAL OVERRIDES ===== */
[data-theme="your-theme-id"] body {
  /* Body-level styles */
}

/* ===== COMPONENT OVERRIDES ===== */
[data-theme="your-theme-id"] .component {
  /* Component-specific styles */
}
```

### JavaScript/React

**ThemeContext Updates**:

```javascript
// contexts/ThemeContext.jsx

// 1. Add theme constant
export const THEMES = {
  // ... existing themes ...
  YOUR_THEME: 'your-theme-id',
};

// 2. Add theme name
const getThemeName = (themeId) => {
  const names = {
    // ... existing names ...
    [THEMES.YOUR_THEME]: 'Your Theme Display Name',
  };
  return names[themeId] || themeId;
};
```

**ThemeSwitcher Updates**:

```javascript
// components/themed/ThemeSwitcher.jsx

const THEME_PREVIEWS = {
  // ... existing previews ...
  'your-theme-id': {
    icon: '🎨',  // Choose appropriate emoji
    colors: ['#COLOR1', '#COLOR2', '#COLOR3'],
    description: 'Brief one-line description'
  }
};
```

### File Naming

```
frontend/src/styles/themes/
├── yourThemeName.css          ✅ camelCase
├── your-theme-name.css        ❌ Avoid kebab-case
├── YourThemeName.css          ❌ Avoid PascalCase

docs/designs/
├── THEME_05_YOUR_THEME.md     ✅ UPPERCASE with underscores
├── theme-05-your-theme.md     ❌ Avoid lowercase
```

---

## Component Testing Requirements

### Visual Testing

**Required Screenshots** (for each theme):

1. **Homepage** (desktop, mobile)
2. **Chat interface** (with messages)
3. **Document list** (with cards)
4. **Admin panel** (if applicable)
5. **Form elements** (all states: default, focus, error, disabled)
6. **Modals** (all variants)
7. **Navigation** (collapsed and expanded)

**Tools**:
- Playwright for automated screenshots
- Manual cross-browser testing

### Unit Tests

**Required Tests**:

```javascript
// __tests__/yourTheme.test.js

describe('Your Theme', () => {
  test('applies correct data-theme attribute', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => {
      result.current.changeTheme(THEMES.YOUR_THEME);
    });
    expect(document.documentElement).toHaveAttribute('data-theme', 'your-theme-id');
  });

  test('all CSS variables are defined', () => {
    document.documentElement.setAttribute('data-theme', 'your-theme-id');

    const variables = [
      '--background-primary',
      '--text-primary',
      '--accent-blue',
      // ... test all required variables
    ];

    variables.forEach(varName => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(varName);
      expect(value).toBeTruthy();
    });
  });

  test('theme persists after page reload', () => {
    localStorage.setItem('app_theme', 'your-theme-id');
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.currentTheme).toBe('your-theme-id');
  });
});
```

### Accessibility Tests

```javascript
// __tests__/accessibility/yourTheme.a11y.test.js

describe('Your Theme Accessibility', () => {
  test('meets WCAG AA contrast standards', async () => {
    const { container } = render(<App />);
    document.documentElement.setAttribute('data-theme', 'your-theme-id');

    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });

    expect(results).toHaveNoViolations();
  });

  test('focus indicators are visible', () => {
    render(<Button>Test</Button>);
    const button = screen.getByRole('button');

    button.focus();

    const styles = window.getComputedStyle(button);
    expect(styles.outline).not.toBe('none');
  });
});
```

### Performance Tests

```javascript
test('theme switch completes in under 100ms', async () => {
  const { result } = renderHook(() => useTheme(), { wrapper });

  const start = performance.now();
  await act(async () => {
    await result.current.changeTheme('your-theme-id');
  });
  const end = performance.now();

  expect(end - start).toBeLessThan(100);
});
```

---

## Accessibility Requirements

### WCAG 2.1 Level AA Compliance

**Mandatory Requirements**:

✅ **Perceivable**:
- [ ] Text has 4.5:1 contrast ratio (normal text)
- [ ] Large text has 3:1 contrast ratio (18px+)
- [ ] UI components have 3:1 contrast ratio
- [ ] Color is not the only way information is conveyed

✅ **Operable**:
- [ ] All functionality available via keyboard
- [ ] Focus order is logical
- [ ] Focus indicators are visible (2px min, 3:1 contrast)
- [ ] No keyboard traps
- [ ] Touch targets are at least 44px × 44px on mobile

✅ **Understandable**:
- [ ] Text is readable and understandable
- [ ] Navigation is consistent
- [ ] Error messages are clear and actionable
- [ ] Labels and instructions are provided

✅ **Robust**:
- [ ] Valid HTML
- [ ] ARIA attributes used correctly
- [ ] Compatible with assistive technologies
- [ ] Supports browser text zoom to 200%

### Accessibility Testing Checklist

**Manual Tests**:
- [ ] Test with keyboard only (no mouse)
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Test with browser zoom at 200%
- [ ] Test with high contrast mode enabled
- [ ] Test with `prefers-reduced-motion` enabled
- [ ] Test in bright sunlight (for light themes)
- [ ] Test in dark room (for dark themes)

**Automated Tests**:
- [ ] Run axe DevTools
- [ ] Run Chrome Lighthouse
- [ ] Run WAVE (Web Accessibility Evaluation Tool)
- [ ] Run pa11y CI in build pipeline

### Common Accessibility Pitfalls

❌ **Don't**:
- Use color alone to indicate status
- Use low-contrast colors (e.g., light gray on white)
- Hide focus indicators
- Use generic link text ("click here")
- Auto-play animations without user control

✅ **Do**:
- Combine color with icons or text labels
- Test contrast with online tools
- Ensure visible focus indicators
- Use descriptive link text
- Respect `prefers-reduced-motion`

---

## PR Checklist for Theme Additions

### Before Opening PR

- [ ] Design specification document created
- [ ] Color palette defined and accessible
- [ ] Typography scale defined
- [ ] All required CSS variables defined
- [ ] Component overrides implemented
- [ ] Theme registered in `ThemeContext.jsx`
- [ ] Theme preview added to `ThemeSwitcher.jsx`
- [ ] CSS file imported in `main.jsx`

### Code Quality

- [ ] Code follows style guidelines
- [ ] CSS is organized and commented
- [ ] No hardcoded values (use variables)
- [ ] No `!important` rules (except rare justified cases)
- [ ] Linting passes (`npm run lint`)
- [ ] Formatting applied (`npm run format`)

### Testing

- [ ] Unit tests written and passing
- [ ] Accessibility tests passing
- [ ] Visual regression tests passing
- [ ] Manual testing in all supported browsers
- [ ] Mobile responsive on iOS and Android
- [ ] Theme persists after page reload
- [ ] Theme syncs to API (if authenticated)

### Documentation

- [ ] Design specification complete
- [ ] User-facing description written
- [ ] API documentation updated (if new features)
- [ ] Migration guide updated (if breaking changes)
- [ ] CHANGELOG.md entry added
- [ ] README.md updated with new theme

### Accessibility

- [ ] WCAG AA compliance verified
- [ ] Contrast ratios documented
- [ ] Focus indicators tested
- [ ] Screen reader tested
- [ ] Keyboard navigation works
- [ ] Reduced motion respected

### Performance

- [ ] CSS file size reasonable (< 50KB)
- [ ] No performance regressions
- [ ] Theme switch under 100ms
- [ ] Lighthouse score maintained

### PR Description Template

```markdown
## Theme Addition: [Your Theme Name]

### Overview
Brief description of the theme and its target audience.

### Design Philosophy
2-3 sentences explaining the design approach.

### Key Features
- Feature 1
- Feature 2
- Feature 3

### Screenshots
[Attach screenshots of major UI components]

### Accessibility
- WCAG Level: AA / AAA
- Contrast ratios: [list key ratios]
- Tested with: [screen readers, keyboard, etc.]

### Testing
- [ ] All automated tests pass
- [ ] Manual testing complete
- [ ] Cross-browser testing done

### Checklist
- [ ] Design spec created
- [ ] Code implemented
- [ ] Tests written
- [ ] Documentation updated
- [ ] Accessibility verified

### Related Issues
Closes #[issue number]

### Reviewers
@maintainer1 @maintainer2
```

---

## Review Process

### Timeline

1. **PR Opened**: Automated checks run (linting, tests)
2. **Initial Review** (2-3 days): Maintainer reviews code and design
3. **Feedback Round** (1 week): Address feedback and iterate
4. **Final Review** (2-3 days): Approval or request changes
5. **Merge** (1 day): Merged to `main` branch
6. **Release**: Included in next minor version release

**Total Time**: 2-3 weeks on average

### Review Criteria

**Design**:
- ✅ Theme serves a clear user need
- ✅ Visual design is consistent and polished
- ✅ Differentiated from existing themes
- ✅ Accessibility standards met

**Code**:
- ✅ Follows style guidelines
- ✅ Well-organized and commented
- ✅ No performance regressions
- ✅ Tests comprehensive and passing

**Documentation**:
- ✅ Design specification complete
- ✅ User guide updated
- ✅ API documentation updated
- ✅ Clear and accurate

### Feedback & Iteration

**Expect**:
- Constructive feedback on design and code
- Requests for changes or improvements
- Questions about design decisions
- Suggestions for optimization

**Respond**:
- Address feedback promptly
- Ask questions if unclear
- Be open to iteration
- Document decisions

### Approval

**Required Approvals**: 2 maintainers

**Approval Criteria**:
- All checklist items complete
- Tests passing
- Documentation complete
- No outstanding feedback

**After Approval**:
- Maintainer merges PR
- CI/CD deploys to staging
- QA team verifies
- Deployed to production in next release

---

## Code of Conduct

All contributors must follow our [Code of Conduct](../CODE_OF_CONDUCT.md).

**Summary**:
- Be respectful and inclusive
- Welcome diverse perspectives
- Provide constructive feedback
- Focus on the design/code, not the person
- Assume good intent

---

## Getting Help

### Resources

- **Documentation**: [Developer Guide](./DEVELOPER_GUIDE_THEMES.md)
- **Design Examples**: See existing theme specifications
- **API Reference**: [API Reference](./API_REFERENCE_THEMES.md)
- **Figma Community**: Browse C2PA Generator design files

### Ask Questions

- **GitHub Discussions**: For design proposals and questions
- **GitHub Issues**: For bugs or technical issues
- **Discord**: #theme-contributors channel
- **Email**: themes@c2pa-generator.com

### Mentorship

New to theme design or open source? We offer mentorship:

1. Comment on an issue with `[Mentorship Request]`
2. A maintainer will reach out
3. We'll guide you through the process
4. You'll learn design systems and accessibility

---

## Recognition

Contributors are recognized in:
- Project README (Contributors section)
- Release notes (theme author credited)
- Project website (theme designer spotlight)
- Annual contributor report

**Thank you for contributing to C2PA Generator! Your work makes the platform more accessible and enjoyable for everyone.**

---

## Quick Links

- [Design Specification Template](../templates/THEME_SPEC_TEMPLATE.md)
- [PR Template](../.github/PULL_REQUEST_TEMPLATE.md)
- [Color Palette Generator](https://coolors.co/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Existing Themes](../frontend/src/styles/themes/)

---

**Questions?** Open a GitHub Discussion or email themes@c2pa-generator.com
