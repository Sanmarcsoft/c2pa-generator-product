# Theme System Migration Guide

**Last Updated:** October 23, 2025
**Version:** 2.1.0
**Audience:** Developers

---

## Table of Contents

1. [Overview](#overview)
2. [Before You Begin](#before-you-begin)
3. [Migration Scenarios](#migration-scenarios)
4. [Breaking Changes](#breaking-changes)
5. [Step-by-Step Migration](#step-by-step-migration)
6. [Component Migration](#component-migration)
7. [Common Pitfalls](#common-pitfalls)
8. [Testing Checklist](#testing-checklist)
9. [Rollback Plan](#rollback-plan)

---

## Overview

This guide helps you migrate existing components and stylesheets to use the C2PA Generator theme system. Whether you're updating legacy code or integrating new components, this guide provides clear steps and examples.

### What's Changed

**Version 2.1.0** introduces:
- Fourth theme: Tech-Savvy & Trustworthy
- Enhanced CSS custom property system
- Improved component APIs
- Standardized naming conventions

**Version 2.0.0** introduced:
- Third theme: Friendly & Approachable
- ThemeSwitcher component variants
- Theme preview system
- Breaking: Theme ID changes

---

## Before You Begin

### Prerequisites

- Node.js 16+
- React 18+
- Basic understanding of CSS custom properties
- Access to the codebase

### Backup Your Code

```bash
# Create a feature branch
git checkout -b migration/theme-system

# Or backup your changes
git stash push -m "pre-migration backup"
```

### Review Current State

1. **Identify hardcoded colors**:
```bash
# Search for hex colors
grep -r "#[0-9A-Fa-f]\{6\}" src/components --include="*.css"

# Search for rgb colors
grep -r "rgb(" src/components --include="*.css"
```

2. **List components using inline styles**:
```bash
grep -r "style=" src/components --include="*.jsx"
```

3. **Find existing theme/style logic**:
```bash
grep -r "theme" src/components --include="*.jsx"
```

---

## Migration Scenarios

### Scenario 1: New Component

**Situation**: Creating a new component from scratch

**Approach**: Use themed components and CSS variables from the start

**Effort**: Low (30 minutes)

**Steps**:
1. Import themed base components
2. Use CSS custom properties in styles
3. Test in all themes

### Scenario 2: Existing Component with Hardcoded Styles

**Situation**: Component has inline styles or hardcoded CSS colors

**Approach**: Replace hardcoded values with CSS variables

**Effort**: Medium (1-2 hours per component)

**Steps**:
1. Extract inline styles to CSS file
2. Replace colors with CSS variables
3. Test visual consistency
4. Update tests

### Scenario 3: Component with Custom Theme Logic

**Situation**: Component already has its own theme/styling system

**Approach**: Replace custom logic with ThemeContext

**Effort**: High (3-4 hours per component)

**Steps**:
1. Remove custom theme logic
2. Integrate ThemeContext
3. Refactor conditional styling
4. Update tests
5. Remove deprecated code

### Scenario 4: Third-Party Component Integration

**Situation**: Using external library that needs theming

**Approach**: Wrap with theme-aware wrapper component

**Effort**: Medium (1-2 hours)

**Steps**:
1. Create wrapper component
2. Listen to `themechange` event
3. Map theme to library config
4. Update on theme change

---

## Breaking Changes

### Version 2.1.0 → 2.0.0

#### No Breaking Changes

Version 2.1.0 is fully backward compatible with 2.0.0. New features:
- Additional theme (Tech-Savvy)
- New CSS variables
- Enhanced accessibility

### Version 2.0.0 → 1.0.0

#### Theme ID Changes

**Breaking**: Theme identifiers were renamed for clarity.

**Before (v1.0.0)**:
```javascript
const THEMES = {
  CLASSIC: 'classic',
  MODERN: 'modern',
};
```

**After (v2.0.0+)**:
```javascript
const THEMES = {
  RETRO: 'retro',  // was 'classic'
  MODERN_MINIMALIST: 'modern-minimalist',  // was 'modern'
  FRIENDLY_APPROACHABLE: 'friendly-approachable',  // new
  TECH_SAVVY: 'tech-savvy-trustworthy',  // new in v2.1.0
};
```

**Migration**:
```javascript
// Update localStorage
const oldTheme = localStorage.getItem('app_theme');
if (oldTheme === 'classic') {
  localStorage.setItem('app_theme', 'retro');
} else if (oldTheme === 'modern') {
  localStorage.setItem('app_theme', 'modern-minimalist');
}

// Update code references
// Before
changeTheme('classic');

// After
changeTheme(THEMES.RETRO);
```

#### CSS Attribute Changes

**Breaking**: Theme attribute moved from `<body>` to `<html>`.

**Before**:
```javascript
document.body.setAttribute('data-theme', theme);
```

**After**:
```javascript
document.documentElement.setAttribute('data-theme', theme);
// Note: <body> also gets class `theme-${themeName}` for compatibility
```

**CSS Migration**:
```css
/* Before */
body[data-theme="classic"] .button {
  background: green;
}

/* After */
[data-theme="retro"] .button {
  background: var(--neon-green);
}
```

#### Context API Changes

**Breaking**: `ThemeContext` export removed, use `useTheme` hook.

**Before**:
```javascript
import { ThemeContext } from './contexts/ThemeContext';

function MyComponent() {
  const context = useContext(ThemeContext);
  return <div>{context.currentTheme}</div>;
}
```

**After**:
```javascript
import { useTheme } from './contexts/ThemeContext';

function MyComponent() {
  const { currentTheme } = useTheme();
  return <div>{currentTheme}</div>;
}
```

---

## Step-by-Step Migration

### Phase 1: Setup (15 minutes)

#### 1.1 Install/Update Dependencies

```bash
# Ensure React 18+
npm install react@^18.0.0 react-dom@^18.0.0

# No additional packages needed
```

#### 1.2 Import Theme CSS

Add to `src/main.jsx` or `src/App.jsx`:

```javascript
// Import theme base styles
import './styles/themes/themeBase.css';

// Import all theme variants
import './styles/themes/retro.css';
import './styles/themes/modernMinimalist.css';
import './styles/themes/friendlyApproachable.css';
import './styles/themes/techSavvy.css';
```

#### 1.3 Wrap App with ThemeProvider

```jsx
// src/App.jsx
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <YourAppComponents />
    </ThemeProvider>
  );
}
```

### Phase 2: Global Styles Migration (30 minutes)

#### 2.1 Update Global CSS

**Before** (`src/index.css`):
```css
body {
  background-color: #ffffff;
  color: #333333;
  font-family: Arial, sans-serif;
}

h1 {
  color: #000000;
  font-size: 2rem;
}

a {
  color: #3B82F6;
}
```

**After**:
```css
body {
  background-color: var(--background-primary);
  color: var(--text-primary);
  font-family: var(--font-primary);
}

h1 {
  color: var(--text-primary);
  font-size: var(--text-h1);
}

a {
  color: var(--accent-blue);
}
```

#### 2.2 Remove Hardcoded Font Imports

**Before**:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

**After**:
Theme CSS files handle font imports. Remove manual imports unless using custom fonts.

### Phase 3: Component Migration (2-4 hours)

#### 3.1 Identify Components to Migrate

Create a migration checklist:

```markdown
- [ ] Header.jsx
- [ ] Navigation.jsx
- [ ] Button.jsx
- [ ] Card.jsx
- [ ] Form.jsx
- [ ] Modal.jsx
- [ ] Footer.jsx
```

#### 3.2 Migrate Button Component

**Before** (`Button.jsx`):
```jsx
function Button({ children, variant = 'primary', onClick }) {
  const styles = {
    primary: {
      backgroundColor: '#3B82F6',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '6px',
    },
    secondary: {
      backgroundColor: 'white',
      color: '#3B82F6',
      border: '1px solid #3B82F6',
      padding: '10px 20px',
      borderRadius: '6px',
    },
  };

  return (
    <button style={styles[variant]} onClick={onClick}>
      {children}
    </button>
  );
}
```

**After** (Option 1: Use Themed Button):
```jsx
import Button from './components/themed/Button';

// Usage
<Button variant="primary" onClick={handleClick}>
  Submit
</Button>
```

**After** (Option 2: Migrate Existing):
```jsx
// Button.jsx
import './Button.css';

function Button({ children, variant = 'primary', onClick }) {
  return (
    <button className={`button button--${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}

// Button.css
.button {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-family: var(--font-primary);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
}

.button--primary {
  background: var(--accent-blue);
  color: var(--text-on-color);
}

.button--primary:hover {
  background: var(--accent-blue-light);
}

.button--secondary {
  background: var(--background-primary);
  color: var(--accent-blue);
  border: 1px solid var(--accent-blue);
}

.button--secondary:hover {
  background: var(--background-secondary);
}
```

#### 3.3 Migrate Card Component

**Before** (`Card.jsx`):
```jsx
function Card({ children, style }) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
```

**After**:
```jsx
import './Card.css';

function Card({ children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
}

// Card.css
.card {
  background: var(--background-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--box-shadow-sm);
  transition: all var(--transition-normal);
}

.card:hover {
  box-shadow: var(--box-shadow-md);
  transform: translateY(-2px);
}
```

#### 3.4 Migrate Form Component

**Before** (`Input.jsx`):
```jsx
function Input({ label, error, ...props }) {
  return (
    <div>
      <label style={{ color: '#4b5563', fontSize: '14px' }}>
        {label}
      </label>
      <input
        style={{
          width: '100%',
          height: '44px',
          padding: '0 12px',
          backgroundColor: 'white',
          border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
          borderRadius: '6px',
          fontSize: '16px',
        }}
        {...props}
      />
      {error && <span style={{ color: '#ef4444', fontSize: '12px' }}>{error}</span>}
    </div>
  );
}
```

**After**:
```jsx
import './Input.css';

function Input({ label, error, className = '', ...props }) {
  return (
    <div className="input-wrapper">
      {label && <label className="input-label">{label}</label>}
      <input
        className={`input ${error ? 'input--error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}

// Input.css
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.input-label {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
}

.input {
  width: 100%;
  height: 44px;
  padding: 0 var(--space-3);
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.input:focus {
  border-color: var(--accent-blue);
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input--error {
  border-color: var(--accent-red);
}

.input-error {
  color: var(--accent-red);
  font-size: var(--text-xs);
}
```

### Phase 4: Theme-Aware Logic (1-2 hours)

#### 4.1 Replace Custom Theme Logic

**Before** (Custom theme state):
```jsx
function Header() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <header className={darkMode ? 'dark' : 'light'}>
      <button onClick={() => setDarkMode(!darkMode)}>
        Toggle Dark Mode
      </button>
    </header>
  );
}
```

**After**:
```jsx
import { useTheme, THEMES } from './contexts/ThemeContext';

function Header() {
  const { currentTheme, changeTheme, isTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = isTheme(THEMES.RETRO)
      ? THEMES.MODERN_MINIMALIST
      : THEMES.RETRO;
    changeTheme(newTheme);
  };

  return (
    <header>
      <button onClick={toggleTheme}>
        Toggle Theme
      </button>
    </header>
  );
}
```

#### 4.2 Theme-Conditional Rendering

**Before**:
```jsx
function Logo() {
  const isDark = document.body.classList.contains('dark');

  return (
    <img src={isDark ? '/logo-light.svg' : '/logo-dark.svg'} alt="Logo" />
  );
}
```

**After**:
```jsx
import { useTheme, THEMES } from './contexts/ThemeContext';

function Logo() {
  const { currentTheme } = useTheme();

  const logos = {
    [THEMES.RETRO]: '/logo-retro.svg',
    [THEMES.MODERN_MINIMALIST]: '/logo-modern.svg',
    [THEMES.FRIENDLY_APPROACHABLE]: '/logo-friendly.svg',
    [THEMES.TECH_SAVVY]: '/logo-tech.svg',
  };

  return <img src={logos[currentTheme]} alt="Logo" />;
}
```

### Phase 5: Testing (1-2 hours)

See [Testing Checklist](#testing-checklist) below.

---

## Component Migration

### Quick Reference Table

| Component Type | Strategy | Complexity | Time |
|----------------|----------|------------|------|
| Button | Use themed component or migrate styles | Low | 15 min |
| Card | Migrate styles to CSS variables | Low | 20 min |
| Input/Form | Migrate styles, add error states | Medium | 30 min |
| Modal | Use themed component or migrate | Medium | 45 min |
| Navigation | Integrate ThemeSwitcher | Medium | 30 min |
| Charts | Listen to `themechange` event | High | 1 hour |
| Custom Complex | Case-by-case analysis | High | 2+ hours |

### Migration Templates

#### Template 1: Simple Component

```jsx
// Before
function SimpleComponent() {
  return <div style={{ color: '#333', fontSize: '16px' }}>Content</div>;
}

// After
import './SimpleComponent.css';

function SimpleComponent() {
  return <div className="simple-component">Content</div>;
}

/* SimpleComponent.css */
.simple-component {
  color: var(--text-primary);
  font-size: var(--text-base);
}
```

#### Template 2: Component with States

```jsx
// Before
function StatefulComponent({ isActive }) {
  return (
    <div style={{
      backgroundColor: isActive ? '#3B82F6' : '#e5e7eb',
      color: isActive ? 'white' : '#333',
    }}>
      Content
    </div>
  );
}

// After
import './StatefulComponent.css';

function StatefulComponent({ isActive }) {
  return (
    <div className={`stateful-component ${isActive ? 'active' : ''}`}>
      Content
    </div>
  );
}

/* StatefulComponent.css */
.stateful-component {
  background: var(--background-tertiary);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.stateful-component.active {
  background: var(--accent-blue);
  color: var(--text-on-color);
}
```

#### Template 3: Component with Theme Logic

```jsx
// Before
function ThemeAwareComponent() {
  const isDark = useIsDarkMode();

  return (
    <div style={{ background: isDark ? '#000' : '#fff' }}>
      {isDark ? <MoonIcon /> : <SunIcon />}
    </div>
  );
}

// After
import { useTheme, THEMES } from './contexts/ThemeContext';
import './ThemeAwareComponent.css';

function ThemeAwareComponent() {
  const { isTheme } = useTheme();

  const isDark = isTheme(THEMES.RETRO) || isTheme(THEMES.TECH_SAVVY);

  return (
    <div className="theme-aware-component">
      {isDark ? <MoonIcon /> : <SunIcon />}
    </div>
  );
}

/* ThemeAwareComponent.css */
.theme-aware-component {
  background: var(--background-primary);
}
```

---

## Common Pitfalls

### Pitfall 1: Inline Styles Override CSS Variables

**Problem**:
```jsx
// ❌ Won't update with theme changes
<div style={{ color: '#3B82F6' }}>Text</div>
```

**Solution**:
```jsx
// ✅ Updates with theme
<div className="text-accent">Text</div>

/* CSS */
.text-accent {
  color: var(--accent-blue);
}
```

### Pitfall 2: Direct DOM Manipulation

**Problem**:
```javascript
// ❌ Bypasses React and theme system
document.getElementById('header').style.backgroundColor = '#fff';
```

**Solution**:
```jsx
// ✅ Use state and CSS variables
const [highlighted, setHighlighted] = useState(false);

<header className={highlighted ? 'highlighted' : ''}>
  {/* content */}
</header>

/* CSS */
header.highlighted {
  background: var(--background-accent);
}
```

### Pitfall 3: Component-Scoped CSS Variables

**Problem**:
```css
/* ❌ Component sets its own variables */
.my-component {
  --primary-color: #3B82F6;
  background: var(--primary-color);
}
```

**Solution**:
```css
/* ✅ Use theme variables */
.my-component {
  background: var(--accent-blue);
}
```

### Pitfall 4: Missing useTheme Import

**Problem**:
```jsx
// ❌ Error: useTheme must be used within ThemeProvider
function MyComponent() {
  const { currentTheme } = useTheme();
  return <div>{currentTheme}</div>;
}

function App() {
  return <MyComponent />; // No ThemeProvider!
}
```

**Solution**:
```jsx
// ✅ Wrap with ThemeProvider
function App() {
  return (
    <ThemeProvider>
      <MyComponent />
    </ThemeProvider>
  );
}
```

### Pitfall 5: Specificity Wars

**Problem**:
```css
/* ❌ Too specific, hard to override */
div.card.primary[data-active="true"] {
  background: #3B82F6;
}
```

**Solution**:
```css
/* ✅ Use classes and CSS variables */
.card--primary.active {
  background: var(--accent-blue);
}
```

### Pitfall 6: Forgetting Mobile Styles

**Problem**:
```css
/* ❌ No mobile considerations */
.component {
  font-size: var(--text-base);
}
```

**Solution**:
```css
/* ✅ Responsive with theme variables */
.component {
  font-size: var(--text-base);
}

@media (max-width: 768px) {
  .component {
    font-size: var(--text-sm);
    padding: var(--space-4);
  }
}
```

---

## Testing Checklist

### Pre-Migration

- [ ] Identify all components to migrate
- [ ] Document current behavior and screenshots
- [ ] Set up testing environment
- [ ] Create migration branch

### During Migration

- [ ] Each component works in all 4 themes
- [ ] No visual regressions
- [ ] Accessibility maintained (contrast, focus)
- [ ] Mobile responsive in all themes
- [ ] Dark theme (Retro, Tech-Savvy) tested in dark room
- [ ] Light theme (Minimalist, Friendly) tested in bright room

### Post-Migration

- [ ] All unit tests pass
- [ ] Visual regression tests pass
- [ ] Accessibility tests pass (WCAG AA)
- [ ] Performance metrics within acceptable range
- [ ] Theme switching works smoothly
- [ ] Theme persists after page reload
- [ ] API sync works (if authenticated)
- [ ] No console errors
- [ ] Documentation updated

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS 14+)
- [ ] Mobile Chrome (Android)

### Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader announces changes
- [ ] Focus indicators visible in all themes
- [ ] Color contrast meets WCAG AA
- [ ] Reduced motion respected

---

## Rollback Plan

If migration causes critical issues:

### Step 1: Revert Branch

```bash
git checkout main
git branch -D migration/theme-system
```

### Step 2: Clear localStorage

```javascript
// In browser console or code
localStorage.removeItem('app_theme');
```

### Step 3: Remove Theme Imports

```jsx
// Remove from main.jsx or App.jsx
// import './styles/themes/retro.css';
// etc.
```

### Step 4: Remove ThemeProvider

```jsx
// Replace
<ThemeProvider>
  <App />
</ThemeProvider>

// With
<App />
```

### Step 5: Deploy Previous Version

```bash
git checkout <previous-stable-commit>
npm run build
npm run deploy
```

---

## Support

### Getting Help

- **Documentation**: Check [Developer Guide](./DEVELOPER_GUIDE_THEMES.md)
- **API Reference**: See [API Reference](./API_REFERENCE_THEMES.md)
- **GitHub Issues**: Open issue with `migration` label
- **Team Chat**: Ask in #frontend-help channel

### Reporting Issues

When reporting migration problems:

1. **Describe the issue**: What went wrong?
2. **Before/After**: Code snippets showing both versions
3. **Screenshots**: Visual comparison if applicable
4. **Environment**: Browser, OS, React version
5. **Error messages**: Full console output

---

**Migration complete?** Share your experience and help improve this guide!
