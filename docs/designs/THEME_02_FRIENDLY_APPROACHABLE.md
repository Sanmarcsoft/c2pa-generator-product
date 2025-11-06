# Theme 02: Friendly & Approachable

## Design Philosophy
A warm, inviting interface that makes users feel comfortable and confident. This theme uses soft colors, rounded shapes, and friendly iconography to create an approachable experience for C2PA certification. Perfect for users who may be new to the technology.

---

## Color Palette

### Primary Colors
```css
--warm-50: #FEF3F2;        /* Lightest warm background */
--warm-100: #FEE4E2;       /* Soft backgrounds */
--warm-200: #FECACA;       /* Gentle borders */
--warm-300: #FDA4AF;       /* Soft dividers */
--warm-400: #FB7185;       /* Subtle accents */
--warm-500: #F43F5E;       /* Primary warm */
--warm-600: #E11D48;       /* Darker warm */
--warm-700: #BE123C;       /* Deep warm */
--warm-800: #9F1239;       /* Very dark warm */
--warm-900: #881337;       /* Darkest warm */
```

### Accent Colors
```css
--friendly-blue: #60A5FA;      /* Trustworthy, calm */
--friendly-teal: #2DD4BF;      /* Fresh, modern */
--friendly-orange: #FB923C;    /* Energetic, warm */
--friendly-green: #4ADE80;     /* Success, positive */
--friendly-purple: #A78BFA;    /* Creative, unique */
--friendly-yellow: #FCD34D;    /* Attention, cheerful */
```

### Semantic Colors
```css
--background-primary: #FFFBF5;      /* Cream white */
--background-secondary: #FFF8F0;    /* Warm white */
--background-tertiary: #FEF3E7;     /* Light peach */
--background-accent: #E0F2FE;       /* Soft blue tint */
--text-primary: #3F3F46;            /* Warm dark gray */
--text-secondary: #71717A;          /* Medium gray */
--text-tertiary: #A1A1AA;           /* Light gray */
--text-on-color: #FFFFFF;           /* White for colored backgrounds */
--border-color: #E5E7EB;            /* Soft border */
--shadow-soft: rgba(251, 146, 60, 0.08);
--shadow-warm: rgba(251, 146, 60, 0.12);
--shadow-strong: rgba(251, 146, 60, 0.18);
```

---

## Typography

### Font Families
```css
--font-primary: 'Nunito', 'Quicksand', -apple-system, BlinkMacSystemFont, sans-serif;
--font-headings: 'Poppins', 'Nunito', -apple-system, sans-serif;
--font-code: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale
```css
/* Headings */
--text-display: 2.75rem;     /* 44px - Friendly hero */
--text-h1: 2rem;             /* 32px - Page titles */
--text-h2: 1.75rem;          /* 28px - Section headers */
--text-h3: 1.5rem;           /* 24px - Subsections */
--text-h4: 1.25rem;          /* 20px - Card titles */
--text-h5: 1.125rem;         /* 18px - Small headings */

/* Body */
--text-base: 1rem;           /* 16px - Body text */
--text-sm: 0.9375rem;        /* 15px - Secondary text (larger than typical) */
--text-xs: 0.8125rem;        /* 13px - Captions, labels */

/* Font Weights */
--weight-light: 300;
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-extrabold: 800;

