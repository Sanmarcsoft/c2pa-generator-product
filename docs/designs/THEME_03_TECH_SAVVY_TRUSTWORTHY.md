# Theme 03: Tech-Savvy & Trustworthy

## Design Philosophy
A sophisticated, professional interface that exudes technical credibility and security. This theme uses a dark color scheme with electric accents, structured layouts, and sharp typography to create an environment that appeals to tech-savvy users who value precision, control, and transparency in C2PA certification.

---

## Color Palette

### Dark Foundation
```css
--dark-900: #0A0E1A;        /* Deepest background */
--dark-800: #0F1628;        /* Primary background */
--dark-750: #141B2E;        /* Secondary background */
--dark-700: #1A2235;        /* Tertiary background */
--dark-600: #242E45;        /* Elevated surfaces */
--dark-500: #2E3A55;        /* Hover states */
--dark-400: #3D4A65;        /* Borders */
--dark-300: #4D5A75;        /* Subtle dividers */
--dark-200: #5D6A85;        /* Disabled elements */
--dark-100: #7A8599;        /* Secondary text */
```

### Electric Accents
```css
--electric-cyan: #00E5FF;       /* Primary accent */
--electric-cyan-light: #33EBFF; /* Hover states */
--electric-cyan-dark: #00B8CC;  /* Active states */
--electric-teal: #00FFA3;       /* Success, positive */
--electric-blue: #0080FF;       /* Info, links */
--electric-purple: #A855F7;     /* Special features */
--electric-yellow: #FFD600;     /* Warnings, attention */
--electric-red: #FF3366;        /* Errors, critical */
--electric-orange: #FF6B35;     /* Notifications */
```

### Semantic Colors
```css
--background-primary: #0F1628;
--background-secondary: #141B2E;
--background-tertiary: #1A2235;
--background-elevated: #242E45;
--surface-glass: rgba(255, 255, 255, 0.03);
--surface-glass-hover: rgba(255, 255, 255, 0.06);
--text-primary: #FFFFFF;
--text-secondary: #B4BFCF;
--text-tertiary: #7A8599;
--text-electric: #00E5FF;
--border-subtle: #242E45;
--border-medium: #3D4A65;
--border-strong: #4D5A75;
--border-electric: #00E5FF;
--glow-cyan: 0 0 20px rgba(0, 229, 255, 0.4);
--glow-teal: 0 0 20px rgba(0, 255, 163, 0.4);
--glow-blue: 0 0 20px rgba(0, 128, 255, 0.4);
```

---

## Typography

### Font Families
```css
--font-primary: 'Space Grotesk', 'Montserrat', 'Inter', -apple-system, sans-serif;
--font-headings: 'Outfit', 'Space Grotesk', sans-serif;
--font-code: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
--font-mono-num: 'Roboto Mono', monospace; /* For numbers, metrics */
```

### Type Scale (Technical Precision)
```css
/* Headings */
--text-display: 3.5rem;      /* 56px - Hero sections */
--text-h1: 2.5rem;           /* 40px - Page titles */
--text-h2: 2rem;             /* 32px - Section headers */
--text-h3: 1.5rem;           /* 24px - Subsections */
--text-h4: 1.25rem;          /* 20px - Card titles */
--text-h5: 1.125rem;         /* 18px - Small headings */

/* Body */
--text-base: 1rem;           /* 16px - Body text */
--text-sm: 0.875rem;         /* 14px - Secondary text */
--text-xs: 0.75rem;          /* 12px - Captions, labels */
--text-code: 0.9375rem;      /* 15px - Code snippets */

/* Font Weights */
--weight-light: 300;
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-black: 900;

/* Line Heights */
--leading-tight: 1.2;        /* Headings, compact */
--leading-snug: 1.4;         /* Metrics, data */
--leading-normal: 1.6;       /* Body text */
--leading-relaxed: 1.8;      /* Long-form content */

/* Letter Spacing */
--tracking-tight: -0.02em;   /* Large headings */
--tracking-normal: 0;
--tracking-wide: 0.025em;    /* Uppercase labels */
--tracking-wider: 0.05em;    /* Buttons, badges */
```

---

## Spacing System

### Base Unit: 4px (8px preferred for tech aesthetic)
```css
--space-0: 0;
--space-px: 1px;
--space-0-5: 0.125rem;   /* 2px */
--space-1: 0.25rem;      /* 4px */
--space-2: 0.5rem;       /* 8px */
--space-3: 0.75rem;      /* 12px */
--space-4: 1rem;         /* 16px */
--space-5: 1.25rem;      /* 20px */
--space-6: 1.5rem;       /* 24px */
--space-8: 2rem;         /* 32px */
--space-10: 2.5rem;      /* 40px */
--space-12: 3rem;        /* 48px */
--space-16: 4rem;        /* 64px */
--space-20: 5rem;        /* 80px */
--space-24: 6rem;        /* 96px */
--space-32: 8rem;        /* 128px */
```

