# Admin Quick Reference Card
**C2PA Generator Product - Theme System Administration**

**Version:** 2.1.0 | **Last Updated:** October 23, 2025

---

## Quick Access

- **Admin Panel:** `/admin`
- **Admin Guide:** `/admin/guide`
- **Settings Page:** `/settings`
- **User Profile:** `/profile`

---

## Common Admin Tasks

### 1. View Theme Usage Statistics

```sql
SELECT
  theme_preference,
  COUNT(*) as user_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentage
FROM users
WHERE theme_preference IS NOT NULL
GROUP BY theme_preference
ORDER BY user_count DESC;
```

### 2. Reset User's Theme

```sql
UPDATE users
SET theme_preference = 'retro'
WHERE id = [USER_ID];
```

### 3. Set Default Theme

Edit `/frontend/src/contexts/ThemeContext.jsx`:
```javascript
const DEFAULT_THEME = THEMES.RETRO; // Change to desired theme
```

Options: `RETRO`, `MODERN_MINIMALIST`, `FRIENDLY_APPROACHABLE`, `TECH_SAVVY`

### 4. Bulk Theme Update

```sql
-- Set all admins to Tech-Savvy theme
UPDATE users
SET theme_preference = 'tech-savvy-trustworthy'
WHERE role = 'admin';
```

---

## API Endpoints

### Get User Theme
```
GET /api/user/theme
Authorization: Bearer <token>

Response: { "success": true, "theme": "retro" }
```

### Update User Theme
```
PUT /api/user/theme
Authorization: Bearer <token>
Content-Type: application/json

Body: { "theme": "modern-minimalist" }
Response: { "success": true }
```

### List Users (Admin)
```
GET /api/admin/users
Authorization: Bearer <admin-token>

Response: { "success": true, "users": [...] }
```

---

## Available Themes

| Theme Key | Name | Icon | Best For |
|-----------|------|------|----------|
| `retro` | 8-Bit Retro | 🕹️ | Creatives, dark rooms |
| `modern-minimalist` | Modern Minimalist | ✨ | Business, offices |
| `friendly-approachable` | Friendly & Approachable | 😊 | Beginners, educators |
| `tech-savvy-trustworthy` | Tech-Savvy & Trustworthy | ⚡ | Developers, extended use |

---

## Troubleshooting Checklist

### Theme Not Applying

1. ☐ Check `data-theme` attribute on `<html>` element
   ```javascript
   // Browser console
   document.documentElement.getAttribute('data-theme')
   ```

2. ☐ Verify CSS files loaded (Network tab → Filter CSS)

3. ☐ Clear cache: Ctrl+Shift+R (Win) / Cmd+Shift+R (Mac)

4. ☐ Check localStorage:
   ```javascript
   localStorage.getItem('app_theme')
   ```

5. ☐ Verify theme CSS imported in App.jsx

### Visual Issues

1. ☐ Ask user for browser & version
2. ☐ Suggest alternative theme
3. ☐ Check OS settings (high contrast, dark mode)
4. ☐ Verify zoom level is 100%

### Performance Issues

1. ☐ Switch to Modern Minimalist (lightest)
2. ☐ Enable reduced motion (OS settings)
3. ☐ Check for browser extensions conflicts
4. ☐ Update graphics drivers

---

## Emergency Procedures

### Theme System Down

```bash
# Force default theme for all users
UPDATE users SET theme_preference = 'retro';

# Restart frontend service
docker-compose restart frontend
```

### CSS Files Corrupted

```bash
cd frontend/src/styles/themes/
git checkout HEAD -- *.css
npm run build
docker-compose restart frontend
```

### Database Issues

```bash
# Check integrity
sqlite3 database.db "PRAGMA integrity_check;"

# Reset invalid themes
UPDATE users
SET theme_preference = NULL
WHERE theme_preference NOT IN (
  'retro',
  'modern-minimalist',
  'friendly-approachable',
  'tech-savvy-trustworthy'
);
```

---

## File Locations

### Frontend
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
│       ├── modernMinimalist.css  # Modern Minimalist
│       ├── friendlyApproachable.css
│       └── techSavvy.css         # Tech-Savvy
└── pages/
    ├── AdminPage.jsx             # Admin panel
    ├── AdminGuidePage.jsx        # Admin guide
    └── SettingsPage.jsx          # User settings
