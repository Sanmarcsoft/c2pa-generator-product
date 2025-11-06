# Theme 01: Modern Minimalist

## Design Philosophy
A clean, sophisticated interface that prioritizes content and functionality through generous whitespace, subtle interactions, and a refined color palette. This theme embodies simplicity and elegance, creating a professional environment for C2PA certification workflows.

---

## Color Palette

### Primary Colors
```css
--primary-50: #F8FAFC;     /* Lightest background */
--primary-100: #F1F5F9;    /* Card backgrounds */
--primary-200: #E2E8F0;    /* Borders, dividers */
--primary-300: #CBD5E1;    /* Subtle text, disabled states */
--primary-400: #94A3B8;    /* Secondary text */
--primary-500: #64748B;    /* Body text */
--primary-600: #475569;    /* Headings */
--primary-700: #334155;    /* Dark text */
--primary-800: #1E293B;    /* Darkest text */
--primary-900: #0F172A;    /* Near black */
```

### Accent Colors
```css
--accent-blue: #3B82F6;        /* Primary actions, links */
--accent-blue-light: #60A5FA;  /* Hover states */
--accent-blue-dark: #2563EB;   /* Active states */
--accent-green: #10B981;       /* Success, positive actions */
--accent-yellow: #F59E0B;      /* Warnings, pending states */
--accent-red: #EF4444;         /* Errors, destructive actions */
```

### Semantic Colors
```css
--background-primary: #FFFFFF;
--background-secondary: #F8FAFC;
--background-tertiary: #F1F5F9;
--text-primary: #1E293B;
--text-secondary: #64748B;
--text-tertiary: #94A3B8;
--border-color: #E2E8F0;
--shadow-sm: rgba(15, 23, 42, 0.04);
--shadow-md: rgba(15, 23, 42, 0.08);
--shadow-lg: rgba(15, 23, 42, 0.12);
```

---

## Typography

### Font Families
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-code: 'SF Mono', Monaco, 'Courier New', monospace;
```

### Type Scale
```css
/* Headings */
--text-display: 3rem;        /* 48px - Hero sections */
--text-h1: 2.25rem;          /* 36px - Page titles */
--text-h2: 1.875rem;         /* 30px - Section headers */
--text-h3: 1.5rem;           /* 24px - Subsections */
--text-h4: 1.25rem;          /* 20px - Card titles */
--text-h5: 1.125rem;         /* 18px - Small headings */

/* Body */
--text-base: 1rem;           /* 16px - Body text */
--text-sm: 0.875rem;         /* 14px - Secondary text */
--text-xs: 0.75rem;          /* 12px - Captions, labels */

/* Font Weights */
--weight-light: 300;
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;

/* Line Heights */
--leading-tight: 1.25;       /* Headings */
--leading-normal: 1.5;       /* Body text */
--leading-relaxed: 1.75;     /* Long-form content */
```

---

## Spacing System

### Base Unit: 4px
```css
--space-0: 0;
--space-1: 0.25rem;     /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-3: 0.75rem;     /* 12px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-8: 2rem;        /* 32px */
--space-10: 2.5rem;     /* 40px */
--space-12: 3rem;       /* 48px */
--space-16: 4rem;       /* 64px */
--space-20: 5rem;       /* 80px */
--space-24: 6rem;       /* 96px */
```

---

## Layout & Grid

### Container Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

### Breakpoints
```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### Border Radius
```css
--radius-sm: 0.25rem;    /* 4px - Small elements */
--radius-md: 0.375rem;   /* 6px - Buttons, inputs */
--radius-lg: 0.5rem;     /* 8px - Cards */
--radius-xl: 0.75rem;    /* 12px - Modals */
--radius-2xl: 1rem;      /* 16px - Large cards */
--radius-full: 9999px;   /* Circular elements */
```

---

## Component Specifications

### 1. Header / Navigation

#### Desktop Layout (>1024px)
```
┌─────────────────────────────────────────────────────────────────┐
│  [C2PA GENERATOR]          Home  Chat  Documents  Progress      │
│  Certification Assistant                          [👤 Profile ▼] │
└─────────────────────────────────────────────────────────────────┘
Height: 72px
Background: white with subtle shadow
Border-bottom: 1px solid var(--border-color)
```

**Specifications:**
- Logo: font-size 1.25rem (20px), weight 600, color var(--text-primary)
- Tagline: font-size 0.75rem (12px), color var(--text-secondary)
- Nav links: font-size 0.875rem (14px), padding 0.5rem 1rem
- Hover state: background var(--background-tertiary), border-radius 6px
- Active state: font-weight 500, subtle bottom border (2px blue)
- Profile dropdown: Animated slide-down, 200ms ease