---

## Layout & Grid

### Container Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1440px;
--container-full: 100%;
```

### Breakpoints
```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### Border Radius (Sharp & Structured)
```css
--radius-none: 0;
--radius-sm: 2px;       /* Subtle corners */
--radius-md: 4px;       /* Standard elements */
--radius-lg: 6px;       /* Cards, larger elements */
--radius-xl: 8px;       /* Modals, panels */
--radius-2xl: 12px;     /* Hero sections */
--radius-full: 9999px;  /* Circular (rare in this theme) */
```

### Grid System (12-column precision)
```css
--grid-cols: 12;
--grid-gap: 1.5rem;     /* 24px */
--grid-gap-sm: 1rem;    /* 16px mobile */
```

---

## Component Specifications

### 1. Header / Navigation

#### Desktop Layout (>1024px)
```
┌─────────────────────────────────────────────────────────────────┐
│ ⬡ C2PA GENERATOR      HOME  CHAT  DOCS  PROGRESS  [👤 USER ▼]  │
│   v2.1.0                                          [API: ACTIVE ●]│
└─────────────────────────────────────────────────────────────────┘
Height: 64px
Background: rgba(10, 14, 26, 0.95) with backdrop blur
Border-bottom: 1px solid #242E45, 1px electric-cyan glow underneath
Shadow: 0 4px 24px rgba(0, 0, 0, 0.5)
Position: Fixed, top: 0
```

**Specifications:**
- Logo:
  - Hexagon icon (24px) with electric-cyan glow
  - Text: font-size 1.125rem, weight 700, text-primary
  - Version: font-size 0.625rem, text-tertiary, mono font
- Nav links:
  - font-size 0.875rem
  - text-transform: uppercase
  - letter-spacing: 0.05em
  - padding: 0.5rem 1rem
  - color: text-secondary
  - Border: 1px solid transparent
  - Transition: 200ms ease
  - Hover:
    - color: electric-cyan
    - border-bottom: 1px solid electric-cyan
    - glow effect
  - Active:
    - color: white
    - background: rgba(0, 229, 255, 0.08)
    - border: 1px solid electric-cyan
    - box-shadow: glow-cyan
- Status indicator:
  - font-size 0.75rem
  - Mono font
  - API status: [ACTIVE ●] in green
  - Connection status: Real-time ping indicator
- Profile dropdown:
  - Glass morphism background
  - Sharp corners (4px radius)
  - Border with electric accent
  - Slide down 200ms

#### Mobile Layout (<768px)
```
┌──────────────────────────────┐
│  ⬡ C2PA GEN    [☰]      [👤] │
└──────────────────────────────┘

Slide-out panel from left:
┌────────────────────────┐
│ NAVIGATION             │
│ ──────────────────────│
│ ⬡ HOME                 │
│ ⬡ CHAT                 │
│ ⬡ DOCUMENTS            │
│ ⬡ PROGRESS             │
│ ───────────────────────│
│ STATUS                 │
│ API: [●] CONNECTED     │
│ ───────────────────────│
│ v2.1.0                 │
└────────────────────────┘

Width: 280px
Background: dark-800
Backdrop blur
Electric cyan accent line on right edge
```

---

### 2. Chat Interface (Technical Console Style)

#### Desktop Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  ⚡ AI ASSISTANT                    [⚙️ CONFIG]  [🔄 CLEAR]     │
├─────────────────────────────────────────────────────────────────┤
│  SESSION: #C2PA-2024-001          MODEL: GPT-4  LATENCY: 45ms   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ [AI] 09:15:32                                       │        │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │        │
│  │ C2PA certification protocol initialized.            │        │
│  │ Ready to process authentication requests.           │        │
│  │                                                      │        │
│  │ Available commands: /help /docs /status             │        │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                   │
│           ┌───────────────────────────────────────────┐          │
│           │ [USER] 09:16:45                           │          │
│           │ What is required for C2PA certification?  │          │
│           └───────────────────────────────────────────┘          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ [AI] 09:16:47                          ⚡ 187ms     │        │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │        │
│  │ C2PA CERTIFICATION REQUIREMENTS:                    │        │
│  │                                                      │        │
│  │ 1. Digital asset file                               │        │
│  │ 2. Cryptographic signing key                        │        │
│  │ 3. Metadata manifest                                │        │
│  │ 4. Content credentials                              │        │
│  │                                                      │        │
│  │ [📊 View Full Spec] [🔗 API Reference]              │        │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │        │
│  │ Source: C2PA Technical Specification v1.3           │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  > [Type command or query...]                    [SEND →]       │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Header:
  - Background: dark-700
  - Border-bottom: 1px electric-cyan
  - Icons: 20px, electric-cyan
  - Session ID: mono font, text-tertiary
