# Theme Customization - Quick Reference

**Last Updated:** 2025-11-03

---

## For Users

### Default Appearance
- **Theme:** Tech-Savvy & Trustworthy (dark professional with electric accents)
- **Mode:** System (automatically follows your device's dark/light mode setting)

### Customizing Your Theme

1. Click **Settings** in the navigation
2. Scroll to **Appearance Settings**
3. Choose your preferred theme from the button group
4. Choose your appearance mode:
   - **☀️ Light** - Always light appearance
   - **🌙 Dark** - Always dark appearance
   - **💻 System** - Follows your device settings (recommended)

### Your Preferences Are Saved
- Changes apply immediately
- Preferences sync across devices (if logged in)
- Persists after logout/login

---

## For Developers

### Quick Start

**Change default theme:**
```javascript
// frontend/src/contexts/ThemeContext.jsx
const DEFAULT_THEME = THEMES.TECH_SAVVY; // or any other theme
```

**Using theme context:**
```jsx
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { currentTheme, themeMode, changeTheme, changeThemeMode } = useTheme();

  return (
    <div>
      <p>Current theme: {currentTheme}</p>
      <p>Current mode: {themeMode}</p>
      <button onClick={() => changeTheme('modern-minimalist')}>
        Modern Theme
      </button>
      <button onClick={() => changeThemeMode('dark')}>
        Dark Mode
      </button>
    </div>
  );
}
```

**Using ThemeModeSwitcher:**
```jsx
import ThemeModeSwitcher from '../components/themed/ThemeModeSwitcher';

// Compact (for headers)
<ThemeModeSwitcher variant="compact" showLabel={false} />

// Buttons (for settings)
<ThemeModeSwitcher variant="buttons" showLabel={true} />

// Dropdown (minimal)
<ThemeModeSwitcher variant="dropdown" showLabel={true} />
```

### API Endpoints

**Get user theme:**
```bash
GET /api/user/theme
Authorization: Bearer YOUR_TOKEN

Response:
{
  "success": true,
  "theme": "tech-savvy-trustworthy",
  "themeMode": "system"
}
```

**Update user theme:**
```bash
PUT /api/user/theme
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "theme": "modern-minimalist",  // Optional
  "themeMode": "dark"             // Optional
}

Response:
{
  "success": true,
  "theme": "modern-minimalist",
  "themeMode": "dark"
}
```

### Database

**Schema:**
```sql
users table:
  theme TEXT DEFAULT 'tech-savvy-trustworthy'
  theme_mode TEXT DEFAULT 'system'
```

**Query user preferences:**
```sql
SELECT theme, theme_mode FROM users WHERE id = ?;
```

### CSS Styling

**Target specific themes:**
```css
/* All themes get this */
.my-component { }

/* Only Tech-Savvy theme */
[data-theme="tech-savvy-trustworthy"] .my-component { }

/* Only dark mode */
[data-mode="dark"] .my-component { }

/* Tech-Savvy theme in dark mode */
[data-theme="tech-savvy-trustworthy"][data-mode="dark"] .my-component { }
```

**Body classes available:**
```css
body.theme-tech-savvy-trustworthy { }
body.mode-dark { }
body.theme-tech-savvy-trustworthy.mode-dark { }
```

### Available Themes

| Theme ID | Name | Description |
|----------|------|-------------|
| `elegant` | Elegant | Apple/Braun-inspired minimal design |
| `retro` | 8-Bit Retro | Classic Atari style with neon colors |
| `modern-minimalist` | Modern Minimalist | Clean with generous whitespace |
| `friendly-approachable` | Friendly & Approachable | Warm and inviting soft colors |
| `tech-savvy-trustworthy` | Tech-Savvy & Trustworthy | **Default** - Dark professional with electric accents |

### Available Modes

| Mode ID | Name | Behavior |
|---------|------|----------|
| `light` | Light | Always light appearance |
| `dark` | Dark | Always dark appearance |
| `system` | System | **Default** - Follows OS dark mode setting |

---

## Common Tasks

### Adding a New Theme

1. Create theme file: `frontend/src/themes/my-theme.js`
2. Add theme ID to `THEMES` in `ThemeContext.jsx`
3. Add theme name to `getThemeName()` function
4. Add preview to `ThemeSwitcher.jsx` (optional)
5. Create CSS: `frontend/src/styles/themes/my-theme.css`

### Testing Theme Changes

```javascript
// In browser console:
localStorage.setItem('app_theme', 'modern-minimalist');
localStorage.setItem('app_theme_mode', 'dark');
location.reload();
```

### Resetting to Defaults

```javascript
// In browser console:
localStorage.removeItem('app_theme');
localStorage.removeItem('app_theme_mode');
location.reload();
```

---

## Troubleshooting

### Theme Not Changing
1. Check browser console for errors
2. Verify user is authenticated (for server sync)
3. Clear localStorage and reload
4. Check network tab for API errors

### System Mode Not Working
1. Verify browser supports `matchMedia`
2. Check OS has dark mode enabled
3. Try setting mode explicitly to light or dark
4. Check browser console for theme change events

### Database Issues
```bash
# Check if columns exist
sqlite3 /path/to/app.db "PRAGMA table_info(users);"

# Check user's theme
sqlite3 /path/to/app.db "SELECT theme, theme_mode FROM users WHERE email='user@example.com';"
```

### Docker Database Location
Database is stored in Docker volume, not local `data/` directory:
```bash
docker volume inspect c2pa-generator-product_c2pa-data
```

---

## Testing Checklist

- [ ] Default theme is Tech-Savvy & Trustworthy
- [ ] Default mode is System
- [ ] Theme persists after reload
- [ ] Mode persists after reload
- [ ] System mode follows OS dark mode toggle
- [ ] Settings page shows theme and mode switchers
- [ ] API endpoints work (authenticated users)
- [ ] Theme changes are immediate
- [ ] No console errors
- [ ] Mobile responsive

---

## Support

**Documentation:**
- Implementation: `.claude/THEME_CUSTOMIZATION_IMPLEMENTATION.md`
- This guide: `.claude/THEME_QUICK_REFERENCE.md`

**Key Files:**
- Context: `frontend/src/contexts/ThemeContext.jsx`
- API: `backend/src/routes/user.js`
- UI: `frontend/src/components/themed/ThemeModeSwitcher.jsx`
- Settings: `frontend/src/pages/SettingsPage.jsx`

**Database:**
- Migration: `backend/src/models/database.js` (lines 279-295)
- Table: `users` (columns: `theme`, `theme_mode`)

---

**Status:** ✅ Fully Implemented
**Version:** 1.0.0
**Date:** 2025-11-03