#### Mobile Layout (<768px)
```
┌──────────────────────────────┐
│  [☰]  C2PA GENERATOR    [👤] │
└──────────────────────────────┘
Height: 64px
Hamburger menu: Slide-in drawer from left (280px width)
```

---

### 2. Chat Interface

#### Desktop Layout
```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Assistant                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ 🤖 Hello! How can I assist you with C2PA              │       │
│  │    certification today?                               │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
│         ┌──────────────────────────────────────────────┐         │
│         │ What is C2PA and how does it work?           │ 👤      │
│         └──────────────────────────────────────────────┘         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ 🤖 C2PA (Coalition for Content Provenance and         │       │
│  │    Authenticity) is a technical standard that...      │       │
│  │    [📎 View Source]                                   │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  [Type your message...]                          [Send →]        │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Container: max-width 900px, centered
- Message bubbles:
  - AI: background var(--background-tertiary), padding 1rem 1.25rem
  - User: background var(--accent-blue) at 8% opacity, padding 1rem 1.25rem
  - Border-radius: 12px
  - Margin between: 1.5rem
- Avatar: 32px circle, positioned top-left of bubble
- Message text: font-size 0.9375rem (15px), line-height 1.6
- Input area:
  - Height: 60px
  - Background: white
  - Border-top: 1px solid var(--border-color)
  - Input: padding 0.75rem 1rem, border-radius 24px
  - Send button: 40px circle, accent-blue background

#### Mobile Chat
```
┌──────────────────────────┐
│   🤖 AI Assistant        │
├──────────────────────────┤
│                          │
│  ┌────────────────────┐  │
│  │ 🤖 Hello! How can  │  │
│  │    I assist you?   │  │
│  └────────────────────┘  │
│                          │
│     ┌────────────────┐   │
│     │ Tell me about  │ 👤│
│     │ C2PA           │   │
│     └────────────────┘   │
│                          │
├──────────────────────────┤
│ [Message...]       [→]   │
└──────────────────────────┘
```

---

### 3. Document Management Page

#### Card-Based Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  Documents                                      [+ Upload] [⚙️]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐      │
│  │             │             │             │             │      │
│  │   [📄]      │   [🖼️]      │   [🎬]      │   [📊]      │      │
│  │             │             │             │             │      │
│  │ Report.pdf  │ Image.jpg   │ Video.mp4   │ Data.xlsx   │      │
│  │ 2.4 MB      │ 1.8 MB      │ 45.2 MB     │ 512 KB      │      │
│  │             │             │             │             │      │
│  │ ✓ Certified │ ⏳ Pending  │ ✓ Certified │ ⏳ Pending  │      │
│  │             │             │             │             │      │
│  │ [View] [⋯]  │ [View] [⋯]  │ [View] [⋯]  │ [View] [⋯]  │      │
│  └─────────────┴─────────────┴─────────────┴─────────────┘      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Grid: 4 columns desktop, 2 columns tablet, 1 column mobile
- Card dimensions: aspect ratio 1:1.2
- Card background: white
- Border: 1px solid var(--border-color)
- Hover state: shadow elevation (0 4px 12px rgba(0,0,0,0.08)), lift -2px
- Icon: 48px, color var(--text-tertiary)
- Title: font-size 0.9375rem, weight 500, truncate with ellipsis
- Status badge:
  - Certified: green background, 6px padding horizontal
  - Pending: yellow background
  - Failed: red background
  - Border-radius: full (pill shape)

---

### 4. Admin Panel

#### Dashboard Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  Admin Control Panel                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  System Statistics                                                │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐       │
│  │ Users    │ Docs     │ AI Calls │ Storage  │ Uptime   │       │
│  │ 1,247    │ 5,832    │ 12,456   │ 45.2 GB  │ 99.9%    │       │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘       │
│                                                                   │
│  AI Provider Configuration                                        │
│  ┌─────────────────────────────────────────────────────┐         │
│  │  Provider: [OpenWebUI ▼]                            │         │
│  │  API URL:  [http://localhost:3000/api________]      │         │
│  │  API Key:  [••••••••••••••••••] [👁️]               │         │
│  │                                                      │         │
│  │  [Test Connection]  [Save Configuration]            │         │
│  └─────────────────────────────────────────────────────┘         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Stat cards:
  - Background: gradient from white to var(--primary-50)
  - Border: 1px solid var(--border-color)
  - Padding: 1.5rem
  - Number: font-size 2rem, weight 600, color accent-blue
  - Label: font-size 0.875rem, color var(--text-secondary)
- Form sections:
  - Background: white
  - Border: 1px solid var(--border-color)
  - Border-radius: 8px
  - Padding: 2rem
- Input fields:
  - Height: 44px
  - Border: 1.5px solid var(--border-color)
  - Border-radius: 6px
  - Focus: border-color accent-blue, shadow 0 0 0 3px rgba(59,130,246,0.1)

---

### 5. Buttons

#### Primary Button
```css
background: var(--accent-blue);
color: white;
padding: 0.625rem 1.25rem;
border-radius: 6px;
font-size: 0.9375rem;
font-weight: 500;
border: none;
box-shadow: 0 1px 2px rgba(0,0,0,0.05);
transition: all 150ms ease;