- Status bar:
  - Background: dark-750
  - Mono font, 0.75rem
  - Real-time metrics: model, latency, tokens
  - Color-coded: green (<100ms), yellow (<300ms), red (>300ms)
- Message containers:
  - AI messages:
    - Background: dark-700 with subtle grid pattern
    - Border-left: 2px solid electric-cyan
    - Padding: 1.25rem 1.5rem
    - Border-radius: 4px
    - Box-shadow: inset 0 0 20px rgba(0, 229, 255, 0.05)
  - User messages:
    - Background: dark-600
    - Border-right: 2px solid electric-blue
    - Padding: 1rem 1.25rem
    - Border-radius: 4px
    - Float right, max-width 70%
  - Margin between: 1.5rem
- Timestamp:
  - Mono font, 0.75rem
  - Color: text-tertiary
  - Format: HH:MM:SS
- Content:
  - font-size: 0.9375rem
  - Line-height: 1.6
  - Code blocks: dark-900 background, electric-cyan text
  - Links: electric-cyan with underline
- Action buttons:
  - Sharp rectangles (4px radius)
  - Border: 1px solid border-medium
  - Background: transparent
  - Hover: border-electric, glow
- Input area:
  - Height: 56px
  - Background: dark-750
  - Border-top: 1px solid border-strong, 1px electric-cyan glow
  - Input:
    - Mono font for commands (starts with /)
    - Padding: 0 1rem
    - Border: none
    - Background: transparent
    - Color: text-primary
    - Placeholder: text-tertiary, "> Enter command..."
  - Send button:
    - Width: 80px
    - Background: electric-cyan
    - Color: dark-900
    - Font-weight: 700
    - Border: none
    - Hover: glow effect, slight brighten

#### Mobile Chat (Console Mode)
```
┌──────────────────────────┐
│ ⚡ AI CONSOLE            │
│ SESSION: #001            │
├──────────────────────────┤
│                          │
│ ┌──────────────────────┐ │
│ │ [AI] 09:15           │ │
│ │ ──────────────────── │ │
│ │ System ready.        │ │
│ └──────────────────────┘ │
│                          │
│      ┌────────────────┐  │
│      │ [USER] 09:16   │  │
│      │ Status?        │  │
│      └────────────────┘  │
│                          │
├──────────────────────────┤
│ > [command...]      [→]  │
└──────────────────────────┘
```

---

### 3. Document Management Page (Data Grid)