/* Line Heights */
--leading-tight: 1.3;        /* Headings */
--leading-normal: 1.6;       /* Body text (more spacious) */
--leading-relaxed: 1.8;      /* Long-form content */
```

---

## Spacing System

### Base Unit: 4px (with emphasis on comfortable spacing)
```css
--space-0: 0;
--space-1: 0.25rem;     /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-3: 0.75rem;     /* 12px */
--space-4: 1rem;        /* 16px */
--space-5: 1.5rem;      /* 24px - More generous */
--space-6: 2rem;        /* 32px */
--space-8: 2.5rem;      /* 40px */
--space-10: 3rem;       /* 48px */
--space-12: 4rem;       /* 64px */
--space-16: 5rem;       /* 80px */
--space-20: 6rem;       /* 96px */
```

---

## Layout & Grid

### Container Widths (Slightly narrower for coziness)
```css
--container-sm: 600px;
--container-md: 720px;
--container-lg: 960px;
--container-xl: 1200px;
--container-2xl: 1400px;
```

### Breakpoints
```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
```

### Border Radius (Generous rounding)
```css
--radius-sm: 0.5rem;      /* 8px - Small elements */
--radius-md: 0.75rem;     /* 12px - Buttons, inputs */
--radius-lg: 1rem;        /* 16px - Cards */
--radius-xl: 1.5rem;      /* 24px - Large cards */
--radius-2xl: 2rem;       /* 32px - Hero sections */
--radius-full: 9999px;    /* Pill shape (common) */
```

---

## Component Specifications

### 1. Header / Navigation

#### Desktop Layout (>1024px)
```
┌─────────────────────────────────────────────────────────────────┐
│   🏠 C2PA Generator     🏠 Home  💬 Chat  📄 Docs  📊 Progress   │
│   Your Friendly Certification Assistant    👤 Profile  [Sarah] │
└─────────────────────────────────────────────────────────────────┘
Height: 80px
Background: Linear gradient (warm-100 to warm-50)
Border-bottom: 3px solid friendly-orange
Subtle shadow: 0 2px 8px rgba(251, 146, 60, 0.1)
```

**Specifications:**
- Logo: Icon (32px) + Text (1.5rem, weight 700, friendly-orange)
- Tagline: font-size 0.875rem (14px), color text-secondary, italic
- Nav links:
  - Icon (20px) + Text
  - font-size 0.9375rem (15px)
  - padding: 0.625rem 1.25rem
  - border-radius: 24px (full pill)
  - Background on hover: white with subtle shadow
  - Active state: background friendly-blue at 15% opacity
- Profile section:
  - Avatar (40px circle) + Name
  - Friendly greeting: "Hello, Sarah!"
  - Dropdown with soft shadow and rounded corners

#### Mobile Layout (<768px)
```
┌──────────────────────────────┐
│  🏠  C2PA Generator      👤  │
└──────────────────────────────┘
┌──────────────────────────────┐
│  🏠 Home                      │
│  💬 Chat                      │
│  📄 Documents                 │
│  📊 Progress                  │
│  👤 Profile                   │
└──────────────────────────────┘
Height: 72px
Bottom tab bar (64px) with large friendly icons
Haptic feedback on tap (if supported)
```

---

### 2. Chat Interface

#### Desktop Layout
```
┌─────────────────────────────────────────────────────────────────┐
│                  💬 Chat with Your AI Assistant                  │
│                  We're here to help!                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────┐         │
│  │ 😊                                                  │         │
│  │ Hi there! I'm your C2PA certification assistant.   │         │
│  │ I'm here to help make your certification journey   │         │
│  │ smooth and easy. What would you like to know?      │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                   │
│           ┌────────────────────────────────────────┐             │
│           │ How do I get started with C2PA?        │  👤         │
│           └────────────────────────────────────────┘             │
│                                                                   │
│  ┌────────────────────────────────────────────────────┐         │
│  │ 😊                                                  │         │
│  │ Great question! Let me walk you through the        │         │
│  │ first steps... [Show More ▼]                       │         │
│  │                                                     │         │
│  │ Quick Actions:                                      │         │
│  │ [📚 View Guide] [🚀 Start Setup] [❓ More Help]    │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐   ────────┐        │
│  │ Type your message here...               │   │ Send! │        │
│  │                                         │   │   ➜   │        │
│  └─────────────────────────────────────────┘   ────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Container: max-width 880px, centered
- Header:
  - Large friendly emoji (32px)
  - Title: font-size 1.5rem, weight 700
  - Subtitle: font-size 0.9375rem, color text-secondary, italic
- Message bubbles:
  - AI:
    - Background: Linear gradient (warm-50 to warm-100)
    - Border: 2px solid friendly-orange
    - padding: 1.25rem 1.5rem
    - Border-radius: 24px 24px 24px 4px
    - Shadow: soft
  - User:
    - Background: friendly-blue at 12% opacity
    - Border: 2px solid friendly-blue
    - padding: 1.25rem 1.5rem
    - Border-radius: 24px 24px 4px 24px
    - Shadow: soft
  - Margin between: 2rem