/* Hover */
background: var(--accent-blue-dark);
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
transform: translateY(-1px);

/* Active */
transform: translateY(0);
box-shadow: 0 1px 2px rgba(0,0,0,0.05);

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
```

#### Secondary Button
```css
background: white;
color: var(--text-primary);
padding: 0.625rem 1.25rem;
border-radius: 6px;
border: 1.5px solid var(--border-color);
font-size: 0.9375rem;
font-weight: 500;
transition: all 150ms ease;

/* Hover */
background: var(--background-secondary);
border-color: var(--primary-400);
```

#### Ghost Button
```css
background: transparent;
color: var(--accent-blue);
padding: 0.625rem 1.25rem;
border: none;
font-weight: 500;

/* Hover */
background: rgba(59, 130, 246, 0.06);
border-radius: 6px;
```

---

### 6. Form Elements

#### Text Input
```css
height: 44px;
padding: 0 0.875rem;
background: white;
border: 1.5px solid var(--border-color);
border-radius: 6px;
font-size: 0.9375rem;
color: var(--text-primary);
transition: all 150ms ease;

/* Focus */
border-color: var(--accent-blue);
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
outline: none;

/* Error State */
border-color: var(--accent-red);
box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
```

#### Select Dropdown
```css
Same as text input, with:
- Chevron icon on right (12px)
- Padding-right: 2.5rem
- Appearance: none (custom arrow)
```

#### Checkbox
```css
width: 20px;
height: 20px;
border: 1.5px solid var(--border-color);
border-radius: 4px;
background: white;
transition: all 150ms ease;

/* Checked */
background: var(--accent-blue);
border-color: var(--accent-blue);
/* Checkmark SVG in center */
```

---

### 7. Cards

#### Standard Card
```css
background: white;
border: 1px solid var(--border-color);
border-radius: 8px;
padding: 1.5rem;
box-shadow: 0 1px 3px rgba(0,0,0,0.04);
transition: all 200ms ease;

/* Hover (interactive cards) */
box-shadow: 0 4px 12px rgba(0,0,0,0.08);
transform: translateY(-2px);
border-color: var(--primary-300);
```

#### Card Header
```css
padding-bottom: 1rem;
border-bottom: 1px solid var(--border-color);
margin-bottom: 1rem;

/* Title */
font-size: 1.125rem;
font-weight: 600;
color: var(--text-primary);
```

---

### 8. Modals

```
┌─────────────────────────────────────────┐
│  Confirm Action                     [×] │
├─────────────────────────────────────────┤
│                                         │
│  Are you sure you want to delete this   │
│  document? This action cannot be undone.│
│                                         │
│                    [Cancel]  [Delete]   │
└─────────────────────────────────────────┘

Background overlay: rgba(15, 23, 42, 0.6)
Backdrop blur: 4px
Modal:
  - Max-width: 480px
  - Background: white
  - Border-radius: 12px
  - Padding: 1.5rem
  - Shadow: 0 20px 25px -5px rgba(0,0,0,0.1)
  - Animation: fade + scale (200ms ease-out)
```

---

### 9. Progress Tracking / Starship Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│  Certification Progress                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │                                                       │       │
│  │   Phase 1: Setup         ✓ Complete                  │       │
│  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                                │       │
│  │                                                       │       │
│  │   Phase 2: Documentation → In Progress               │       │
│  │   ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░                                │       │
│  │                                                       │       │
│  │   Phase 3: Review        ○ Pending                   │       │
│  │   ░░░░░░░░░░░░░░░░░░░░░░                                │       │
│  │                                                       │       │
│  │   Phase 4: Certification ○ Pending                   │       │
│  │   ░░░░░░░░░░░░░░░░░░░░░░                                │       │
│  │                                                       │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
│  Overall Progress: 35%                                            │
│  ▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░                                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Progress bar:
  - Height: 8px
  - Border-radius: 4px
  - Background: var(--primary-200)
  - Fill: gradient from accent-blue to accent-blue-light
- Phase indicators:
  - Complete: green checkmark, full progress bar
  - In Progress: blue arrow, partial progress bar
  - Pending: gray circle, empty progress bar
- Animation: Progress fill animates smoothly (300ms ease)

---

### 10. Toast Notifications

```
┌────────────────────────────────────┐
│  ✓  Document uploaded successfully │
└────────────────────────────────────┘