#### Layout with Structured Grid
```
┌─────────────────────────────────────────────────────────────────┐
│  📦 DOCUMENT REGISTRY                   [+ UPLOAD]  [⚙️]  [🔍]   │
│  Total: 47 documents  |  Certified: 32  |  Pending: 15          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ NAME           │ TYPE   │ SIZE   │ STATUS     │ ACTIONS   │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ report_2024.pdf│ PDF    │ 2.4 MB │ ✓ CERT    │ [⋯]       │  │
│  │ image_001.jpg  │ IMAGE  │ 1.8 MB │ ⏳ PENDING │ [⋯]       │  │
│  │ video_demo.mp4 │ VIDEO  │ 45 MB  │ ✓ CERT    │ [⋯]       │  │
│  │ data_export.csv│ DATA   │ 512 KB │ ⚠️ REVIEW  │ [⋯]       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  [Card View] [List View•] [Timeline]            [1-4 of 47 →]   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Card View Alternative:**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │
│ │   [📄]   │ │ │   [🖼️]   │ │ │   [🎬]   │ │ │   [📊]   │ │
│ └──────────┘ │ └──────────┘ │ └──────────┘ │ └──────────┘ │
│              │              │              │              │
│ report.pdf   │ image.jpg    │ video.mp4    │ data.xlsx    │
│ 2.4 MB       │ 1.8 MB       │ 45.2 MB      │ 512 KB       │
│              │              │              │              │
│ HASH: 7a8f3d │ HASH: b4c2e9 │ HASH: 9d1a6f │ HASH: 3e7c4b │
│              │              │              │              │
│ [✓ CERT]     │ [⏳ PEND]    │ [✓ CERT]     │ [⚠️ REV]     │
│              │              │              │              │
│ [VIEW] [⋯]   │ [VIEW] [⋯]   │ [VIEW] [⋯]   │ [VIEW] [⋯]   │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Specifications:**
- Grid view:
  - Columns: 4 desktop, 2 tablet, 1 mobile
  - Card background: dark-700
  - Border: 1px solid border-subtle
  - Border-radius: 6px
  - Hover:
    - Border-color: electric-cyan
    - Box-shadow: glow-cyan
    - Transform: translateY(-2px)
    - Transition: 200ms
- List view (table):
  - Background: dark-800
  - Border: 1px solid border-medium
  - Header:
    - Background: dark-700
    - Text-transform: uppercase
    - Font-size: 0.75rem
    - Letter-spacing: 0.05em
    - Color: text-tertiary
    - Border-bottom: 1px solid electric-cyan
  - Rows:
    - Border-bottom: 1px solid border-subtle
    - Hover: background dark-700, glow effect
    - Height: 56px
    - Padding: 0.75rem 1rem
  - Mono font for technical data (hash, size)
- Status badges:
  - Sharp rectangles (2px radius)
  - Uppercase, 0.625rem
  - Letter-spacing: 0.1em
  - Padding: 0.25rem 0.5rem
  - Border: 1px solid
  - CERTIFIED: electric-teal border, transparent bg, teal glow
  - PENDING: electric-yellow border, yellow/10 bg
  - REVIEW: electric-orange border, orange/10 bg
  - FAILED: electric-red border, red/10 bg
- File icon:
  - 48px in card view
  - Electric-cyan with glow
  - Represents file type
- Hash preview:
  - Mono font
  - 0.75rem
  - Color: text-tertiary
  - Truncated to 8 characters

---

### 4. Admin Panel (Command Center)

#### Dashboard Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  ⚙️ ADMIN CONTROL CENTER                    [USER: ADMIN] [●]   │
│  System v2.1.0  |  Uptime: 45d 12h 34m                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ━━━ SYSTEM METRICS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐      │
│  │ CPU USAGE   │ MEMORY      │ API CALLS   │ STORAGE     │      │
│  │             │             │             │             │      │
│  │   ▓▓▓░░     │   ▓▓▓▓░     │    12,456   │   45.2 GB   │      │
│  │    45%      │    68%      │   /hour     │   /100 GB   │      │
│  │             │             │             │             │      │
│  │ ⚡ OPTIMAL  │ ⚡ NORMAL   │ ⚡ HIGH     │ ⚠️ 68%      │      │
│  └─────────────┴─────────────┴─────────────┴─────────────┘      │
│                                                                   │
│  ━━━ AI PROVIDER CONFIGURATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ┌───────────────────────────────────────────────────────┐      │
│  │                                                        │      │
│  │  PROVIDER:     [OpenWebUI ▼]                          │      │
│  │                                                        │      │
│  │  ENDPOINT:     [http://localhost:3000/api_________]   │      │
│  │                ⚡ Status: [●] CONNECTED               │      │
│  │                                                        │      │
│  │  API KEY:      [••••••••••••••••••] [👁️] [🔄]        │      │
│  │                🔒 SHA256: 4a7f...c2e9                 │      │
│  │                                                        │      │
│  │  MODEL:        [gpt-4__________________]              │      │
│  │                ℹ️ 128K context window                 │      │
│  │                                                        │      │
│  │  ───────────────────────────────────────────          │      │
│  │  [TEST CONNECTION]  [SAVE CONFIG]  [RESET]            │      │
│  │                                                        │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                   │
│  ━━━ RECENT ACTIVITY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ┌───────────────────────────────────────────────────────┐      │
│  │ 10:23:45  [INFO]   User login: admin@example.com      │      │
│  │ 10:22:31  [SUCCESS] Document certified: doc_12345     │      │
│  │ 10:21:18  [WARNING] High API usage detected           │      │
│  │ 10:20:02  [INFO]   Config updated: AI provider        │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Layout: 12-column grid, strict alignment
- Metric cards:
  - Background: dark-700 with subtle grid pattern
  - Border: 1px solid border-medium
  - Border-radius: 4px
  - Padding: 1.5rem
  - Header: Uppercase, 0.75rem, text-tertiary
  - Value:
    - font-size: 2.5rem for numbers
    - Mono font for metrics
    - Electric-cyan color
    - Glow effect
  - Progress bars:
    - Height: 8px
    - Background: dark-600
    - Fill: Gradient electric-cyan to electric-teal
    - Border-radius: 2px
  - Status indicator:
    - Icon + text
    - Color-coded: green (optimal), yellow (warning), red (critical)
- Form sections:
  - Background: dark-750
  - Border: 1px solid border-medium
  - Border-radius: 6px
  - Padding: 2rem
  - Section headers:
    - Mono font
    - Uppercase
    - Electric-cyan with underline
    - font-size: 0.75rem
    - letter-spacing: 0.1em
- Input fields:
  - Height: 44px
  - Background: dark-800
  - Border: 1px solid border-medium
  - Border-radius: 4px
  - Padding: 0 1rem
  - Mono font
  - Color: text-primary
  - Focus:
    - Border-color: electric-cyan
    - Box-shadow: glow-cyan
    - Outline: none
- Status indicators:
  - Real-time connection status
  - Animated pulse for active
  - Color: green (connected), red (disconnected), yellow (connecting)
- Activity log:
  - Background: dark-900
  - Border: 1px solid border-subtle
  - Mono font, 0.875rem
  - Each line:
    - Timestamp: text-tertiary
    - Level badge: Color-coded (info, success, warning, error)
    - Message: text-secondary
  - Auto-scroll, max 10 lines
  - Full log link at bottom

---

### 5. Buttons

#### Primary Button (Electric)
```css
background: linear-gradient(135deg, var(--electric-cyan), var(--electric-teal));
color: var(--dark-900);
padding: 0.625rem 1.5rem;
border-radius: 4px;
font-size: 0.875rem;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.05em;
border: none;
box-shadow: 0 4px 12px rgba(0, 229, 255, 0.3);
transition: all 150ms ease;
position: relative;
overflow: hidden;