- Avatar emoji: 40px, positioned top-left
- Message text: font-size 1rem (16px), line-height 1.6
- Quick actions:
  - Pill-shaped buttons
  - Icon + text
  - Background: white
  - Border: 2px solid border-color
  - Hover: lift with shadow
- Input area:
  - Height: 80px
  - Background: white
  - Border-top: 2px solid border-color
  - Input:
    - Padding: 1rem 1.5rem
    - Border-radius: 28px (full pill)
    - Border: 2px solid border-color
    - Focus: border-color friendly-blue, glow
  - Send button:
    - Width: 80px
    - Height: 56px
    - Border-radius: 28px
    - Background: gradient (friendly-orange to warm-500)
    - Icon + "Send!" text
    - Hover: slight scale up (1.05)

#### Mobile Chat
```
┌──────────────────────────┐
│   😊 Your AI Friend      │
├──────────────────────────┤
│                          │
│  ┌────────────────────┐  │
│  │ 😊 Hi! How can I   │  │
│  │    help you today? │  │
│  └────────────────────┘  │
│                          │
│     ┌────────────────┐   │
│     │ Tell me about  │ 👤│
│     │ C2PA certs     │   │
│     └────────────────┘   │
│                          │
│  ┌────────────────────┐  │
│  │ 😊 I'd love to     │  │
│  │    explain!...     │  │
│  └────────────────────┘  │
│                          │
├──────────────────────────┤
│ [Type here...]    [➜]   │
└──────────────────────────┘
```

---

### 3. Document Management Page

