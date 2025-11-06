# Developer Guide: C2PA Generator Theme System

**Last Updated:** October 23, 2025
**Version:** 2.1.0
**Audience:** Frontend Developers

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Getting Started](#getting-started)
3. [Theme Implementation](#theme-implementation)
4. [Using Themed Components](#using-themed-components)
5. [Code Examples & Patterns](#code-examples--patterns)
6. [Creating a New Theme](#creating-a-new-theme)
7. [CSS Custom Properties Reference](#css-custom-properties-reference)
8. [Component API Documentation](#component-api-documentation)
9. [Testing Guidelines](#testing-guidelines)
10. [Performance Considerations](#performance-considerations)
11. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Design Philosophy

The C2PA Generator theme system is built on three core principles:

1. **Separation of Concerns**: Theme logic separated from business logic
2. **CSS Custom Properties**: All themes use CSS variables for maximum flexibility
3. **Context-Based State**: React Context API manages theme state globally

### Technology Stack

- **React 18+**: Context API for global state
- **CSS Custom Properties**: Variable-based theming
- **Local Storage API**: Theme persistence
- **PropTypes**: Runtime type checking

### File Structure

```
frontend/
├── src/
│   ├── contexts/
│   │   └── ThemeContext.jsx          # Theme state management
│   ├── components/
│   │   └── themed/
│   │       ├── ThemeSwitcher.jsx     # Theme selector UI
│   │       ├── ThemeSwitcher.css
│   │       ├── Button.jsx            # Themed button component
│   │       ├── Button.css
│   │       ├── Card.jsx              # Themed card component
│   │       ├── Card.css
│   │       ├── Badge.jsx
│   │       ├── ChatMessage.jsx
│   │       ├── Input.jsx
│   │       ├── Modal.jsx
│   │       └── Navigation.jsx
│   └── styles/
│       └── themes/
│           ├── themeBase.css         # Shared base styles
│           ├── retro.css             # 8-Bit Retro theme
│           ├── modernMinimalist.css  # Modern Minimalist theme
│           ├── friendlyApproachable.css  # Friendly theme
│           └── techSavvy.css         # Tech-Savvy theme
```

### Data Flow

```
┌─────────────────┐
│   User Action   │
│  (Click Theme)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ThemeSwitcher  │
│   Component     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  changeTheme()  │
│   from Context  │
└────────┬────────┘
         │
         ├──────────────────┬──────────────────┐
         ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Local       │   │  Update DOM  │   │  API Sync    │
│  Storage     │   │  data-theme  │   │  (if logged) │
└──────────────┘   └──────────────┘   └──────────────┘
         │                  │                  │
         └──────────────────┴──────────────────┘
                            │
                            ▼
                   ┌──────────────┐
                   │  CSS Updates │
                   │  Applied     │
                   └──────────────┘
```

---

## Getting Started

### Prerequisites

- Node.js 16+ and npm 8+
- React 18+
- Basic understanding of React Context API
- Familiarity with CSS Custom Properties

### Installation

The theme system is built into the application. No additional packages required.

### Quick Start

1. **Import ThemeProvider**

```jsx
// src/App.jsx
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider user={currentUser} token={authToken}>
      <YourAppComponents />
    </ThemeProvider>
  );
}
```

2. **Import Theme CSS**

```jsx
// src/main.jsx or src/index.jsx
import './styles/themes/themeBase.css';
import './styles/themes/retro.css';
import './styles/themes/modernMinimalist.css';
import './styles/themes/friendlyApproachable.css';
import './styles/themes/techSavvy.css';
```

3. **Use the Theme Switcher**

```jsx
// src/components/Header.jsx
import ThemeSwitcher from './components/themed/ThemeSwitcher';

function Header() {
  return (
    <header>
      <nav>
        {/* ...other nav items... */}
        <ThemeSwitcher variant="dropdown" />
      </nav>
    </header>
  );
}
```

4. **Access Theme in Components**

```jsx
import { useTheme } from './contexts/ThemeContext';

function MyComponent() {
  const { currentTheme, changeTheme, getThemeName } = useTheme();

  return (
    <div>
      <p>Current theme: {getThemeName(currentTheme)}</p>
    </div>
  );
}
```

---

## Theme Implementation

### ThemeContext API

#### Provider Props

```jsx
<ThemeProvider
  user={userObject}      // Optional: User object for API sync
  token={authToken}      // Optional: JWT for authenticated requests
>
  {children}
</ThemeProvider>
```

#### Available Themes

```javascript
import { THEMES } from './contexts/ThemeContext';

console.log(THEMES);
// {
//   RETRO: 'retro',
//   MODERN_MINIMALIST: 'modern-minimalist',
//   FRIENDLY_APPROACHABLE: 'friendly-approachable',
//   TECH_SAVVY: 'tech-savvy-trustworthy',
// }
```

#### Context Value

```javascript
const {
  currentTheme,         // string: Current theme ID
  themes,               // object: THEMES constant
  changeTheme,          // function: (themeId: string) => Promise<void>
  resetTheme,           // function: () => void
  getThemeName,         // function: (themeId: string) => string
  loading,              // boolean: Theme change in progress
  error,                // string|null: Error message if any
  isTheme,              // function: (themeId: string) => boolean
} = useTheme();
```

### Theme Selection Hook

```jsx
import { useTheme } from './contexts/ThemeContext';

function ThemeAwareComponent() {
  const { currentTheme, changeTheme, loading, error } = useTheme();

  const handleThemeChange = async (newTheme) => {
    try {
      await changeTheme(newTheme);
      // Theme changed successfully
    } catch (err) {
      console.error('Failed to change theme:', err);
    }
  };

  if (loading) {
    return <div>Loading theme...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div data-theme={currentTheme}>
      {/* Component content */}
    </div>
  );
}
```

### Persistence Mechanism

#### localStorage

```javascript
// Theme automatically saved to localStorage
localStorage.getItem('app_theme'); // Returns theme ID

// Persistence flow:
// 1. User selects theme
// 2. changeTheme() called
// 3. State updated
// 4. localStorage.setItem('app_theme', newTheme)
// 5. If logged in: API sync (optional)
```

#### API Synchronization

For logged-in users, theme preference syncs to backend:

```javascript
// GET /api/user/theme
// Returns: { theme: 'modern-minimalist' }

// PUT /api/user/theme
// Body: { theme: 'retro' }
// Returns: { success: true }
```

---

## Using Themed Components

### Pre-Built Themed Components

All components in `/src/components/themed/` are theme-aware and use CSS custom properties.

#### Button Component

```jsx
import Button from './components/themed/Button';

// Primary button
<Button variant="primary" onClick={handleClick}>
  Submit
</Button>

// Secondary button
<Button variant="secondary" size="small">
  Cancel
</Button>

// Danger button with loading state
<Button variant="primary" danger loading>
  Delete
</Button>

// Full width button
<Button variant="primary" fullWidth>
  Continue
</Button>
```

**Button Props:**
```typescript
{
  children: ReactNode;           // Button content
  variant?: 'primary' | 'secondary' | 'ghost';  // Default: 'primary'
  size?: 'small' | 'medium' | 'large';          // Default: 'medium'
  danger?: boolean;              // Red destructive styling
  disabled?: boolean;            // Disabled state
  loading?: boolean;             // Show spinner, disable interaction
  fullWidth?: boolean;           // 100% width
  type?: 'button' | 'submit' | 'reset';  // Default: 'button'
  onClick?: () => void;          // Click handler
  className?: string;            // Additional CSS classes
}
```

#### Card Component

```jsx
import Card, { CardHeader, CardBody, CardFooter } from './components/themed/Card';

// Simple card
<Card>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>

// Interactive card
<Card interactive hover onClick={handleCardClick}>
  <p>Clickable card</p>
</Card>

// Structured card
<Card padding="large">
  <CardHeader>
    <h3>Header Content</h3>
  </CardHeader>
  <CardBody>
    <p>Main content goes here</p>
  </CardBody>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>
```

**Card Props:**
```typescript
{
  children: ReactNode;
  interactive?: boolean;         // Adds cursor: pointer
  hover?: boolean;               // Show hover effects
  padding?: 'none' | 'small' | 'medium' | 'large';  // Default: 'medium'
  className?: string;
  onClick?: () => void;
}
```

#### Badge Component

```jsx
import Badge from './components/themed/Badge';

<Badge>Default</Badge>
<Badge variant="success">Completed</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info">New</Badge>
```

#### Input Component

```jsx
import Input from './components/themed/Input';

<Input
  type="text"
  placeholder="Enter text..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

<Input
  type="email"
  label="Email Address"
  required
  error="Invalid email format"
/>
```

#### Modal Component

```jsx
import Modal from './components/themed/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
>
  <p>Are you sure you want to proceed?</p>
  <div className="modal-actions">
    <Button variant="secondary" onClick={onCancel}>Cancel</Button>
    <Button variant="primary" danger onClick={onConfirm}>Confirm</Button>
  </div>
</Modal>
```

### Using CSS Custom Properties

#### In Component CSS

```css
/* Button.css */
.themed-button {
  background: var(--accent-blue);
  color: var(--text-on-color, white);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-primary);
  transition: all var(--transition-fast);
}

.themed-button:hover {
  background: var(--accent-blue-light);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-md);
}

.themed-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

#### In Inline Styles (Avoid)

While possible, prefer CSS classes:

```jsx
// ❌ Avoid
<div style={{ color: 'var(--text-primary)' }}>Text</div>

// ✅ Prefer
<div className="text-primary">Text</div>
```

#### Dynamic Styles with Theme

```jsx
function DynamicComponent() {
  const { currentTheme } = useTheme();

  // Compute styles based on theme
  const styles = {
    retro: { fontSize: '0.875rem' },
    'modern-minimalist': { fontSize: '1rem' },
    'friendly-approachable': { fontSize: '1rem' },
    'tech-savvy-trustworthy': { fontSize: '0.9375rem' },
  };

  return (
    <div style={styles[currentTheme]}>
      Content adapts to theme
    </div>
  );
}
```

---

## Code Examples & Patterns

### Pattern 1: Theme-Aware Conditional Rendering

```jsx
import { useTheme, THEMES } from './contexts/ThemeContext';

function WelcomeMessage() {
  const { currentTheme } = useTheme();

  // Different content based on theme
  const messages = {
    [THEMES.RETRO]: '👾 WELCOME, PLAYER ONE!',
    [THEMES.MODERN_MINIMALIST]: 'Welcome to C2PA Generator',
    [THEMES.FRIENDLY_APPROACHABLE]: '😊 Hi there! Welcome!',
    [THEMES.TECH_SAVVY]: '⚡ SYSTEM INITIALIZED',
  };

  return <h1>{messages[currentTheme]}</h1>;
}
```

### Pattern 2: Theme-Specific Components

```jsx
function ThemeSpecificFeature() {
  const { isTheme } = useTheme();

  if (isTheme('retro')) {
    return <RetroAnimatedBackground />;
  }

  if (isTheme('tech-savvy-trustworthy')) {
    return <GridPatternBackground />;
  }

  return null; // No special background for other themes
}
```

### Pattern 3: Custom Theme Hook

```jsx
// hooks/useThemeStyles.js
import { useTheme } from '../contexts/ThemeContext';

export function useThemeStyles() {
  const { currentTheme } = useTheme();

  const isDark = ['retro', 'tech-savvy-trustworthy'].includes(currentTheme);
  const isLight = ['modern-minimalist', 'friendly-approachable'].includes(currentTheme);

  return {
    isDark,
    isLight,
    currentTheme,
  };
}

// Usage
function MyComponent() {
  const { isDark, isLight } = useThemeStyles();

  return (
    <div className={isDark ? 'dark-mode' : 'light-mode'}>
      {/* Content */}
    </div>
  );
}
```

### Pattern 4: Theme Event Listener

```jsx
useEffect(() => {
  const handleThemeChange = (event) => {
    const newTheme = event.detail.theme;
    console.log('Theme changed to:', newTheme);

    // Perform side effects
    updateChartColors(newTheme);
    refreshDataVisualization();
  };

  window.addEventListener('themechange', handleThemeChange);

  return () => {
    window.removeEventListener('themechange', handleThemeChange);
  };
}, []);
```

### Pattern 5: Lazy Loading Theme CSS

```jsx
// For performance optimization in large apps
const loadThemeCSS = async (themeName) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `/styles/themes/${themeName}.css`;
  document.head.appendChild(link);
};

// In ThemeContext
const changeTheme = async (newTheme) => {
  await loadThemeCSS(newTheme);
  setCurrentTheme(newTheme);
};
```

### Pattern 6: Theme-Based Animations

```jsx
import { useTheme } from './contexts/ThemeContext';

function AnimatedCard({ children }) {
  const { currentTheme } = useTheme();

  const animationVariants = {
    retro: {
      initial: { scale: 0, rotate: -180 },
      animate: { scale: 1, rotate: 0 },
      transition: { type: 'spring', stiffness: 260, damping: 20 },
    },
    'modern-minimalist': {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    'friendly-approachable': {
      initial: { scale: 0.3, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: { type: 'spring', bounce: 0.5 },
    },
    'tech-savvy-trustworthy': {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.15, ease: 'easeOut' },
    },
  };

  return (
    <motion.div {...animationVariants[currentTheme]}>
      {children}
    </motion.div>
  );
}
```

---

## Creating a New Theme

### Step 1: Design Specification

Document your theme following this template:

```markdown
# Theme: [Your Theme Name]

## Design Philosophy
[Brief description of theme personality and use case]

## Color Palette
- Background Primary: #XXXXXX
- Background Secondary: #XXXXXX
- Text Primary: #XXXXXX
- Accent Blue: #XXXXXX
[etc...]

## Typography
- Font Primary: 'Font Name', fallback
- Font Code: 'Mono Font', monospace
- Text Base: 1rem
[etc...]

## Spacing & Layout
- Border Radius: X px
- Spacing Base: X px
[etc...]
```

### Step 2: Create CSS File

Create `/frontend/src/styles/themes/yourTheme.css`:

```css
/**
 * Your Theme Name
 *
 * Brief description of theme purpose and personality
 */

[data-theme="your-theme-id"] {
  /* ===== COLOR SYSTEM ===== */
  --background-primary: #XXXXXX;
  --background-secondary: #XXXXXX;
  --background-tertiary: #XXXXXX;

  --text-primary: #XXXXXX;
  --text-secondary: #XXXXXX;
  --text-tertiary: #XXXXXX;

  --accent-blue: #XXXXXX;
  --accent-blue-light: #XXXXXX;
  --accent-green: #XXXXXX;
  --accent-yellow: #XXXXXX;
  --accent-red: #XXXXXX;

  --border-color: #XXXXXX;

  /* ===== TYPOGRAPHY ===== */
  --font-primary: 'Your Font', -apple-system, sans-serif;
  --font-code: 'Your Mono Font', monospace;

  --text-display: 3rem;
  --text-h1: 2.25rem;
  --text-h2: 1.875rem;
  --text-h3: 1.5rem;
  --text-h4: 1.25rem;
  --text-h5: 1.125rem;
  --text-base: 1rem;
  --text-sm: 0.875rem;
  --text-xs: 0.75rem;

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* ===== SPACING ===== */
  --space-0: 0;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;

  /* ===== BORDERS & RADII ===== */
  --border-width: 1px;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;

  /* ===== SHADOWS ===== */
  --box-shadow-sm: 0 1px 3px rgba(0,0,0,0.12);
  --box-shadow-md: 0 4px 6px rgba(0,0,0,0.16);
  --box-shadow-lg: 0 10px 15px rgba(0,0,0,0.2);

  /* ===== TRANSITIONS ===== */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;

  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* ===== GLOBAL OVERRIDES ===== */
[data-theme="your-theme-id"] body {
  background-color: var(--background-primary);
  color: var(--text-primary);
  font-family: var(--font-primary);
}

/* ===== COMPONENT OVERRIDES ===== */
[data-theme="your-theme-id"] .themed-button {
  /* Custom button styling for this theme */
}

[data-theme="your-theme-id"] .themed-card {
  /* Custom card styling for this theme */
}
```

### Step 3: Update ThemeContext

Add your theme to the `THEMES` constant:

```jsx
// contexts/ThemeContext.jsx

export const THEMES = {
  RETRO: 'retro',
  MODERN_MINIMALIST: 'modern-minimalist',
  FRIENDLY_APPROACHABLE: 'friendly-approachable',
  TECH_SAVVY: 'tech-savvy-trustworthy',
  YOUR_THEME: 'your-theme-id',  // Add this line
};

// Update getThemeName function
const getThemeName = (themeId) => {
  const names = {
    [THEMES.RETRO]: '8-Bit Retro',
    [THEMES.MODERN_MINIMALIST]: 'Modern Minimalist',
    [THEMES.FRIENDLY_APPROACHABLE]: 'Friendly & Approachable',
    [THEMES.TECH_SAVVY]: 'Tech-Savvy & Trustworthy',
    [THEMES.YOUR_THEME]: 'Your Theme Display Name',  // Add this line
  };
  return names[themeId] || themeId;
};
```

### Step 4: Add Theme Preview

Update `ThemeSwitcher.jsx`:

```jsx
// components/themed/ThemeSwitcher.jsx

const THEME_PREVIEWS = {
  // ...existing themes...
  [THEMES.YOUR_THEME]: {
    icon: '🎨',  // Choose appropriate emoji
    colors: ['#COLOR1', '#COLOR2', '#COLOR3'],
    description: 'Brief theme description'
  }
};
```

### Step 5: Import Theme CSS

```jsx
// src/main.jsx or App.jsx
import './styles/themes/yourTheme.css';
```

### Step 6: Test Theme

1. **Visual Testing**
   - Switch to your theme in the UI
   - Check all components render correctly
   - Verify colors, spacing, typography

2. **Contrast Testing**
   - Use WCAG contrast checker
   - Ensure AA compliance minimum (4.5:1 for text)

3. **Responsive Testing**
   - Test on mobile, tablet, desktop
   - Verify all breakpoints work

4. **Accessibility Testing**
   - Test with screen reader
   - Verify keyboard navigation
   - Check focus indicators

### Step 7: Documentation

Create documentation for your theme:
- User-facing description
- Technical implementation notes
- Design rationale
- Known issues or limitations

---

## CSS Custom Properties Reference

### Color Variables

#### Background
```css
--background-primary      /* Main background color */
--background-secondary    /* Secondary areas, cards */
--background-tertiary     /* Tertiary areas, hover states */
--background-elevated     /* Modals, dropdowns */
```

#### Text
```css
--text-primary           /* Primary text color */
--text-secondary         /* Secondary text, labels */
--text-tertiary          /* Disabled text, placeholders */
--text-on-color          /* Text on colored backgrounds */
```

#### Accents
```css
--accent-blue            /* Primary actions, links */
--accent-blue-light      /* Hover states */
--accent-blue-dark       /* Active states */
--accent-green           /* Success states */
--accent-yellow          /* Warning states */
--accent-red             /* Error, destructive states */
--accent-orange          /* Notifications */
--accent-purple          /* Special features */
```

#### Borders
```css
--border-color           /* Default border color */
--border-subtle          /* Subtle dividers */
--border-medium          /* Standard borders */
--border-strong          /* Emphasized borders */
--border-electric        /* Accent borders (tech theme) */
```

### Typography Variables

```css
/* Font Families */
--font-primary           /* Body text font */
--font-headings          /* Heading font */
--font-code              /* Code and monospace */
--font-mono-num          /* Monospace for numbers */

/* Font Sizes */
--text-display           /* 3rem - Hero text */
--text-h1                /* 2.25rem - Page titles */
--text-h2                /* 1.875rem - Section headers */
--text-h3                /* 1.5rem - Subsections */
--text-h4                /* 1.25rem - Card titles */
--text-h5                /* 1.125rem - Small headings */
--text-base              /* 1rem - Body text */
--text-sm                /* 0.875rem - Secondary text */
--text-xs                /* 0.75rem - Captions */
--text-code              /* 0.9375rem - Code blocks */

/* Font Weights */
--weight-light           /* 300 */
--weight-regular         /* 400 */
--weight-medium          /* 500 */
--weight-semibold        /* 600 */
--weight-bold            /* 700 */
--weight-extrabold       /* 800 */
--weight-black           /* 900 */

/* Line Heights */
--leading-tight          /* 1.2-1.3 - Headings */
--leading-snug           /* 1.4 - Compact text */
--leading-normal         /* 1.5-1.6 - Body text */
--leading-relaxed        /* 1.75-1.8 - Long-form */

/* Letter Spacing */
--tracking-tight         /* -0.02em - Large headings */
--tracking-normal        /* 0 - Default */
--tracking-wide          /* 0.025em - Uppercase */
--tracking-wider         /* 0.05em - Buttons, badges */
```

### Spacing Variables

```css
--space-0                /* 0 */
--space-px               /* 1px */
--space-1                /* 0.25rem (4px) */
--space-2                /* 0.5rem (8px) */
--space-3                /* 0.75rem (12px) */
--space-4                /* 1rem (16px) */
--space-5                /* 1.25rem (20px) */
--space-6                /* 1.5rem (24px) */
--space-8                /* 2rem (32px) */
--space-10               /* 2.5rem (40px) */
--space-12               /* 3rem (48px) */
--space-16               /* 4rem (64px) */
--space-20               /* 5rem (80px) */
--space-24               /* 6rem (96px) */
--space-32               /* 8rem (128px) */
```

### Border & Radius Variables

```css
--border-width           /* 1px or 2px */
--radius-none            /* 0 */
--radius-sm              /* 0.25rem (4px) */
--radius-md              /* 0.375rem (6px) */
--radius-lg              /* 0.5rem (8px) */
--radius-xl              /* 0.75rem (12px) */
--radius-2xl             /* 1rem (16px) */
--radius-full            /* 9999px (circular) */
```

### Shadow Variables

```css
--box-shadow-sm          /* Subtle shadow */
--box-shadow-md          /* Medium shadow */
--box-shadow-lg          /* Large shadow */

/* Theme-specific shadows */
--shadow-sm              /* RGBA value */
--shadow-md              /* RGBA value */
--shadow-lg              /* RGBA value */

/* Glow effects (tech theme) */
--glow-cyan              /* 0 0 20px rgba(0, 229, 255, 0.4) */
--glow-teal              /* 0 0 20px rgba(0, 255, 163, 0.4) */
--glow-blue              /* 0 0 20px rgba(0, 128, 255, 0.4) */
```

### Transition Variables

```css
--transition-instant     /* 100ms ease */
--transition-fast        /* 150ms ease */
--transition-normal      /* 200ms ease */
--transition-slow        /* 300ms ease */
--transition-smooth      /* 400ms cubic-bezier */
--transition-bounce      /* 300ms bounce (friendly theme) */

/* Easing Functions */
--ease-in                /* cubic-bezier(0.4, 0, 1, 1) */
--ease-out               /* cubic-bezier(0, 0, 0.2, 1) */
--ease-in-out            /* cubic-bezier(0.4, 0, 0.2, 1) */
--ease-sharp             /* cubic-bezier(0.4, 0, 0.6, 1) (tech) */
--ease-bounce            /* cubic-bezier(0.68, -0.55, 0.265, 1.55) (friendly) */
```

### Layout Variables

```css
--container-sm           /* 640px */
--container-md           /* 768px */
--container-lg           /* 1024px */
--container-xl           /* 1280px */
--container-2xl          /* 1440-1536px */

--breakpoint-sm          /* 640px */
--breakpoint-md          /* 768px */
--breakpoint-lg          /* 1024px */
--breakpoint-xl          /* 1280px */
```

---

## Component API Documentation

### ThemeContext

#### `useTheme()` Hook

**Returns:**
```typescript
{
  currentTheme: string;                      // Current theme ID
  themes: typeof THEMES;                     // THEMES constant object
  changeTheme: (themeId: string) => Promise<void>;  // Change theme function
  resetTheme: () => void;                    // Reset to default
  getThemeName: (themeId: string) => string; // Get display name
  loading: boolean;                          // Loading state
  error: string | null;                      // Error message
  isTheme: (themeId: string) => boolean;     // Check if current theme matches
}
```

**Usage:**
```jsx
const { currentTheme, changeTheme, isTheme } = useTheme();
```

**Error Handling:**
```jsx
try {
  await changeTheme('modern-minimalist');
} catch (error) {
  console.error('Theme change failed:', error);
  // Theme change failed, user sees error state
}
```

#### `ThemeProvider` Component

**Props:**
```typescript
{
  children: React.ReactNode;   // Required: App content
  user?: object | null;         // Optional: User object
  token?: string | null;        // Optional: Auth token
}
```

**Example:**
```jsx
<ThemeProvider user={userData} token={jwtToken}>
  <App />
</ThemeProvider>
```

### ThemeSwitcher Component

**Props:**
```typescript
{
  variant?: 'dropdown' | 'buttons' | 'compact';  // Default: 'dropdown'
  showPreview?: boolean;                          // Default: true
  className?: string;                             // Additional CSS
}
```

**Variants:**

**Dropdown (Default):**
```jsx
<ThemeSwitcher variant="dropdown" showPreview={true} />
```
- Shows current theme name
- Dropdown menu with all themes
- Color preview swatches
- Theme descriptions

**Buttons:**
```jsx
<ThemeSwitcher variant="buttons" showPreview={false} />
```
- Horizontal button group
- Each button is a theme option
- Inline display (takes more space)

**Compact:**
```jsx
<ThemeSwitcher variant="compact" />
```
- Icon-only button
- Minimal space usage
- Tooltip shows theme name
- Good for mobile/tight spaces

### Button Component

**Props:**
```typescript
{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';   // Default: 'primary'
  size?: 'small' | 'medium' | 'large';           // Default: 'medium'
  danger?: boolean;                               // Default: false
  disabled?: boolean;                             // Default: false
  loading?: boolean;                              // Default: false
  fullWidth?: boolean;                            // Default: false
  type?: 'button' | 'submit' | 'reset';          // Default: 'button'
  onClick?: (event: React.MouseEvent) => void;
  className?: string;
}
```

**Sizes:**
- `small`: 0.75rem padding, 0.875rem font
- `medium`: 0.625rem vertical, 1.25rem horizontal, 0.9375rem font
- `large`: 0.875rem vertical, 1.75rem horizontal, 1rem font

### Card Component

**Props:**
```typescript
{
  children: React.ReactNode;
  interactive?: boolean;        // Default: false
  hover?: boolean;               // Default: false
  padding?: 'none' | 'small' | 'medium' | 'large';  // Default: 'medium'
  className?: string;
  onClick?: () => void;
}
```

**Sub-Components:**

**CardHeader:**
```typescript
{ children: React.ReactNode; className?: string; }
```

**CardBody:**
```typescript
{ children: React.ReactNode; className?: string; }
```

**CardFooter:**
```typescript
{ children: React.ReactNode; className?: string; }
```

---

## Testing Guidelines

### Unit Testing

#### Test Theme Context

```jsx
// __tests__/ThemeContext.test.jsx
import { renderHook, act } from '@testing-library/react-hooks';
import { ThemeProvider, useTheme, THEMES } from '../contexts/ThemeContext';

describe('ThemeContext', () => {
  const wrapper = ({ children }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  test('provides default theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.currentTheme).toBe(THEMES.RETRO);
  });

  test('changes theme successfully', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    await act(async () => {
      await result.current.changeTheme(THEMES.MODERN_MINIMALIST);
    });

    expect(result.current.currentTheme).toBe(THEMES.MODERN_MINIMALIST);
  });

  test('persists theme to localStorage', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    await act(async () => {
      await result.current.changeTheme(THEMES.TECH_SAVVY);
    });

    expect(localStorage.getItem('app_theme')).toBe(THEMES.TECH_SAVVY);
  });

  test('throws error for invalid theme', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    await act(async () => {
      await result.current.changeTheme('invalid-theme');
    });

    // Should not change theme
    expect(result.current.currentTheme).toBe(THEMES.RETRO);
  });
});
```

#### Test Themed Components

```jsx
// __tests__/Button.test.jsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import Button from '../components/themed/Button';

const renderWithTheme = (component, theme = 'retro') => {
  return render(
    <ThemeProvider>
      <div data-theme={theme}>
        {component}
      </div>
    </ThemeProvider>
  );
};

describe('Button Component', () => {
  test('renders with theme styles', () => {
    renderWithTheme(<Button>Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('themed-button');
  });

  test('applies variant class', () => {
    renderWithTheme(<Button variant="secondary">Cancel</Button>);
    const button = screen.getByText('Cancel');
    expect(button).toHaveClass('themed-button--secondary');
  });

  test('renders loading state', () => {
    renderWithTheme(<Button loading>Submit</Button>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
```

### Integration Testing

```jsx
// __tests__/ThemeIntegration.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('Theme Integration', () => {
  test('theme switcher changes application theme', async () => {
    render(<App />);

    // Open theme switcher
    const themeSwitcher = screen.getByLabelText('Select theme');
    fireEvent.click(themeSwitcher);

    // Select Modern Minimalist
    const modernOption = screen.getByText('Modern Minimalist');
    fireEvent.click(modernOption);

    // Check if theme applied to document
    expect(document.documentElement).toHaveAttribute('data-theme', 'modern-minimalist');
  });

  test('theme persists after page reload', () => {
    localStorage.setItem('app_theme', 'friendly-approachable');

    render(<App />);

    expect(document.documentElement).toHaveAttribute('data-theme', 'friendly-approachable');
  });
});
```

### Visual Regression Testing

```javascript
// visual-tests/theme-snapshots.spec.js
const { test, expect } = require('@playwright/test');

const themes = ['retro', 'modern-minimalist', 'friendly-approachable', 'tech-savvy-trustworthy'];

themes.forEach(theme => {
  test(`${theme} theme snapshot`, async ({ page }) => {
    await page.goto('/');

    // Set theme
    await page.evaluate((themeName) => {
      document.documentElement.setAttribute('data-theme', themeName);
    }, theme);

    // Take screenshot
    await expect(page).toHaveScreenshot(`${theme}-home.png`);
  });
});
```

### Accessibility Testing

```javascript
// __tests__/ThemeAccessibility.test.jsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import App from '../App';

expect.extend(toHaveNoViolations);

describe('Theme Accessibility', () => {
  test('retro theme has no accessibility violations', async () => {
    const { container } = render(<App />);
    document.documentElement.setAttribute('data-theme', 'retro');

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('all themes meet WCAG AA contrast', async () => {
    const themes = ['retro', 'modern-minimalist', 'friendly-approachable', 'tech-savvy-trustworthy'];

    for (const theme of themes) {
      const { container } = render(<App />);
      document.documentElement.setAttribute('data-theme', theme);

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });

      expect(results).toHaveNoViolations();
    }
  });
});
```

---

## Performance Considerations

### CSS Optimization

#### Critical CSS

Extract critical theme CSS for above-the-fold content:

```javascript
// Build script
const criticalCSS = extractCritical(`
  [data-theme] { /* base vars */ }
  .header { /* critical styles */ }
  .button { /* critical styles */ }
`);
```

#### CSS Loading Strategy

```html
<!-- Critical inline CSS -->
<style>
  [data-theme="retro"] { /* minimal critical vars */ }
</style>

<!-- Non-critical themes loaded async -->
<link rel="preload" href="/themes/retro.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

### Lazy Loading Themes

```jsx
// Dynamically import theme CSS
const loadTheme = async (themeName) => {
  await import(`./styles/themes/${themeName}.css`);
};

// In changeTheme function
const changeTheme = async (newTheme) => {
  setLoading(true);
  await loadTheme(newTheme);
  setCurrentTheme(newTheme);
  setLoading(false);
};
```

### Memoization

```jsx
// Memoize theme-dependent calculations
const ThemeAwareComponent = React.memo(({ data }) => {
  const { currentTheme } = useTheme();

  const processedData = useMemo(() => {
    return expensiveCalculation(data, currentTheme);
  }, [data, currentTheme]);

  return <div>{processedData}</div>;
});
```

### Reducing Repaints

```css
/* Use transform instead of position changes */
.card:hover {
  transform: translateY(-2px); /* GPU-accelerated */
}

/* Avoid triggering layout */
.card:hover {
  /* ❌ Triggers layout */
  /* margin-top: -2px; */

  /* ✅ GPU-accelerated */
  transform: translateY(-2px);
}
```

### Theme Switching Performance

```jsx
// Debounce rapid theme changes
const debouncedChangeTheme = useMemo(
  () => debounce(changeTheme, 300),
  [changeTheme]
);

// Use CSS containment
<div style={{ contain: 'layout style paint' }}>
  {/* Theme-dependent content */}
</div>
```

### Bundle Size Optimization

```javascript
// webpack.config.js - Extract theme CSS to separate files
optimization: {
  splitChunks: {
    cacheGroups: {
      themes: {
        test: /[\\/]themes[\\/]/,
        name: 'themes',
        chunks: 'all'
      }
    }
  }
}
```

### Measurement

```javascript
// Measure theme switch performance
const measureThemeSwitch = async (newTheme) => {
  const start = performance.now();

  await changeTheme(newTheme);

  const end = performance.now();
  console.log(`Theme switch took ${end - start}ms`);

  // Send to analytics
  analytics.track('theme_switch_duration', { duration: end - start });
};
```

**Performance Targets:**
- Theme switch: < 100ms
- First paint with theme: < 1.5s
- CSS download: < 50KB compressed
- No layout shift during theme switch

---

## Troubleshooting

### Common Issues

#### Issue: Theme not applying

**Symptoms:**
- CSS variables not working
- Components don't reflect theme

**Solutions:**
1. Check `data-theme` attribute on `<html>`:
   ```javascript
   console.log(document.documentElement.getAttribute('data-theme'));
   ```

2. Verify CSS is imported:
   ```jsx
   // Ensure this is in main.jsx or App.jsx
   import './styles/themes/retro.css';
   ```

3. Check CSS specificity:
   ```css
   /* Make sure theme selectors are specific enough */
   [data-theme="retro"] .button { /* ... */ }
   ```

#### Issue: Theme not persisting

**Symptoms:**
- Theme resets on page reload
- Different theme on each page

**Solutions:**
1. Check localStorage:
   ```javascript
   console.log(localStorage.getItem('app_theme'));
   ```

2. Verify ThemeProvider is at root level
3. Check for multiple ThemeProviders (only one should exist)

#### Issue: `useTheme` throws error

**Symptoms:**
- "useTheme must be used within a ThemeProvider"

**Solution:**
```jsx
// ❌ Wrong
function App() {
  const { currentTheme } = useTheme(); // Error!
  return <ThemeProvider>...</ThemeProvider>;
}

// ✅ Correct
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { currentTheme } = useTheme(); // Works!
  return <div>{currentTheme}</div>;
}
```

#### Issue: Styles conflict between themes

**Symptoms:**
- Previous theme styles visible
- Mixed theme appearance

**Solutions:**
1. Use proper CSS cascade:
   ```css
   /* Base styles */
   .button { /* common styles */ }

   /* Theme-specific overrides */
   [data-theme="retro"] .button { /* theme styles */ }
   ```

2. Avoid `!important` in theme CSS
3. Ensure theme CSS loaded in correct order

#### Issue: Poor theme switch performance

**Symptoms:**
- Lag when switching themes
- Visible reflow

**Solutions:**
1. Use CSS containment:
   ```css
   .themed-component {
     contain: layout style paint;
   }
   ```

2. Minimize DOM changes during switch
3. Use `will-change` for animated elements:
   ```css
   .theme-transition {
     will-change: background-color, color;
   }
   ```

#### Issue: Custom properties not working in old browsers

**Solutions:**
1. Add PostCSS plugin:
   ```javascript
   // postcss.config.js
   module.exports = {
     plugins: [
       require('postcss-custom-properties')({
         preserve: false
       })
     ]
   };
   ```

2. Provide fallbacks:
   ```css
   .button {
     background: #3B82F6; /* Fallback */
     background: var(--accent-blue);
   }
   ```

---

## Additional Resources

### Documentation
- [MDN: CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [CSS Custom Properties Browser Support](https://caniuse.com/css-variables)
- [React DevTools](https://react.dev/learn/react-developer-tools)

### Internal Links
- [User Guide](./USER_GUIDE_THEMES.md)
- [API Reference](./API_REFERENCE_THEMES.md)
- [Contributing Guide](./CONTRIBUTING_THEMES.md)

---

**Questions or need help?** Open an issue on GitHub or contact the frontend team.