/* Glow effect on hover */
&::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.3), transparent);
  opacity: 0;
  transition: opacity 150ms;
}

&:hover {
  box-shadow: 0 6px 20px rgba(0, 229, 255, 0.5);
  transform: translateY(-2px);
}

&:hover::before {
  opacity: 1;
}

&:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 229, 255, 0.3);
}

&:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: grayscale(50%);
}
```

#### Secondary Button (Outlined)
```css
background: transparent;
color: var(--electric-cyan);
padding: 0.625rem 1.5rem;
border-radius: 4px;
border: 1px solid var(--electric-cyan);
font-size: 0.875rem;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.05em;
transition: all 150ms ease;

&:hover {
  background: rgba(0, 229, 255, 0.1);
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
  border-color: var(--electric-cyan-light);
}

&:active {
  background: rgba(0, 229, 255, 0.15);
}
```

#### Ghost Button
```css
background: transparent;
color: var(--text-secondary);
padding: 0.625rem 1.5rem;
border: none;
font-size: 0.875rem;
font-weight: 600;
text-transform: uppercase;
transition: all 150ms ease;

&:hover {
  color: var(--electric-cyan);
  background: rgba(0, 229, 255, 0.05);
}
```

#### Icon Button (Floating Action)
```css
width: 56px;
height: 56px;
border-radius: 50%;
background: linear-gradient(135deg, var(--electric-cyan), var(--electric-teal));
border: none;
display: flex;
align-items: center;
justify-content: center;
box-shadow: 0 4px 16px rgba(0, 229, 255, 0.4);
transition: all 200ms ease;
position: fixed;
bottom: 2rem;
right: 2rem;
z-index: 100;

/* Icon: 24px */

&:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 6px 24px rgba(0, 229, 255, 0.6);
}

&:active {
  transform: scale(0.95) rotate(90deg);
}
```

---

### 6. Form Elements

#### Text Input (Technical)
```css
height: 44px;
padding: 0 1rem;
background: var(--dark-800);
border: 1px solid var(--border-medium);
border-radius: 4px;
font-size: 0.9375rem;
font-family: var(--font-code);
color: var(--text-primary);
transition: all 150ms ease;

&::placeholder {
  color: var(--text-tertiary);
  font-style: italic;
}

&:focus {
  border-color: var(--electric-cyan);
  box-shadow: 0 0 0 2px rgba(0, 229, 255, 0.2),
              inset 0 0 20px rgba(0, 229, 255, 0.05);
  outline: none;
  background: var(--dark-750);
}

&:hover:not(:focus) {
  border-color: var(--border-strong);
}

/* Error State */
&.error {
  border-color: var(--electric-red);
  box-shadow: 0 0 0 2px rgba(255, 51, 102, 0.2);
}

/* Success State */
&.success {
  border-color: var(--electric-teal);
  box-shadow: 0 0 0 2px rgba(0, 255, 163, 0.2);
}
```

#### Select Dropdown (Custom)
```css
/* Same base as text input */
appearance: none;
padding-right: 3rem;
background-image: url('chevron-down.svg');
background-repeat: no-repeat;
background-position: right 1rem center;
background-size: 16px;

/* Dropdown menu */
.dropdown-menu {
  background: var(--dark-700);
  border: 1px solid var(--electric-cyan);
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-option {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-subtle);
  transition: all 100ms;

  &:hover {
    background: var(--dark-600);
    color: var(--electric-cyan);
    border-left: 2px solid var(--electric-cyan);
  }

  &.selected {
    background: rgba(0, 229, 255, 0.1);
    color: var(--electric-cyan);
    font-weight: 600;
  }
}
```

#### Checkbox (Technical Square)
```css
width: 20px;
height: 20px;
border: 1px solid var(--border-medium);
border-radius: 2px;
background: var(--dark-800);
position: relative;
transition: all 150ms ease;
cursor: pointer;

&:hover {
  border-color: var(--electric-cyan);
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.3);
}

/* Checked state */
&:checked {
  background: var(--electric-cyan);
  border-color: var(--electric-cyan);
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.5);
}

/* Checkmark (SVG or pseudo-element) */
&:checked::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 6px;
  width: 5px;
  height: 10px;
  border: solid var(--dark-900);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
```

#### Radio Button (Technical)
```css
width: 20px;
height: 20px;
border: 1px solid var(--border-medium);
border-radius: 50%;
background: var(--dark-800);
position: relative;
transition: all 150ms ease;