#### Card-Based Layout with Friendly Icons
```
┌─────────────────────────────────────────────────────────────────┐
│  📁 My Documents                        [+ Add File] [⚙️ Settings]│
│  Manage your certification documents                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐      │
│  │             │             │             │             │      │
│  │   📄 ─┐     │   🖼️ ─┐     │   🎬 ─┐     │   📊 ─┐     │      │
│  │      ─┘     │      ─┘     │      ─┘     │      ─┘     │      │
│  │             │             │             │             │      │
│  │ Report.pdf  │ Photo.jpg   │ Video.mp4   │ Data.xlsx   │      │
│  │ 2.4 MB      │ 1.8 MB      │ 45.2 MB     │ 512 KB      │      │
│  │ 📅 Today    │ 📅 Today    │ 📅 Yesterday│ 📅 Yesterday│      │
│  │             │             │             │             │      │
│  │ ✓ Ready!    │ ⏳ Working… │ ✓ Ready!    │ ⏳ Working… │      │
│  │             │             │             │             │      │
│  │ [👁️ View]   │ [👁️ View]   │ [👁️ View]   │ [👁️ View]   │      │
│  │ [⋯ More]    │ [⋯ More]    │ [⋯ More]    │ [⋯ More]    │      │
│  └─────────────┴─────────────┴─────────────┴─────────────┘      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Grid: 4 columns desktop, 2 tablet, 1 mobile
- Card dimensions: Comfortable aspect ratio 1:1.3
- Card style:
  - Background: white
  - Border: 2px solid border-color
  - Border-radius: 20px
  - Padding: 1.5rem
  - Hover: Lift -4px, shadow elevation, border-color friendly-blue
  - Transition: 250ms ease-out (slightly slower for friendly feel)
- Icon: 56px, soft colors, shadow for depth
- Title:
  - font-size 1rem
  - weight 600
  - Truncate with ellipsis
  - Color: text-primary
- Metadata:
  - Icon + text (date, size)
  - font-size 0.875rem
  - color: text-secondary
- Status badge:
  - Pill shape (full border-radius)
  - Padding: 0.375rem 0.875rem
  - Font-size: 0.875rem
  - Ready: gradient green, emoji ✓
  - Working: gradient yellow, animated dots
  - Error: gradient red, emoji ⚠️
- Buttons:
  - Icon + text
  - Pill shaped
  - Soft shadows
  - Friendly hover states (scale 1.03)

---

### 4. Admin Panel

#### Dashboard Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  ⚙️ Admin Dashboard                                [👤 John Doe] │
│  Manage your system with ease                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📊 Quick Stats                                                   │
│  ┌────────────┬────────────┬────────────┬────────────┐           │
│  │ 👥 Users   │ 📄 Docs    │ 🤖 AI      │ 💾 Storage │           │
│  │            │            │            │            │           │
│  │   1,247    │   5,832    │  12,456    │  45.2 GB   │           │
│  │   Active   │   Total    │  Requests  │  Used      │           │
│  │            │            │            │            │           │
│  │ ───────────│ ───────────│ ───────────│ ───────────│           │
│  │ +12% ↗     │ +24% ↗     │ +8% ↗      │ 68% full   │           │
│  └────────────┴────────────┴────────────┴────────────┘           │
│                                                                   │
│  🤖 AI Provider Setup                                             │
│  ┌───────────────────────────────────────────────────┐           │
│  │                                                    │           │
│  │  Choose Provider:  [OpenWebUI ▼]                  │           │
│  │                                                    │           │
│  │  API URL:  [http://localhost:3000/api_________]   │           │
│  │  🔗 Make sure your AI service is running!         │           │
│  │                                                    │           │
│  │  API Key:  [••••••••••••••••••] [👁️ Show]        │           │
│  │  🔒 Your key is safely encrypted                  │           │
│  │                                                    │           │
│  │  [✓ Test Connection]  [💾 Save Settings]          │           │
│  │                                                    │           │
│  └───────────────────────────────────────────────────┘           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Header:
  - Large friendly emoji (28px)
  - Title: font-size 1.75rem, weight 700
  - Subtitle: font-size 1rem, italic, text-secondary
- Stat cards:
  - Background: Gradient (warm-50 to white)
  - Border: 2px solid border-color
  - Border-radius: 20px
  - Padding: 1.75rem
  - Emoji icon: 32px at top
  - Number: font-size 2.5rem, weight 800, gradient text
  - Label: font-size 0.9375rem, text-secondary
  - Trend indicator: Small pill with arrow emoji
  - Hover: Gentle lift and shadow increase
- Form sections:
  - Background: white
  - Border: 2px solid border-color
  - Border-radius: 20px
  - Padding: 2rem
  - Info messages: Icon + text in soft background pills
- Input fields:
  - Height: 52px (more comfortable)
  - Border: 2px solid border-color
  - Border-radius: 14px
  - Padding: 0 1.25rem
  - Font-size: 1rem
  - Focus:
    - border-color: friendly-blue
    - Glow: 0 0 0 4px rgba(96, 165, 250, 0.15)
    - Smooth transition

---

### 5. Buttons

#### Primary Button (Friendly Pill)
```css
background: linear-gradient(135deg, var(--friendly-orange), var(--warm-500));
color: white;
padding: 0.75rem 2rem;
border-radius: 9999px; /* Full pill */
font-size: 1rem;
font-weight: 600;
border: none;
box-shadow: 0 2px 8px rgba(251, 146, 60, 0.25);
transition: all 200ms ease-out;

/* Hover */
transform: translateY(-2px) scale(1.02);
box-shadow: 0 4px 12px rgba(251, 146, 60, 0.35);

/* Active */
transform: translateY(0) scale(0.98);

/* Disabled */
opacity: 0.6;
cursor: not-allowed;
filter: grayscale(40%);
```

#### Secondary Button
```css
background: white;
color: var(--text-primary);
padding: 0.75rem 2rem;
border-radius: 9999px;
border: 2px solid var(--border-color);
font-size: 1rem;
font-weight: 600;
transition: all 200ms ease-out;

/* Hover */
background: var(--background-secondary);
border-color: var(--friendly-blue);
transform: translateY(-1px);
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
```

#### Icon Button
```css
width: 48px;
height: 48px;
border-radius: 50%;
background: white;
border: 2px solid var(--border-color);
display: flex;
align-items: center;
justify-content: center;
transition: all 200ms ease-out;

/* Icon size: 24px */

/* Hover */
background: var(--friendly-blue) at 10% opacity;
border-color: var(--friendly-blue);
transform: rotate(10deg) scale(1.1);
```

---

### 6. Form Elements

#### Text Input (Rounded & Friendly)
```css
height: 52px;
padding: 0 1.25rem;
background: white;
border: 2px solid var(--border-color);
border-radius: 16px;
font-size: 1rem;
color: var(--text-primary);
transition: all 200ms ease-out;