```

### Documentation
```
docs/
├── THEME_SYSTEM.md              # Technical overview
├── DEVELOPER_GUIDE_THEMES.md    # Developer guide
├── USER_GUIDE_THEMES.md         # User documentation
├── API_REFERENCE_THEMES.md      # API reference
└── ADMIN_QUICK_REFERENCE.md     # This file
```

---

## Performance Metrics

| Metric | Target | Concern If |
|--------|--------|------------|
| Theme Switch Time | < 50ms | > 100ms |
| CSS Load Time | < 200ms | > 500ms |
| localStorage Access | < 10ms | > 50ms |
| API Sync Time | < 500ms | > 2000ms |

### Test Performance

```javascript
// Run in browser console
console.time('theme-switch');
document.documentElement.setAttribute('data-theme', 'modern-minimalist');
console.timeEnd('theme-switch');
// Should log < 50ms
```

---

## Browser Support

### Minimum Versions
- **Chrome/Edge:** 90+
- **Firefox:** 88+
- **Safari:** 14+
- **iOS Safari:** 14+

### Check CSS Variables Support
```javascript
// Browser console
console.log(CSS.supports('color', 'var(--test)'));
// Should return: true
```

---

## User Support Scripts

### Script 1: How to Switch Themes
```
"Let's switch your theme together. In the top navigation bar,
look for the theme selector icon (🕹️ or 🎨). Click it to open
the menu, then select your preferred theme. The page will update
immediately."
```

### Script 2: Theme Not Persisting
```
"Let's try refreshing your theme preference. First, make sure
you're logged in. Then select your theme again. If it still
doesn't persist, try clearing your browser cache:
Settings → Privacy → Clear browsing data → Cached files."
```

### Script 3: Visual Issues
```
"I recommend trying a different theme that might work better for
your needs. For bright environments, try Modern Minimalist. For
dark environments, try Tech-Savvy & Trustworthy. Which would you
like to try?"
```

---

## Database Schema

```sql
-- users table (relevant columns)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  theme_preference TEXT DEFAULT NULL,  -- Theme key
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- Index for theme queries
CREATE INDEX idx_users_theme ON users(theme_preference);
```

---

## Backup Commands

### Export Theme Preferences
```bash
sqlite3 database.db <<EOF
.headers on
.mode csv
.output theme_backup_$(date +%Y%m%d).csv
SELECT id, email, theme_preference, updated_at
FROM users
WHERE theme_preference IS NOT NULL;
.quit
EOF
```

### Restore from Backup
```bash
sqlite3 database.db <<EOF
.mode csv
.import theme_backup_20251023.csv temp_theme_restore
UPDATE users
SET theme_preference = temp_theme_restore.theme_preference
FROM temp_theme_restore
WHERE users.id = temp_theme_restore.id;
DROP TABLE temp_theme_restore;
.quit
EOF
```

---

## Console Diagnostics

### Check Current Theme
```javascript
console.log('Current Theme:', document.documentElement.getAttribute('data-theme'));
console.log('localStorage:', localStorage.getItem('app_theme'));
```

### Theme Info Object
```javascript
console.log('Theme Info:', {
  currentTheme: document.documentElement.getAttribute('data-theme'),
  localStorage: localStorage.getItem('app_theme'),
  userAgent: navigator.userAgent,
  cssSupport: CSS.supports('color', 'var(--test)')
});
```

### Performance Test
```javascript
async function testAllThemes() {
  const themes = ['retro', 'modern-minimalist', 'friendly-approachable', 'tech-savvy-trustworthy'];
  const results = [];

  for (const theme of themes) {
    const start = performance.now();
    document.documentElement.setAttribute('data-theme', theme);
    const end = performance.now();
    results.push({ theme, time: (end - start).toFixed(2) + 'ms' });
  }

  console.table(results);
  const avg = results.reduce((sum, r) => sum + parseFloat(r.time), 0) / results.length;
  console.log('Average:', avg.toFixed(2) + 'ms');
}

testAllThemes();
```

---

## Escalation Levels

### Level 1: Basic Support
- Theme won't switch
- Visual preferences
- How to find theme selector

**Action:** Follow user support scripts above

### Level 2: Technical Support
- Persistent issues after cache clear
- Theme not syncing across devices
- Database-level corruption

**Action:** Escalate to backend admin for database check

### Level 3: Development Team
- Browser compatibility bugs
- CSS rendering issues
- Performance problems

**Action:** Create GitHub issue with full diagnostic info

---

## Contact Information

- **Frontend Team Lead:** [Insert contact]
- **Backend Team Lead:** [Insert contact]
- **DevOps On-Call:** [Insert contact]
- **Product Manager:** [Insert contact]

---

## Quick Links

- **Full Admin Guide:** [/admin/guide](/admin/guide)
- **Theme System Documentation:** [/docs/THEME_SYSTEM.md](/docs/THEME_SYSTEM.md)
- **User Guide:** [/docs/USER_GUIDE_THEMES.md](/docs/USER_GUIDE_THEMES.md)
- **Developer Guide:** [/docs/DEVELOPER_GUIDE_THEMES.md](/docs/DEVELOPER_GUIDE_THEMES.md)
- **GitHub Repository:** https://github.com/c2pa-generator

---

**🖨️ Print this page for quick desk reference**

**Last Updated:** October 23, 2025 | **Version:** 2.1.0