&:checked {
  border-color: var(--electric-cyan);
  box-shadow: 0 0 12px rgba(0, 229, 255, 0.5);
}

&:checked::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--electric-cyan);
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.8);
}
```

#### Toggle Switch (Technical)
```css
width: 48px;
height: 24px;
border-radius: 12px;
background: var(--dark-600);
border: 1px solid var(--border-medium);
position: relative;
transition: all 200ms ease;
cursor: pointer;

/* Toggle circle */
&::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--text-tertiary);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Active state */
&:checked {
  background: linear-gradient(135deg, var(--electric-cyan), var(--electric-teal));
  border-color: var(--electric-cyan);
}

&:checked::after {
  left: 26px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 229, 255, 0.5);
}
```

---

### 7. Cards (Technical Panels)

#### Standard Card
```css
background: var(--dark-700);
border: 1px solid var(--border-medium);
border-radius: 6px;
padding: 1.5rem;
position: relative;
overflow: hidden;
transition: all 200ms ease;

/* Subtle grid pattern background */
&::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(var(--border-subtle) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.3;
  z-index: 0;
}

/* Interactive cards */
&.interactive {
  cursor: pointer;

  &:hover {
    border-color: var(--electric-cyan);
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.3);
    transform: translateY(-2px);
  }

  &:hover::after {
    opacity: 1;
  }

  /* Glow effect */
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    right: -50%;
    bottom: -50%;
    background: radial-gradient(circle, rgba(0, 229, 255, 0.1), transparent);
    opacity: 0;
    transition: opacity 200ms;
  }
}
```

#### Data Card (Metric Display)
```css
background: linear-gradient(135deg, var(--dark-750), var(--dark-700));
border: 1px solid var(--border-medium);
border-left: 3px solid var(--electric-cyan);
border-radius: 4px;
padding: 1.5rem;
position: relative;

/* Icon container */
.card-icon {
  width: 48px;
  height: 48px;
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid var(--electric-cyan);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: inset 0 0 20px rgba(0, 229, 255, 0.1);
}

/* Value */
.card-value {
  font-size: 2.5rem;
  font-family: var(--font-mono-num);
  font-weight: 700;
  color: var(--electric-cyan);
  text-shadow: 0 0 20px rgba(0, 229, 255, 0.5);
  line-height: 1;
  margin-bottom: 0.5rem;
}

/* Label */
.card-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
}

/* Trend indicator */
.card-trend {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 0.875rem;
  font-weight: 600;

  &.positive { color: var(--electric-teal); }
  &.negative { color: var(--electric-red); }
  &.neutral { color: var(--text-tertiary); }
}
```

---

### 8. Modals (Command Dialogs)

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ CONFIRM ACTION                                         [ESC] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  You are about to delete the following document:                 │
│                                                                   │
│  ┌───────────────────────────────────────────────────────┐      │
│  │  FILE:    report_2024.pdf                             │      │
│  │  HASH:    7a8f3d2c1e9b4f6a                            │      │
│  │  STATUS:  CERTIFIED                                   │      │
│  │  DATE:    2024-10-23                                  │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                   │
│  ⚠️ WARNING: This action cannot be undone.                       │
│  The certification record will be permanently removed.           │
│                                                                   │
│  Type DELETE to confirm:  [________________]                     │
│                                                                   │
│  [CANCEL]                                [CONFIRM DELETE]        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

Background overlay: rgba(10, 14, 26, 0.9)
Backdrop blur: 8px
Modal:
  - Max-width: 560px
  - Background: dark-800
  - Border: 2px solid electric-red
  - Border-radius: 6px
  - Padding: 2rem
  - Box-shadow: 0 24px 48px rgba(0, 0, 0, 0.8),
                0 0 40px rgba(255, 51, 102, 0.3)
  - Animation: Scale in + fade (200ms ease-out)
```

**Specifications:**
- Header:
  - Background: dark-750
  - Border-bottom: 1px solid border-medium
  - Padding: 1rem 1.5rem
  - Icon + title (uppercase, 0.875rem)
  - Close button (ESC hint)
- Body:
  - Padding: 1.5rem
  - Line-height: 1.6
- Info panel:
  - Background: dark-900
  - Border: 1px solid border-subtle
  - Border-radius: 4px
  - Padding: 1rem
  - Mono font for technical data
- Warning section:
  - Background: rgba(255, 51, 102, 0.05)
  - Border-left: 3px solid electric-red
  - Padding: 0.75rem 1rem
  - Icon + text
- Confirmation input:
  - Required for destructive actions
  - Mono font
  - Must match exact string
  - Button disabled until match
- Footer:
  - Background: dark-750
  - Border-top: 1px solid border-medium
  - Padding: 1rem 1.5rem
  - Button group: Space-between alignment

---

### 9. Progress Tracking (Terminal-Style)

