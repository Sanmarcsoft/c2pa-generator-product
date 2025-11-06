# User Guide: C2PA Generator Theme System

**Last Updated:** October 23, 2025
**Version:** 2.1.0
**Audience:** End Users

---

## Table of Contents

1. [Introduction](#introduction)
2. [How to Switch Themes](#how-to-switch-themes)
3. [Available Themes](#available-themes)
4. [Theme Comparison](#theme-comparison)
5. [Accessibility Features](#accessibility-features)
6. [Mobile vs Desktop Experience](#mobile-vs-desktop-experience)
7. [Frequently Asked Questions](#frequently-asked-questions)
8. [Troubleshooting](#troubleshooting)

---

## Introduction

The C2PA Generator application offers **four unique visual themes** to personalize your experience. Each theme is carefully designed to provide optimal usability while matching different aesthetic preferences and use cases.

### Why Themes Matter

- **Personalization**: Choose a visual style that matches your preference
- **Accessibility**: Different themes work better for different visual needs
- **Context**: Professional vs casual environments may benefit from different aesthetics
- **Comfort**: Reduce eye strain with the right color scheme for your environment

### Quick Start

To switch themes, click the **theme selector** in the header (usually a paint palette icon or theme dropdown) and choose your preferred theme. Your selection is automatically saved and will persist across sessions.

---

## How to Switch Themes

### Desktop (Web Browser)

1. **Locate the Theme Switcher**
   - Look for the theme selector in the top-right corner of the navigation bar
   - It may appear as a palette icon (🎨) or a dropdown button

2. **Open the Theme Menu**
   - Click on the theme switcher
   - A dropdown menu will appear showing all available themes

3. **Select Your Theme**
   - Click on any theme name to preview and apply it
   - The interface will update immediately
   - Your choice is automatically saved

4. **Verify Your Selection**
   - The currently active theme will be highlighted with a checkmark (✓)
   - Colors and styling will update across the entire application

### Mobile Devices

1. **Access Settings**
   - Tap the menu icon (☰) in the top-left corner
   - Navigate to **Settings** or **Preferences**

2. **Find Theme Options**
   - Look for "Appearance" or "Theme" section
   - Tap to expand theme options

3. **Choose Your Theme**
   - Tap on any theme card to apply it
   - The interface updates immediately
   - Return to the main screen to see your changes

### Keyboard Navigation

For users preferring keyboard controls:

1. Press `Tab` until the theme switcher is focused
2. Press `Enter` or `Space` to open the dropdown
3. Use `↑` and `↓` arrow keys to navigate themes
4. Press `Enter` to select a theme
5. Press `Esc` to close without changing

---

## Available Themes

### 1. 8-Bit Retro (Default)

**When to Use:**
- You appreciate nostalgic, retro aesthetics
- You want a distinctive, memorable interface
- You're working in a creative environment

**Visual Characteristics:**
- **Background**: Pure black (#000000)
- **Primary Colors**: Neon green (#00FF00), cyan (#00FFFF), magenta (#FF00FF)
- **Typography**: "Press Start 2P" pixel font
- **Style**: Atari-inspired vector graphics with glowing effects
- **Border Radius**: Minimal (sharp, pixelated edges)

**Best For:**
- Creative professionals
- Users who value unique aesthetics
- Dark environment work
- Gaming-inspired workflows

**Accessibility Notes:**
- High contrast (neon on black)
- May cause eye strain for extended periods
- Excellent for dark rooms
- Not recommended for users sensitive to bright colors

---

### 2. Modern Minimalist

**When to Use:**
- You prefer clean, professional interfaces
- You need maximum focus on content
- You work in corporate or formal settings

**Visual Characteristics:**
- **Background**: Clean white (#FFFFFF)
- **Primary Colors**: Slate blue (#3B82F6), subtle grays
- **Typography**: "Inter" sans-serif
- **Style**: Generous whitespace, refined interactions, soft shadows
- **Border Radius**: Moderate (6-8px)

**Best For:**
- Business professionals
- Document-heavy workflows
- Well-lit offices
- Users preferring traditional interfaces

**Accessibility Notes:**
- WCAG AA compliant
- Excellent contrast ratios (12.6:1 for primary text)
- Low cognitive load
- Easy on eyes in bright environments
- Ideal for color-blind users (relies on structure, not just color)

---

### 3. Friendly & Approachable

**When to Use:**
- You're new to C2PA certification
- You want a comfortable, welcoming interface
- You value warmth over formality

**Visual Characteristics:**
- **Background**: Warm cream (#FFFBF5)
- **Primary Colors**: Friendly orange (#FB923C), soft blue (#60A5FA)
- **Typography**: "Nunito" rounded sans-serif
- **Style**: Rounded corners (pill shapes), gradients, emoji accents
- **Border Radius**: Generous (16-24px)

**Best For:**
- First-time users
- Educational settings
- Community-focused work
- Users who prefer conversational interfaces

**Accessibility Notes:**
- High readability (generous spacing)
- Emoji provide visual cues (with text alternatives)
- Forgiving error states
- Excellent for touchscreens
- May feel less formal for business use

---

### 4. Tech-Savvy & Trustworthy

**When to Use:**
- You work with technical data frequently
- You prefer dark interfaces for extended use
- You value precision and control

**Visual Characteristics:**
- **Background**: Deep dark blue (#0F1628)
- **Primary Colors**: Electric cyan (#00E5FF), teal (#00FFA3)
- **Typography**: "Space Grotesk" + "JetBrains Mono" for code
- **Style**: Sharp edges, grid patterns, glowing accents, technical aesthetic
- **Border Radius**: Minimal (2-6px)

**Best For:**
- Developers and technical users
- Extended screen time (dark theme reduces eye strain)
- Data-heavy workflows
- Users familiar with command-line interfaces

**Accessibility Notes:**
- WCAG AAA compliant (15.2:1 contrast)
- Excellent for dark environments
- Reduced blue light exposure
- Technical terminology may be less approachable
- High focus states for keyboard navigation

---

## Theme Comparison

| Feature | 8-Bit Retro | Modern Minimalist | Friendly & Approachable | Tech-Savvy |
|---------|-------------|-------------------|------------------------|------------|
| **Environment** | Dark rooms | Offices | Any | Dark rooms |
| **Formality** | Casual | Formal | Casual | Professional |
| **Learning Curve** | Low | Low | Lowest | Medium |
| **Eye Strain** | High (bright) | Low | Low | Very Low |
| **Mobile Friendly** | Good | Excellent | Excellent | Good |
| **Text Size** | Smaller (0.875rem) | Standard (1rem) | Larger (1rem+) | Standard |
| **Color Blindness** | Challenging | Excellent | Good | Excellent |
| **Screen Reader** | Good | Excellent | Excellent | Excellent |
| **Best For** | Creatives | Business | Beginners | Developers |

---

## Accessibility Features

### Across All Themes

#### Keyboard Navigation
- **Full keyboard support**: All interactive elements are keyboard accessible
- **Visible focus indicators**: Clear outlines show where focus is
- **Logical tab order**: Navigate in a predictable sequence
- **Skip links**: Jump to main content quickly

#### Screen Readers
- **ARIA labels**: All interactive elements properly labeled
- **Live regions**: Status updates announced automatically
- **Alt text**: Images and icons have descriptive alternatives
- **Semantic HTML**: Proper heading structure and landmarks

#### Color Contrast
- **WCAG compliance**: All themes meet or exceed AA standards
- **Text legibility**: Minimum 4.5:1 contrast for body text
- **UI components**: Minimum 3:1 contrast for borders and controls

#### Motion & Animation
- **Reduced motion support**: Animations can be disabled
- **Respects system preferences**: `prefers-reduced-motion` honored
- **No auto-playing content**: User controls all animations

### Theme-Specific Accessibility

#### 8-Bit Retro
- High contrast (excellent for low vision)
- May trigger photosensitivity (use caution)
- Pixel font may be harder to read at small sizes

#### Modern Minimalist
- Best overall accessibility
- Excellent for screen magnification
- Clear visual hierarchy

#### Friendly & Approachable
- Generous spacing aids users with motor impairments
- Emoji provide additional context (with text alternatives)
- Large touch targets (48px minimum)

#### Tech-Savvy
- Best for light-sensitive users
- Highest contrast ratios
- Monospace fonts aid code reading but may slow prose reading

---

## Mobile vs Desktop Experience

### Desktop (1024px and wider)

**Common Features:**
- Horizontal navigation bar
- Multi-column layouts
- Hover effects and tooltips
- Keyboard shortcuts available
- Larger content area

**Theme-Specific Differences:**
- **Retro**: Larger pixel art elements, glow effects more prominent
- **Minimalist**: More whitespace, refined shadows
- **Friendly**: Rounded buttons more noticeable, animations subtle
- **Tech-Savvy**: Grid backgrounds visible, technical details shown

### Tablet (768px - 1024px)

**Common Features:**
- Condensed navigation
- 2-column layouts
- Touch-optimized controls
- Simplified hover states

**Theme Adaptations:**
- Font sizes slightly adjusted
- Spacing optimized for touch
- Cards resize responsively
- Navigation may collapse

### Mobile (Below 768px)

**Common Features:**
- **Single column layout**
- **Bottom tab navigation** (optional, theme-dependent)
- **Full-width cards**
- **Larger touch targets (48px minimum)**
- **Swipe gestures** where appropriate

**Theme-Specific Mobile UI:**

**Retro:**
- Hamburger menu with side drawer
- Larger neon buttons
- Simplified glow effects (performance)

**Minimalist:**
- Clean bottom navigation
- Collapsible sections
- Minimal chrome

**Friendly:**
- Bottom tab bar with emoji icons
- Larger, friendlier buttons
- Chat bubbles optimize to 85% width

**Tech-Savvy:**
- Console-style compact interface
- Slide-out technical panel
- Monospace text scales appropriately

---

## Frequently Asked Questions

### General Questions

**Q: Will my theme choice be saved?**
A: Yes! Your theme preference is saved to your browser's localStorage and synced to your account (if logged in). You'll see the same theme when you return.

**Q: Can I switch themes mid-workflow?**
A: Absolutely. Your work is not affected by theme changes. Switch as often as you like without losing progress.

**Q: Do themes affect performance?**
A: Minimal impact. All themes are optimized for smooth performance. The Tech-Savvy theme has some additional effects that may be slightly heavier on older devices.

**Q: Can I customize a theme?**
A: Currently, themes are pre-designed. Custom themes are not supported, but we're considering this for future releases.

---

### Technical Questions

**Q: What happens if JavaScript is disabled?**
A: The default theme (8-Bit Retro) will be applied. Theme switching requires JavaScript.

**Q: Can I use different themes on different devices?**
A: Yes, if you're not logged in. If logged in, your last selection syncs across devices.

**Q: Are themes available in the mobile app?**
A: Yes, the same four themes are available on iOS, Android, and web.

**Q: Do themes work in older browsers?**
A: Themes require modern CSS support. We recommend:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+

---

### Accessibility Questions

**Q: Which theme is best for color blindness?**
A: Modern Minimalist and Tech-Savvy rely least on color alone. They use shape, position, and text labels to convey information.

**Q: Can I disable animations?**
A: Yes. Enable "Reduce Motion" in your operating system settings, and all themes will respect this preference automatically.

**Q: Which theme has the largest text?**
A: Friendly & Approachable has slightly larger default text (1rem body, 1.6 line height). You can also use your browser's zoom feature with any theme.

**Q: Do themes support high contrast mode?**
A: Yes. When your OS is in high contrast mode, themes automatically adjust to provide maximum contrast.

---

### Design Questions

**Q: Why doesn't the Retro theme look "retro" enough on my display?**
A: Modern high-resolution displays can make pixel fonts appear smoother than intended. This is normal and maintains readability.

**Q: Can I suggest a new theme?**
A: Yes! Please visit our GitHub repository and open a feature request describing your ideal theme.

**Q: Why do some themes have rounded corners and others don't?**
A: Border radius is a key design element that communicates personality:
- **Sharp corners** (Retro, Tech-Savvy): Technical, precise
- **Rounded corners** (Minimalist, Friendly): Approachable, soft

---

## Troubleshooting

### Theme Won't Change

**Symptoms:**
- Clicking theme selector does nothing
- Theme dropdown doesn't appear
- Selection doesn't persist

**Solutions:**
1. **Refresh the page** (Ctrl+F5 or Cmd+Shift+R)
2. **Check JavaScript**: Ensure JavaScript is enabled in browser settings
3. **Clear cache**: Browser may be caching old theme files
4. **Check browser console**: Press F12, look for errors in Console tab
5. **Try incognito mode**: Rules out extension conflicts

---

### Theme Looks Broken

**Symptoms:**
- Colors are wrong
- Fonts don't load
- Layout is misaligned

**Solutions:**
1. **Check internet connection**: Theme CSS files may not have loaded
2. **Disable browser extensions**: Ad blockers or privacy tools may interfere
3. **Update browser**: You may be using an unsupported version
4. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
5. **Check for system dark mode conflicts**: Some OS dark modes override website styling

---

### Theme Causes Performance Issues

**Symptoms:**
- Slow animations
- Laggy scrolling
- High CPU usage

**Solutions:**
1. **Try a simpler theme**: Switch to Modern Minimalist (lightest)
2. **Enable reduced motion**: Operating system settings
3. **Close other tabs**: Free up system resources
4. **Update graphics drivers**: Especially for Windows users
5. **Check browser extensions**: Some can impact rendering performance

---

### Theme Not Syncing Across Devices

**Symptoms:**
- Different theme on different devices
- Changes don't persist

**Solutions:**
1. **Verify login**: Theme sync requires an active login
2. **Check account settings**: Ensure theme sync is enabled
3. **Wait a moment**: Sync can take 5-10 seconds
4. **Manually refresh**: Pull down to refresh on mobile
5. **Log out and back in**: Refreshes sync connection

---

### Accessibility Issues

**Symptoms:**
- Can't read text
- Focus is invisible
- Colors are too similar

**Solutions:**
1. **Try a different theme**: Each optimized for different needs
2. **Use browser zoom**: Ctrl + Plus/Minus or pinch to zoom
3. **Enable system accessibility**: High contrast, large text, etc.
4. **Check browser extensions**: Some can enhance accessibility
5. **Contact support**: We want to hear about accessibility barriers

---

## Getting Help

### Support Resources

- **Documentation**: [docs.c2pa-generator.com](https://docs.c2pa-generator.com)
- **GitHub Issues**: [github.com/c2pa-generator/issues](https://github.com/c2pa-generator/issues)
- **Community Forum**: [community.c2pa-generator.com](https://community.c2pa-generator.com)
- **Email Support**: support@c2pa-generator.com

### Reporting Theme Issues

When reporting a theme-related bug, please include:
1. **Current theme name**
2. **Browser and version** (e.g., Chrome 118)
3. **Operating system** (e.g., Windows 11, macOS Sonoma)
4. **Screenshot** (if visual issue)
5. **Steps to reproduce**
6. **Console errors** (F12 → Console tab)

---

## What's Next?

### Upcoming Features

- **Theme preview mode**: Test themes before applying
- **Custom theme builder**: Create your own color schemes
- **Seasonal themes**: Holiday and event-specific themes
- **Theme scheduling**: Automatic switching based on time of day
- **Import/Export themes**: Share themes with team members

### Learn More

- **Developer Guide**: Learn how themes are implemented
- **Contributing Guide**: Help us design new themes
- **API Reference**: Integrate themes into custom workflows

---

**Questions or feedback?** We'd love to hear from you! Open an issue on GitHub or contact our support team.

