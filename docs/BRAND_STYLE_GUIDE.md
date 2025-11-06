# Trusteddit Brand Style Guide

**Version:** 1.0
**Last Updated:** November 2025
**Company:** SanMarcSoft LLC
**Domain:** trusteddit.com
**CAI Member:** Content Authenticity Initiative

---

## Table of Contents

1. [Brand Overview](#brand-overview)
2. [Logo Usage](#logo-usage)
3. [Color Palette](#color-palette)
4. [Typography](#typography)
5. [Partner Logos](#partner-logos)
6. [Spacing & Layout](#spacing--layout)
7. [Voice & Messaging](#voice--messaging)
8. [Do's and Don'ts](#dos-and-donts)
9. [File Naming Conventions](#file-naming-conventions)
10. [Export Formats](#export-formats)

---

## Brand Overview

### Brand Identity

**Trusteddit** is an enterprise C2PA certification platform that empowers content creators and organizations with trusted, verifiable digital provenance.

### Mission Statement

> Restoring trust in digital content through verifiable provenance and C2PA standards.

### Brand Values

- **Trust**: Building confidence through transparency
- **Innovation**: Leveraging cutting-edge C2PA technology
- **Accessibility**: Making certification achievable for all
- **Security**: Enterprise-grade protection for your content

### Company Information

- **Operated by:** SanMarcSoft LLC
- **Domain:** trusteddit.com
- **Membership:** Content Authenticity Initiative (CAI)
- **Standards:** Coalition for Content Provenance and Authenticity (C2PA)

---

## Logo Usage

### Primary Logo

**File:** `trusteddit_logo.png`
**Dimensions:** 1200 x 1200 px
**Format:** PNG with transparency
**Background:** Blue gradient (#4A90E2)

#### Logo Specifications

- **Primary Use:** Header navigation, app icons, marketing materials
- **Minimum Size:** 32px (web), 0.5 inch (print)
- **Clear Space:** Minimum 16px padding around logo
- **Aspect Ratio:** 1:1 (square)

#### Logo Variations

```
/frontend/public/images/logos/
├── trusteddit_logo.png          # Primary logo (1200x1200)
├── trusteddit_logo_small.png    # Icon size (128x128) - to be created
└── trusteddit_logo_white.png    # Inverse for dark backgrounds - to be created
```

### Logo Placement Guidelines

#### Header (Desktop)
- Size: 48px x 48px
- Position: Top left
- Paired with: "TRUSTEDDIT" text (18px, semibold)
- Clear space: 16px all sides

#### Header (Mobile)
- Size: 40px x 40px
- Position: Top left
- Text: Optional (can hide on narrow screens)

#### Footer
- Size: 40px x 40px
- Position: Footer brand section
- Paired with: Company name and tagline

#### App Icon / Favicon
- Size: 192px x 192px (standard), 512px x 512px (high-res)
- Format: PNG with transparency or ICO

---

## Color Palette

### Primary Brand Colors

```css
/* Trusteddit Blue - Primary Brand Color */
--trusteddit-blue: #3C83F6;
--trusteddit-blue-light: #60A5FA;
--trusteddit-blue-dark: #2563EB;

/* Electric Cyan (Accent) */
--electric-cyan: #0099CC;
--electric-cyan-light: #00CCFF;

/* Electric Teal (Secondary Accent) */
--electric-teal: #00CC99;
--electric-teal-light: #00FFB8;
```

### Neutral Colors

```css
/* Light Mode */
--light-100: #F9FAFB;  /* Background primary */
--light-200: #F3F4F6;  /* Background secondary */
--light-300: #E5E7EB;  /* Borders */

/* Text */
--text-primary: #111827;
--text-secondary: #6B7280;
--text-tertiary: #9CA3AF;

/* Dark Mode */
--dark-900: #0A0A0A;   /* Background primary */
--dark-800: #1F2937;   /* Background secondary */
--dark-700: #374151;   /* Borders */
```

### Semantic Colors

```css
/* Success */
--success: #10B981;
--success-light: #34D399;

/* Warning */
--warning: #F59E0B;
--warning-light: #FBBF24;

/* Error */
--error: #EF4444;
--error-light: #F87171;

/* Info */
--info: #3B82F6;
--info-light: #60A5FA;
```

### Color Contrast Guidelines

All color combinations must meet **WCAG AA** standards:
- Normal text: 4.5:1 contrast ratio
- Large text (18px+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Approved Combinations:**
- ✅ `--text-primary` on `--light-100` (18.7:1)
- ✅ `--text-secondary` on `--light-100` (7.8:1)
- ✅ White text on `--electric-cyan` (4.7:1)
- ✅ White text on `--trusteddit-blue` (5.2:1)

---

## Typography

### Font Families

#### Primary Font: Inter (Professional Standard)
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```
- **Use for:** All body text, UI components, headings, and general content
- **Weights:** 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Line Height:** 1.6 for body text, 1.25 for headings
- **Font Smoothing:** Antialiased for crisp, professional appearance

#### Secondary Font: Lato (Alternative)
```css
font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```
- **Use for:** Marketing materials, alternative designs
- **Weights:** 300 (light), 400 (regular), 700 (bold)

#### System Fallback
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

#### ⚠️ Deprecated Fonts
**Press Start 2P** and other 8-bit/pixel fonts are **deprecated** for professional use. These fonts:
- Reduce readability and accessibility
- Appear unprofessional in business contexts
- Do not meet modern typography standards
- Should **not** be used in production interfaces

### Type Scale

```css
--text-xs: 0.75rem;    /* 12px - Captions, labels */
--text-sm: 0.875rem;   /* 14px - Secondary text */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Subheadings */
--text-xl: 1.25rem;    /* 20px - Card titles */
--text-2xl: 1.5rem;    /* 24px - Section titles */
--text-3xl: 1.875rem;  /* 30px - Page titles */
--text-4xl: 2.25rem;   /* 36px - Hero titles */
```

### Font Weights

```css
--weight-light: 300;
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

### Line Heights

```css
--line-tight: 1.25;    /* Headings */
--line-normal: 1.5;    /* Body text */
--line-relaxed: 1.6;   /* Comfortable reading */
--line-loose: 1.8;     /* Marketing copy */
```

### Typography Best Practices

1. **Hierarchy**: Use size and weight to establish clear hierarchy
2. **Line Length**: 60-80 characters per line for optimal readability
3. **Paragraph Spacing**: 1.5-2em between paragraphs
4. **Letter Spacing**: -0.02em for large headings, 0.025em for uppercase labels

---

## Partner Logos

### C2PA (Coalition for Content Provenance and Authenticity)

**Official Website:** https://c2pa.org/
**Logo Location:** `/frontend/public/images/logos/c2pa_logo.svg` (to be acquired)

#### Usage Guidelines
- Display C2PA logo in footer and "About" sections
- Minimum size: 100px width
- Always link to: https://c2pa.org/
- Maintain original colors (do not alter)
- Include "C2PA" text label when space allows

#### C2PA Content Credentials Icon
- "cr" icon in circle with angled corner
- Use for content verification indicators
- Reference: https://spec.c2pa.org/specifications/specifications/2.0/ux/

### CAI (Content Authenticity Initiative)

**Official Website:** https://contentauthenticity.org/
**Logo Location:** `/frontend/public/images/logos/cai_logo.svg` (to be acquired)

#### Usage Guidelines
- **Prominent Display**: CAI membership badge in footer
- Display format: "Proud Member of Content Authenticity Initiative"
- Badge style: Gradient background (cyan to teal), white text, checkmark icon
- Always link to: https://contentauthenticity.org/
- Include membership statement when appropriate

### SanMarcSoft LLC Branding

**Company Name Display:**
- Always use: "SanMarcSoft LLC" (capitalize S, M, and S)
- Never: "Sanmarcsoft", "San Marc Soft", "SanMarc Soft"

**Positioning:**
- "A SanMarcSoft LLC Product"
- "Operated by SanMarcSoft LLC"
- Copyright notices: "© 2025 SanMarcSoft LLC"

---

## Spacing & Layout

### Spacing Scale

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - Small elements */
--radius-md: 0.5rem;    /* 8px - Buttons, cards */
--radius-lg: 0.75rem;   /* 12px - Large cards */
--radius-xl: 1rem;      /* 16px - Modal, dialog */
--radius-full: 9999px;  /* Full round - Pills, badges */
```

### Layout Constraints

```css
--max-width-content: 1200px;  /* Main content */
--max-width-text: 65ch;       /* Readable text */
--max-width-wide: 1400px;     /* Header/footer */
```

### Grid System

- **Mobile**: Single column (< 768px)
- **Tablet**: 2-column grid (768px - 1024px)
- **Desktop**: 3-4 column grid (> 1024px)
- **Gap**: 1.5rem (24px) standard, 3rem (48px) for sections

---

## Voice & Messaging

### Brand Voice

**Trusteddit communicates with:**
- **Professional expertise**: We understand C2PA technology
- **Approachable guidance**: We make certification accessible
- **Confident assurance**: We protect your content's integrity
- **Clear transparency**: We explain every step

### Tone Guidelines

**DO:**
- Use active voice: "Trusteddit validates your content"
- Be direct and clear: "Upload your documents to begin"
- Emphasize benefits: "Verifiable provenance builds trust"
- Show expertise: "C2PA-compliant certification process"

**DON'T:**
- Use jargon without explanation
- Make promises you can't keep
- Use overly casual or slang language
- Create confusion with technical terms

### Key Messaging

#### Tagline
> "Trusted Content, Verified Provenance"

#### Elevator Pitch
> Trusteddit is an enterprise C2PA certification platform by SanMarcSoft LLC that empowers content creators and organizations with trusted, verifiable digital provenance through industry-standard C2PA compliance.

#### Value Propositions

1. **For Content Creators**
   - "Protect your creative work with verifiable provenance"
   - "Build trust with your audience through transparent authentication"

2. **For Enterprises**
   - "Enterprise-grade C2PA certification in one platform"
   - "Streamline your path to C2PA compliance"

3. **For CAI Members**
   - "Fellow CAI member, united in restoring trust to digital content"

---

## Do's and Don'ts

### Logo Do's ✅

- ✅ Use the official Trusteddit logo files
- ✅ Maintain minimum clear space (16px)
- ✅ Use on approved background colors
- ✅ Scale proportionally
- ✅ Pair with "TRUSTEDDIT" wordmark in header
- ✅ Link logo to homepage when clickable

### Logo Don'ts ❌

- ❌ Alter logo colors or gradient
- ❌ Distort or stretch logo
- ❌ Add effects (drop shadows, outlines, glows)
- ❌ Place on busy backgrounds without proper contrast
- ❌ Use low-resolution versions
- ❌ Recreate or redraw the logo

### Color Do's ✅

- ✅ Use defined brand colors from palette
- ✅ Check WCAG contrast ratios
- ✅ Use semantic colors for their intended purpose
- ✅ Maintain brand recognition with primary colors
- ✅ Test in both light and dark modes

### Color Don'ts ❌

- ❌ Invent new brand colors
- ❌ Use insufficient contrast
- ❌ Apply semantic colors incorrectly (e.g., red for success)
- ❌ Override theme colors arbitrarily

### Typography Do's ✅

- ✅ Use Inter font family as primary
- ✅ Maintain clear type hierarchy
- ✅ Set appropriate line heights for readability
- ✅ Use semibold (600) for emphasis
- ✅ Uppercase only for labels and short headings

### Typography Don'ts ❌

- ❌ Mix too many font families
- ❌ Use all caps for body text
- ❌ Set text smaller than 14px (except labels)
- ❌ Use pure black (#000000) on pure white
- ❌ **NEVER use Press Start 2P or any 8-bit/pixel fonts in professional interfaces**
- ❌ Use decorative or novelty fonts for UI elements
- ❌ Compromise readability for style

---

## File Naming Conventions

### Logo Files

```
trusteddit_logo.png              # Primary logo
trusteddit_logo@2x.png           # Retina version (2x)
trusteddit_logo_white.png        # Inverse for dark backgrounds
trusteddit_logo_small.png        # Icon size (128x128)
trusteddit_favicon.ico           # Browser favicon
```

### Partner Logos

```
c2pa_logo.svg                    # C2PA vector logo
c2pa_icon.svg                    # C2PA icon only
cai_logo.svg                     # CAI vector logo
cai_badge.png                    # CAI membership badge
```

### General Conventions

- Use lowercase letters
- Separate words with underscores
- Include size descriptor when relevant (`_small`, `_large`, `@2x`)
- Include color variant when relevant (`_white`, `_dark`)
- Use descriptive names (`conformance_explorer_thumbnail.png`)

---

## Export Formats

### Logo Export Specifications

#### Web Usage
- **Format:** PNG with transparency
- **Sizes:**
  - Header: 48x48px (1x), 96x96px (2x)
  - Footer: 40x40px (1x), 80x80px (2x)
  - Icon: 32x32px, 64x64px, 128x128px
- **Optimization:** Use PNG-8 when possible, PNG-24 for gradients
- **Compression:** TinyPNG or ImageOptim

#### Print Usage
- **Format:** Vector (SVG) preferred, high-res PNG (300 DPI) acceptable
- **Minimum Size:** 0.5 inch width
- **Color Profile:** CMYK for print, RGB for digital

#### App Icons
- **iOS:** 180x180px (60pt @3x), 120x120px (60pt @2x)
- **Android:** 192x192px, 512x512px
- **PWA:** 192x192px, 512x512px
- **Favicon:** 32x32px, 16x16px ICO format

### Image Assets Export

#### Marketing Materials
- **Hero Images:** 1920x1080px (16:9), JPEG 85% quality
- **Thumbnails:** 400x300px (4:3), JPEG 80% quality or PNG
- **Social Media:**
  - Open Graph: 1200x630px
  - Twitter Card: 1200x600px
  - LinkedIn: 1200x627px

#### Screenshots & Demos
- **Desktop:** 1920x1080px or actual screen resolution
- **Mobile:** Device resolution (e.g., 390x844 for iPhone 12)
- **Format:** PNG for UI, JPEG for photos

---

## Implementation Checklist

### Header Branding
- [x] Trusteddit logo in header (48x48px)
- [x] "TRUSTEDDIT" text branding
- [x] Tagline: "C2PA CERTIFICATION PLATFORM"
- [x] Clickable logo linking to homepage

### Footer Branding
- [x] Trusteddit logo with company name
- [x] SanMarcSoft LLC attribution
- [x] CAI membership badge
- [x] C2PA conformance explorer link (prominent)
- [x] Partner logo links

### Metadata
- [x] Page title: "Trusteddit - C2PA Certification Platform by SanMarcSoft LLC"
- [x] Meta description with keywords
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] Favicon updated

### Homepage
- [x] Hero section updated with Trusteddit branding
- [x] SanMarcSoft LLC and CAI mention
- [x] C2PA conformance explorer feature section
- [x] Updated feature descriptions
- [x] Professional, trust-building copy

---

## Contact & Resources

### Brand Assets Repository
`/frontend/public/images/logos/`

### Official Resources
- **C2PA:** https://c2pa.org/
- **C2PA Specs:** https://spec.c2pa.org/
- **CAI:** https://contentauthenticity.org/
- **C2PA Conformance Explorer:** https://spec.c2pa.org/conformance-explorer/

### Support
For brand guideline questions or logo asset requests:
- **Company:** SanMarcSoft LLC
- **Platform:** trusteddit.com

---

**Document Version:** 1.0
**Last Review:** November 2025
**Next Review:** Quarterly or upon major brand updates
