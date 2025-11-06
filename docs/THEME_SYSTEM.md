# Theme System Implementation

## Overview

The C2PA Generator Product now includes a complete theming system with four distinct visual themes:

1. **8-Bit Retro** (Default) - Classic Atari-style interface with neon colors
2. **Modern Minimalist** - Clean, sophisticated with generous whitespace
3. **Friendly & Approachable** - Warm and inviting with soft colors
4. **Tech-Savvy & Trustworthy** - Dark professional with electric accents

## Architecture

### Core Components

#### 1. ThemeContext (`/frontend/src/contexts/ThemeContext.jsx`)
- Manages global theme state
- Provides theme switching functionality
- Persists theme preference to localStorage
- Syncs with backend API for authenticated users
- Applies theme via `data-theme` attribute on document root

#### 2. Theme CSS Files (`/frontend/src/styles/themes/`)
- `retro.css` - 8-Bit Retro theme
- `modernMinimalist.css` - Modern Minimalist theme
- `friendlyApproachable.css` - Friendly & Approachable theme
- `techSavvy.css` - Tech-Savvy & Trustworthy theme

Each theme file defines CSS custom properties (CSS variables) scoped to `[data-theme="theme-name"]`

#### 3. ThemeSwitcher Component (`/frontend/src/components/themed/ThemeSwitcher.jsx`)
- Provides UI for theme selection
- Three variants: `dropdown`, `buttons`, `compact`
- Shows theme previews with color swatches
- Includes theme descriptions and icons

### Theme Application Flow

```
User selects theme
    ↓
ThemeContext.changeTheme(themeKey)
    ↓
State updated → currentTheme = newTheme
    ↓
useEffect triggered
    ↓
document.documentElement.setAttribute('data-theme', themeKey)
    ↓
CSS applies theme-specific variables
    ↓
localStorage.setItem('app_theme', themeKey)
    ↓
API sync (if authenticated)
```

## Usage

### Using ThemeContext in Components

```jsx
import { useTheme } from '../../contexts/ThemeContext';

function MyComponent() {
  const { currentTheme, changeTheme, getThemeName, themes } = useTheme();

  return (
    <div>
      <p>Current theme: {getThemeName(currentTheme)}</p>
      <button onClick={() => changeTheme(themes.MODERN_MINIMALIST)}>
        Switch to Modern
      </button>
    </div>
  );
}
```

### Using ThemeSwitcher Component

#### Dropdown Variant (Default)
```jsx
<ThemeSwitcher variant="dropdown" showPreview={true} />
```

#### Button Group Variant
```jsx
<ThemeSwitcher variant="buttons" showPreview={true} />
```

#### Compact Variant (Icon Only)
```jsx
<ThemeSwitcher variant="compact" />
```

### Writing Theme-Aware CSS

Use CSS custom properties that are defined in theme files:

```css
.my-component {
  background: var(--background-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-family: var(--font-primary);
  font-size: var(--text-base);
  padding: var(--space-4);
}

.my-button {
  background: var(--accent-blue);
  color: var(--text-on-color, #fff);
  box-shadow: var(--box-shadow-md);
  transition: all var(--transition-normal);
}
```

### Theme-Specific Overrides

If you need theme-specific styling:

```css
/* Default styles */
.my-element {
  background: var(--background-primary);
}

/* Retro theme override */
[data-theme="retro"] .my-element {
  background: var(--background-black);
  border: 2px solid var(--neon-green);
  box-shadow: var(--glow-green);
}

/* Modern theme override */
[data-theme="modern-minimalist"] .my-element {
  background: var(--background-secondary);
  box-shadow: var(--box-shadow-sm);
}
```

## Theme Variables Reference

### Common Variables Across All Themes

All themes provide these standard variables:

#### Colors
- `--background-primary` - Main background color
- `--background-secondary` - Secondary background
- `--background-tertiary` - Tertiary background
- `--text-primary` - Main text color
- `--text-secondary` - Secondary text
- `--text-tertiary` - Tertiary/muted text
- `--border-color` - Border color
- `--accent-blue` - Primary accent
- `--accent-green` - Success/positive
- `--accent-yellow` - Warning
- `--accent-red` - Error/danger

#### Typography
- `--font-primary` - Primary font family
- `--font-code` - Code/monospace font
- `--text-display` - Display text size
- `--text-h1` through `--text-h5` - Heading sizes
- `--text-base` - Body text size
- `--text-sm` - Small text size
- `--text-xs` - Extra small text
- `--weight-regular`, `--weight-medium`, `--weight-bold` - Font weights
- `--leading-tight`, `--leading-normal`, `--leading-relaxed` - Line heights

#### Spacing
- `--space-0` through `--space-24` - Spacing scale
- `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl` - Compat