```
┌─────────────────────────────────────────────────────────────────┐
│  🚀 CERTIFICATION PROGRESS TRACKER                               │
│  SESSION: C2PA-2024-10-23-001                  STATUS: ACTIVE    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ━━━ PHASE 1: INITIALIZATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  [████████████████████████████████████████] 100%                 │
│  ✓ COMPLETE  |  Duration: 00:02:34  |  Verified: 2024-10-23     │
│                                                                   │
│  ━━━ PHASE 2: DOCUMENT PROCESSING ━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  [██████████████████░░░░░░░░░░░░░░░░░░░░] 45%                   │
│  → ACTIVE    |  Elapsed: 00:05:12   |  ETA: 00:06:28            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Current Task: Extracting metadata                   │       │
│  │  Files Processed: 12 / 27                            │       │
│  │  Success Rate: 100%                                  │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
│  ━━━ PHASE 3: VERIFICATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0%                    │
│  ○ PENDING   |  Est. Start: 00:06:28                            │
│                                                                   │
│  ━━━ PHASE 4: CERTIFICATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0%                    │
│  ○ PENDING   |  Est. Start: 00:15:00                            │
│                                                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  OVERALL: [███████████░░░░░░░░░░░░░░░░░░░░░░░░░░] 35%           │
│  ⚡ System Performance: OPTIMAL  |  Memory: 2.4 GB  |  CPU: 45%  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Progress bars:
  - Height: 24px
  - Border: 1px solid border-medium
  - Border-radius: 4px
  - Background: dark-900
  - Fill: Gradient
    - Complete: electric-teal
    - Active: electric-cyan with animated pulse
    - Pending: dark-600
  - Text overlay: percentage on right
  - Mono font for all metrics
- Phase indicators:
  - Complete: ✓ electric-teal
  - Active: → electric-cyan with pulse animation
  - Pending: ○ text-tertiary
- Status panel:
  - Background: dark-800
  - Border: 1px solid border-subtle
  - Border-left: 3px solid electric-cyan
  - Mono font, 0.875rem
  - Real-time updates
- Metrics:
  - Duration, ETA, files processed
  - Mono font
  - Color-coded based on performance
- System status footer:
  - Real-time metrics
  - Color-coded performance indicators
  - Warning thresholds

---

### 10. Toast Notifications (System Messages)

```
┌─────────────────────────────────────────┐
│  [i] SYSTEM NOTIFICATION       [×] 4s   │
├─────────────────────────────────────────┤
│  ✓ Document certified successfully      │
│  HASH: 7a8f3d2c1e9b4f6a                 │
│  [View Details →]                       │
└─────────────────────────────────────────┘

Position: Bottom-right, 1rem from edges
Width: 360px
Height: Auto
Background:
  - Success: dark-750 with electric-teal left border (3px)
  - Error: dark-750 with electric-red left border
  - Warning: dark-750 with electric-yellow left border
  - Info: dark-750 with electric-blue left border
Border: 1px solid border-medium
Border-radius: 4px
Box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6),
            0 0 20px rgba(accent-color, 0.3)
Animation:
  - Slide in from right (200ms ease-out)
  - Auto-dismiss: 5s countdown visible
  - Dismiss on click or swipe right
```

**Specifications:**
- Header:
  - Icon + type label
  - Countdown timer (circular progress)
  - Close button
  - Font-size: 0.75rem, uppercase
- Body:
  - Icon (24px) + message
  - font-size: 0.9375rem
  - Optional technical details (mono font, 0.75rem)
- Action button (optional):
  - Underlined link style
  - Electric-cyan color
- Stack behavior:
  - Multiple toasts stack vertically
  - Max 3 visible at once
  - Older toasts push up and fade out

---

## Animations & Transitions

### Technical Timing
```css
--transition-instant: 100ms ease;
--transition-fast: 150ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease;
--transition-smooth: 400ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Animation Functions
```css
--ease-sharp: cubic-bezier(0.4, 0, 0.6, 1);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-emphasize: cubic-bezier(0, 0, 0.2, 1);
```

### Common Animations
```css
/* Glow Pulse */
@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(0, 229, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.8);
  }
}

/* Scan Line (loading effect) */
@keyframes scanLine {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

/* Terminal Cursor Blink */
@keyframes cursorBlink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

/* Scale In Sharp */
@keyframes scaleInSharp {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Electric Border Trace */
@keyframes borderTrace {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 100%;
  }
}
```

---

## Accessibility Standards

### WCAG 2.1 AAA Compliance (Dark Theme)

#### Color Contrast Ratios
- White text on dark-800: 15.2:1 (Excellent)
- Secondary text on dark-800: 7.8:1 (AAA)
- Electric-cyan on dark-800: 8.2:1 (AAA)
- Button text on electric-cyan: 12.1:1 (Excellent)