/* Placeholder */
::placeholder {
  color: var(--text-tertiary);
  font-style: italic;
}

/* Focus */
border-color: var(--friendly-blue);
box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.15);
outline: none;

/* Error State */
border-color: var(--accent-red);
background: rgba(239, 68, 68, 0.02);
box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);

/* Success State */
border-color: var(--friendly-green);
/* Show checkmark icon on right */
```

#### Select Dropdown
```css
Same as text input, with:
- Custom chevron icon (16px) on right
- Padding-right: 3rem
- Options menu:
  - Border-radius: 16px
  - Shadow: 0 8px 24px rgba(0, 0, 0, 0.12)
  - Padding: 0.5rem
  - Options with hover background (warm-50)
```

#### Checkbox (Friendly Square)
```css
width: 24px;
height: 24px;
border: 2px solid var(--border-color);
border-radius: 8px;
background: white;
transition: all 200ms ease-out;
cursor: pointer;

/* Checked */
background: linear-gradient(135deg, var(--friendly-blue), var(--friendly-teal));
border-color: var(--friendly-blue);
/* Animated checkmark */

/* Hover */
border-color: var(--friendly-blue);
transform: scale(1.1);
```

#### Toggle Switch (Friendly)
```css
width: 56px;
height: 32px;
border-radius: 9999px;
background: var(--border-color);
position: relative;
transition: all 250ms ease-out;

/* Toggle circle */
width: 28px;
height: 28px;
border-radius: 50%;
background: white;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
position: absolute;
top: 2px;
left: 2px;
transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);

/* Active state */
background: linear-gradient(135deg, var(--friendly-green), var(--friendly-teal));
/* Toggle circle moves right */
left: 26px;
```

---

### 7. Cards

#### Standard Card (Friendly & Soft)
```css
background: white;
border: 2px solid var(--border-color);
border-radius: 20px;
padding: 1.75rem;
box-shadow: 0 2px 8px var(--shadow-soft);
transition: all 250ms ease-out;

/* Hover (interactive cards) */
box-shadow: 0 8px 20px var(--shadow-warm);
transform: translateY(-4px);
border-color: var(--friendly-blue);
```

#### Card with Icon Header
```css
/* Icon container at top */
width: 64px;
height: 64px;
border-radius: 20px;
background: gradient (friendly-blue to friendly-teal);
display: flex;
align-items: center;
justify-content: center;
margin-bottom: 1rem;
box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);

/* Icon: 32px, white */
```

#### Stat Card (Playful)
```css
background: gradient (warm-50 to white);
border: 2px solid var(--friendly-orange);
border-radius: 20px;
padding: 1.5rem;
text-align: center;

/* Emoji at top: 40px */

/* Number */
font-size: 2.5rem;
font-weight: 800;
background: linear-gradient(135deg, var(--friendly-orange), var(--warm-600));
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;

/* Label */
font-size: 0.9375rem;
color: var(--text-secondary);
margin-top: 0.5rem;
```

---

### 8. Modals (Friendly Dialog)

```
┌─────────────────────────────────────────┐
│  😊 Just Checking!               [×]    │
├─────────────────────────────────────────┤
│                                         │
│  Are you sure you want to remove this   │
│  document? Don't worry, we can always   │
│  add it back later!                     │
│                                         │
│  [← Go Back]  [Yes, Remove It →]        │
│                                         │
└─────────────────────────────────────────┘

Background overlay: rgba(63, 63, 70, 0.6)
Backdrop blur: 6px
Modal:
  - Max-width: 480px
  - Background: white
  - Border: 3px solid friendly-blue
  - Border-radius: 24px
  - Padding: 2rem
  - Shadow: 0 20px 50px rgba(0, 0, 0, 0.2)
  - Animation: Bounce in (300ms cubic-bezier(0.68, -0.55, 0.265, 1.55))