#### Borders & Radius
- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`, `--radius-full`

#### Shadows
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- `--box-shadow-sm`, `--box-shadow-md`, `--box-shadow-lg`

#### Transitions
- `--transition-fast` - 150ms
- `--transition-normal` - 200-300ms
- `--transition-slow` - 400-500ms

## Adding a New Theme

To add a new theme:

1. **Create Theme CSS File**
   ```bash
   touch frontend/src/styles/themes/my-new-theme.css
   ```

2. **Define Theme Variables**
   ```css
   [data-theme="my-new-theme"] {
     --background-primary: #FFFFFF;
     --text-primary: #000000;
     /* ... define all standard variables ... */
   }
   ```

3. **Add Theme to ThemeContext**
   ```javascript
   // In ThemeContext.jsx
   export const THEMES = {
     RETRO: 'retro',
     MODERN_MINIMALIST: 'modern-minimalist',
     FRIENDLY_APPROACHABLE: 'friendly-approachable',
     TECH_SAVVY: 'tech-savvy-trustworthy',
     MY_NEW_THEME: 'my-new-theme', // Add this
   };
   ```

4. **Import in App.jsx**
   ```javascript
   import './styles/themes/my-new-theme.css';
   ```

5. **Add Preview to ThemeSwitcher**
   ```javascript
   // In ThemeSwitcher.jsx
   const THEME_PREVIEWS = {
     // ...
     [THEMES.MY_NEW_THEME]: {
       icon: '🎨',
       colors: ['#color1', '#color2', '#color3'],
       description: 'Description of the theme'
     }
   };
   ```

6. **Update getThemeName function**
   ```javascript
   // In ThemeContext.jsx
   const getThemeName = (themeId) => {
     const names = {
       // ...
       [THEMES.MY_NEW_THEME]: 'My New Theme',
     };
     return names[themeId] || themeId;
   };
   ```

## Testing Themes

1. Navigate to Settings → Appearance
2. Select different themes using the theme switcher
3. Verify theme persists after page refresh
4. Test theme switching with authenticated user
5. Verify all components render correctly in each theme

## Best Practices

### CSS Custom Properties
- Always use CSS custom properties instead of hardcoded values
- Provide fallback values: `var(--text-primary, #000)`
- Keep variable names semantic, not specific to colors

### Theme Compatibility
- Test all components in all themes
- Avoid theme-specific logic in JavaScript
- Use CSS for theme-specific styling
- Ensure sufficient color contrast for accessibility

### Performance
- Theme CSS files are loaded once on app init
- Theme switching uses CSS only (no re-render needed)
- Theme preference cached in localStorage
- Minimal JavaScript overhead

## Accessibility

All themes maintain WCAG 2.1 AA compliance:
- Text contrast ratios meet minimum standards
- Focus states visible in all themes
- Color is not the only visual indicator
- Themes tested with screen readers

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- CSS custom properties required

## Files Structure

```
frontend/src/
├── contexts/
│   └── ThemeContext.jsx          # Theme state management
├── components/
│   └── themed/
│       ├── ThemeSwitcher.jsx     # Theme selection UI
│       └── ThemeSwitcher.css     # ThemeSwitcher styles
├── styles/
│   └── themes/
│       ├── retro.css             # 8-Bit Retro theme
│       ├── modernMinimalist.css  # Modern Minimalist theme
│       ├── friendlyApproachable.css # Friendly theme
│       └── techSavvy.css         # Tech-Savvy theme
└── pages/
    └── SettingsPage.jsx          # Includes ThemeSwitcher
```

## API Endpoints

The theme system integrates with backend APIs:

### GET /api/user/theme
Fetch user's saved theme preference
- Auth: Required
- Response: `{ theme: 'theme-key' }`

### PUT /api/user/theme
Save user's theme preference
- Auth: Required
- Body: `{ theme: 'theme-key' }`
- Response: `{ success: true }`

## Future Enhancements

Potential improvements for the theme system:

1. **Dark Mode Toggle** - Quick toggle between light/dark variants
2. **Custom Themes** - Allow users to create custom color schemes
3. **Theme Preview** - Live preview before applying
4. **System Preference** - Auto-detect OS dark mode preference
5. **Per-Page Themes** - Different themes for different sections
6. **Theme Animations** - Smooth color transitions during theme switch
7. **Theme Export/Import** - Share theme configurations
8. **A11y Mode** - High contrast theme for accessibility

## Troubleshooting

### Theme not applying
- Check `data-theme` attribute on `<html>` element
- Verify theme CSS file is imported in App.jsx
- Check browser console for CSS errors
- Clear localStorage and try again

### Colors not changing
- Verify CSS custom properties are defined in theme file
- Check variable names match between theme and component CSS
- Ensure proper `[data-theme="..."]` selector

### Theme not persisting
- Check localStorage for `app_theme` key
- Verify ThemeProvider wraps entire app
- Check browser console for errors

## Support

For issues or questions about the theme system:
- Check design specs in `/docs/designs/`
- Review theme CSS files in `/frontend/src/styles/themes/`
- Contact: development team

---

**Last Updated:** 2025-10-23
**Version:** 1.0.0
**Author:** Claude Code (Frontend Developer Agent)