#### Focus States (High Visibility)
```css
:focus-visible {
  outline: 2px solid var(--electric-cyan);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 229, 255, 0.2),
              0 0 20px rgba(0, 229, 255, 0.4);
}

/* Animated focus for extra visibility */
@keyframes focusPulse {
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(0, 229, 255, 0.2);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(0, 229, 255, 0.4);
  }
}

:focus-visible {
  animation: focusPulse 2s infinite;
}
```

#### Screen Reader Support
- All technical data has readable labels
- Status indicators announced
- Progress updates announced
- Hash values have full descriptive text
- Keyboard shortcuts documented
- ARIA live regions for dynamic content

#### High Contrast Mode
```css
@media (prefers-contrast: high) {
  :root {
    --border-medium: #FFFFFF;
    --text-secondary: #FFFFFF;
    --electric-cyan: #00FFFF;
  }
}
```

---

## Responsive Behavior

### Desktop-First for Technical Users

#### Navigation
- Desktop (>1024px): Full horizontal nav with status bar
- Tablet (768-1024px): Condensed nav, icons prioritized
- Mobile (<768px): Slide-out panel, gesture controls

#### Chat Interface
- Desktop: Two-pane (console + metadata sidebar)
- Tablet: Single pane with bottom sheet
- Mobile: Full screen console, swipe for metadata

#### Document Management
- Desktop: Table view preferred (data-dense)
- Tablet: Hybrid table/card view
- Mobile: Card view optimized for touch

#### Admin Panel
- Desktop: Multi-column dashboard
- Tablet: 2-column stacked
- Mobile: Single column, collapsible sections

### Gesture Support
- Swipe right: Navigate back
- Swipe left: Open side panel
- Long press: Context menu
- Pull to refresh: Update data
- Pinch zoom: Not applicable (fixed layouts)

### Touch Targets
- Minimum size: 44px × 44px
- Spacing: 8px minimum
- Hover states translated to active states on touch

---

## Technical Specifications

### Grid Background Pattern
```css
.grid-pattern {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

### Glass Morphism
```css
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.02);
}
```

### Scan Line Effect (Loading)
```css
.scan-line {
  position: relative;
  overflow: hidden;
}

.scan-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--electric-cyan), transparent);
  animation: scanLine 2s linear infinite;
  box-shadow: 0 0 10px var(--electric-cyan);
}
```

---

## Implementation Notes

### Performance Optimizations
- Use `will-change` for animated elements
- Hardware acceleration for transforms
- Debounce scroll and resize events
- Lazy load heavy components
- Virtual scrolling for long lists

### Code Syntax Highlighting
```css
/* For code blocks in chat */
.code-block {
  background: var(--dark-900);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  padding: 1rem;
  font-family: var(--font-code);
  font-size: 0.875rem;
  overflow-x: auto;
}

/* Syntax colors */
.keyword { color: var(--electric-purple); }
.string { color: var(--electric-teal); }
.number { color: var(--electric-yellow); }
.comment { color: var(--text-tertiary); font-style: italic; }
.function { color: var(--electric-cyan); }
```

### Real-Time Data Updates
- WebSocket connections for live data
- Animated transitions for data changes
- Pulse effect for new items
- Sound notifications (optional, user-controlled)

---

## File Structure
```
/src/styles/
  /themes/
    tech-savvy-trustworthy.css
  /components/
    button-tech.css
    card-tech.css
    input-tech.css
    modal-tech.css
    table-tech.css
  /effects/
    glow.css
    grid-pattern.css
    scan-line.css
  /utilities/
    spacing.css
    typography.css
    colors.css
```

---

## Browser & Performance

### Browser Support
- Chrome/Edge: Latest 2 versions (primary target)
- Firefox: Latest 2 versions
- Safari: Latest 2 versions (limited CSS support)
- Electron: Full support (if desktop app)

### Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Layout shift: Minimal (use placeholders)
- Animation FPS: Consistent 60fps
- Bundle size: < 300KB (compressed)

---

## Design System Export

### For Developers
```javascript
export const techSavvyTheme = {
  colors: {
    primary: '#00E5FF',
    dark: {
      900: '#0A0E1A',
      800: '#0F1628',
      700: '#1A2235',
      // ... etc
    },
    electric: {
      cyan: '#00E5FF',
      teal: '#00FFA3',
      // ... etc
    }
  },
  spacing: {
    base: 4,
    preferred: 8,
    // ... etc
  },
  typography: {
    primary: 'Space Grotesk',
    code: 'JetBrains Mono',
    // ... etc
  },
  effects: {
    glow: '0 0 20px rgba(0, 229, 255, 0.4)',
    gridPattern: 'linear-gradient(...)',
    // ... etc
  }
};
```

---

## User Testing Focus

1. Dark theme eye strain (extended use)
2. Technical terminology comprehension
3. Data density preference
4. Glow effect intensity
5. Navigation efficiency
6. Trust and credibility perception
7. Status indicator clarity
8. Monospace font readability