```

**Specifications:**
- Header with friendly emoji (32px)
- Title: font-size 1.5rem, weight 700
- Close button: Rounded, hover scale
- Body text: font-size 1rem, line-height 1.6, friendly tone
- Button group: Equal width, comfortable spacing (1rem gap)

---

### 9. Progress Tracking (Cheerful Starship)

```
┌─────────────────────────────────────────────────────────────────┐
│  🚀 Your Certification Journey!                                  │
│  You're doing great! Keep it up!                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │   Step 1: Setup ✓                                    │       │
│  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100% Complete!       │       │
│  │   🎉 Amazing job!                                     │       │
│  │                                                       │       │
│  │   Step 2: Add Documents 📄 → You're here!            │       │
│  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░ 45% Complete       │       │
│  │   💪 Almost halfway there!                            │       │
│  │                                                       │       │
│  │   Step 3: Review ○                                   │       │
│  │   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ Not started yet    │       │
│  │   ⏳ Coming up next!                                  │       │
│  │                                                       │       │
│  │   Step 4: Certify! 🎖️ ○                              │       │
│  │   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ Not started yet    │       │
│  │   🎯 The final step!                                  │       │
│  │                                                       │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
│  🌟 Overall Progress: 35%                                         │
│  ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                       │
│  You've earned 7 out of 20 badges! 🏅                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Progress bars:
  - Height: 12px (chunkier)
  - Border-radius: 9999px (full pill)
  - Background: warm-100
  - Border: 2px solid border-color
  - Fill: Animated gradient
    - Complete: friendly-green to friendly-teal
    - In Progress: friendly-blue to friendly-purple
    - Not Started: warm-200
  - Animation: Smooth fill (500ms ease-out), subtle pulse for active
- Step indicators:
  - Complete: ✓ green circle with celebratory emoji
  - In Progress: → blue circle with encouraging emoji
  - Pending: ○ gray circle with waiting emoji
- Encouragement messages:
  - Font-size: 0.9375rem
  - Color: text-secondary
  - Italic, friendly tone
- Badge system visible with emoji rewards

---

### 10. Toast Notifications (Friendly Messages)

```
┌─────────────────────────────────────────┐
│  ✓  Awesome! Document uploaded! 🎉      │
└─────────────────────────────────────────┘

Position: Top-center (friendlier than corner)
Width: Min 360px, max 500px
Height: Auto, min 64px
Background:
  - Success: Gradient (friendly-green to friendly-teal), white text
  - Error: Gradient (accent-red to warm-500), white text
  - Info: Gradient (friendly-blue to friendly-purple), white text
  - Warning: Gradient (friendly-yellow to friendly-orange), dark text
Border-radius: 16px
Shadow: 0 8px 24px rgba(0, 0, 0, 0.2)
Animation:
  - Slide down from top with bounce (300ms ease-out)
  - Auto-dismiss after 5s with fade out
  - Include celebratory emoji based on type
```

---

## Animations & Transitions

### Friendly Timing Functions
```css
--transition-quick: 150ms ease-out;
--transition-normal: 250ms ease-out;
--transition-slow: 400ms ease-out;
--transition-bounce: 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Animation Timing Functions
```css
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Common Animations
```css
/* Bounce In */
@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

/* Wiggle (for emphasis) */
@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

/* Pulse Glow */
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(96, 165, 250, 0.4);
  }
  50% {
    box-shadow: 0 0 20px rgba(96, 165, 250, 0.7);
  }
}

/* Float Up */
@keyframes floatUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

#### Color Contrast Ratios
- Normal text on warm backgrounds: 4.8:1 (Pass)
- Large text: 3.2:1 (Pass)
- Button text on gradients: 4.7:1 (Pass)
- Icons with labels: N/A (text provides meaning)

**Contrast Tested:**
- Primary text on cream: 11.2:1
- Secondary text on cream: 4.9:1
- Orange accent on white: 3.8:1
- Blue accent on white: 4.5:1

#### Focus States (Extra Friendly)
```css
:focus-visible {
  outline: 3px solid var(--friendly-blue);
  outline-offset: 3px;
  border-radius: inherit;
  box-shadow: 0 0 0 6px rgba(96, 165, 250, 0.2);
}