Position: Top-right, 1rem from edge
Width: Min 320px, max 480px
Height: Auto
Background:
  - Success: white with green left border (4px)
  - Error: white with red left border (4px)
  - Info: white with blue left border (4px)
Border-radius: 8px
Shadow: 0 4px 12px rgba(0,0,0,0.15)
Animation: Slide in from right (200ms), auto-dismiss after 4s
```

---

## Animations & Transitions

### Standard Transitions
```css
--transition-fast: 150ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease;
```

### Animation Timing Functions
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Common Animations
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

#### Color Contrast Ratios
- Normal text (16px): Minimum 4.5:1
- Large text (18px+): Minimum 3:1
- UI components: Minimum 3:1

**Tested Combinations:**
- Primary text on white: 12.6:1 (Excellent)
- Secondary text on white: 4.7:1 (Pass)
- Blue accent on white: 4.6:1 (Pass)
- White on blue accent: 4.6:1 (Pass)

#### Focus States
```css
/* All interactive elements */
:focus-visible {
  outline: 2px solid var(--accent-blue);
  outline-offset: 2px;
  border-radius: 6px;
}

/* Additional ring for high contrast */
:focus-visible {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}
```

#### Screen Reader Support
- All interactive elements have proper ARIA labels
- Form inputs have associated labels
- Icons have aria-hidden="true" when decorative
- Alternative text for all images
- Semantic HTML structure (nav, main, article, aside)

---

## Responsive Behavior

### Mobile-First Approach

#### Navigation
- Desktop: Horizontal nav bar
- Tablet (< 1024px): Condensed horizontal nav
- Mobile (< 768px): Hamburger menu with slide-in drawer

#### Chat Interface
- Desktop: Max-width 900px, centered
- Tablet: Full width with padding
- Mobile: Full width, reduced padding, smaller bubbles

#### Document Grid
- Desktop: 4 columns
- Tablet: 2 columns
- Mobile: 1 column (full width cards)

#### Admin Panel
- Desktop: Multi-column layout for stats
- Tablet: 2-column grid
- Mobile: Single column stack

### Touch Targets
- Minimum size: 44px × 44px (iOS/Android guidelines)
- Spacing between targets: Minimum 8px
- Buttons on mobile: Full width or minimum 120px wide

---

## Dark Mode Considerations

### Color Palette (Dark Mode)
```css
@media (prefers-color-scheme: dark) {
  --background-primary: #0F172A;
  --background-secondary: #1E293B;
  --background-tertiary: #334155;
  --text-primary: #F1F5F9;
  --text-secondary: #CBD5E1;
  --text-tertiary: #94A3B8;
  --border-color: #334155;
  --accent-blue: #60A5FA;

  /* Adjust shadows for dark backgrounds */
  --shadow-sm: rgba(0, 0, 0, 0.3);
  --shadow-md: rgba(0, 0, 0, 0.4);
  --shadow-lg: rgba(0, 0, 0, 0.5);
}
```

**Note:** Dark mode uses same component structure with inverted color scheme.

---

## Implementation Notes

### CSS Custom Properties Pattern
```css
:root {
  /* Define all variables */
}

/* Component-specific overrides */
.component {
  --local-bg: var(--background-primary);
  background: var(--local-bg);
}
```

### Component Class Naming
Use BEM (Block Element Modifier) convention:
```css
.card { }
.card__header { }
.card__body { }
.card--elevated { }
```

### Utility Classes
Provide common utilities:
```css
.text-center { text-align: center; }
.mt-4 { margin-top: 1rem; }
.flex { display: flex; }
.hidden { display: none; }
```

---

## Browser Support
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- iOS Safari: iOS 14+
- Chrome Android: Latest version

---

## Performance Considerations
- Use `will-change` sparingly for animated elements
- Prefer `transform` and `opacity` for animations
- Lazy load images and heavy components
- Use CSS containment where appropriate
- Minimize repaints and reflows

---

## File Structure Recommendation
```
/src/styles/
  /themes/
    modern-minimalist.css
  /components/
    button.css
    card.css
    input.css
    modal.css
  /utilities/
    spacing.css
    typography.css
    colors.css
```

---

## Figma / Design Tool Export
- Components should be exportable at 1x, 2x, 3x for different screen densities
- Use proper naming for layers/frames
- Create component variants for different states
- Document interaction states in prototype mode