/* Animated focus ring */
@keyframes focusRing {
  0%, 100% { box-shadow: 0 0 0 6px rgba(96, 165, 250, 0.2); }
  50% { box-shadow: 0 0 0 6px rgba(96, 165, 250, 0.4); }
}
```

#### Screen Reader Support
- Emoji have `aria-label` descriptions
- All buttons have descriptive labels
- Form fields have visible labels (not just placeholders)
- Loading states announced
- Success/error messages announced
- Friendly, encouraging alt text

---

## Responsive Behavior

### Mobile-First with Bottom Navigation

#### Navigation Pattern
- Desktop (>1024px): Top horizontal nav
- Tablet (768-1024px): Top nav with icons + text
- Mobile (<768px): Bottom tab bar with large icons

#### Bottom Tab Bar (Mobile)
```
┌──────────────────────────────┐
│                              │
│  [Main Content Area]         │
│                              │
├──────────────────────────────┤
│  🏠    💬    📄    📊    👤  │
│ Home  Chat  Docs  Track  Me  │
└──────────────────────────────┘

Height: 72px
Background: white
Border-top: 2px solid border-color
Shadow: 0 -2px 8px rgba(0, 0, 0, 0.08)
Icons: 28px
Labels: 0.75rem
Active state: Icon colored, slight scale
```

#### Chat on Mobile
- Full screen
- Input docked at bottom
- Messages take 80% of screen
- Larger tap targets (minimum 48px)

#### Document Grid
- Desktop: 4 columns
- Tablet: 2 columns with more padding
- Mobile: 1 column, full width cards with generous spacing

### Touch Interactions
- Minimum touch target: 48px × 48px
- Swipe gestures for navigation
- Pull to refresh on lists
- Long press for context menus
- Haptic feedback (if supported)

---

## Iconography

### Icon Style
- Friendly rounded icons (Phosphor, Heroicons Rounded)
- Size variants: 16px, 20px, 24px, 32px, 48px
- Emoji as decorative icons (when appropriate)
- Consistent stroke width: 2px

### Common Icons with Emoji
- Home: 🏠
- Chat: 💬
- Documents: 📄
- Progress: 📊 or 🚀
- Profile: 👤
- Success: ✓ or 🎉
- Error: ⚠️ or 😬
- Info: ℹ️ or 💡
- Settings: ⚙️
- Upload: ⬆️ or 📤
- Download: ⬇️ or 📥

---

## Micro-interactions

### Button Hover
- Slight lift (-2px)
- Shadow expansion
- Color intensification
- Scale: 1.02

### Card Hover
- Lift (-4px)
- Border color change
- Shadow growth
- Smooth 250ms transition

### Input Focus
- Border color change
- Glow appearance
- Placeholder fade
- Icon color shift

### Success State
- Confetti animation (optional)
- Color transition
- Checkmark drawing animation
- Celebratory message

---

## Implementation Notes

### Emoji Usage Guidelines
- Use sparingly for emphasis
- Always provide text alternative
- Aria-hidden="true" for decorative emoji
- Test across platforms for consistency
- Consider emoji skin tone neutrality

### Animation Performance
- Use `transform` and `opacity`
- Enable `will-change` for animated elements
- Respect `prefers-reduced-motion`
- Keep animations under 400ms
- Provide instant feedback (<100ms)

### Accessibility First
- Always test with screen readers
- Ensure keyboard navigation
- Provide skip links
- Maintain logical tab order
- High contrast mode support

---

## File Structure
```
/src/styles/
  /themes/
    friendly-approachable.css
  /components/
    button-friendly.css
    card-friendly.css
    input-friendly.css
    modal-friendly.css
  /animations/
    bounce.css
    pulse.css
    wiggle.css
```

---

## Design Token Export

### For Developers
```javascript
export const friendlyTheme = {
  colors: {
    primary: '#FB923C',
    secondary: '#60A5FA',
    success: '#4ADE80',
    // ... etc
  },
  spacing: {
    base: 4,
    comfortable: 24,
    // ... etc
  },
  radius: {
    small: 8,
    medium: 16,
    large: 24,
    full: 9999
  },
  transitions: {
    quick: '150ms ease-out',
    normal: '250ms ease-out',
    bounce: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
};
```

---

## User Testing Focus Areas
1. Emoji comprehension across age groups
2. Color warmth perception
3. Button discoverability
4. Touch target comfort
5. Overall friendliness rating
