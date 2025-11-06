/**
 * AdminGuidePage Component
 *
 * Comprehensive administrator guide for the C2PA Generator Product theme system.
 * Provides documentation, troubleshooting, and best practices for theme management.
 */

import { Link } from 'react-router-dom';
import './AdminGuidePage.css';

const AdminGuidePage = () => {
  return (
    <div className="admin-guide-page">
      <div className="admin-guide-header no-print">
        <Link to="/admin" className="back-link">← Back to Admin Panel</Link>
        <button onClick={() => window.print()} className="print-button">
          🖨️ Print Guide
        </button>
      </div>

      <div className="admin-guide-content">
        <header className="guide-title-section">
          <h1 className="guide-title">Theme System Administration Guide</h1>
          <p className="guide-subtitle">C2PA Generator Product - Administrator Reference</p>
          <div className="guide-meta">
            <span>Version 2.1.0</span>
            <span>•</span>
            <span>Last Updated: October 23, 2025</span>
          </div>
        </header>

        {/* Table of Contents */}
        <nav className="toc">
          <h2>Table of Contents</h2>
          <ol>
            <li><a href="#overview">Theme System Overview</a></li>
            <li><a href="#managing-users">Managing User Themes</a></li>
            <li><a href="#configuration">Theme Configuration</a></li>
            <li><a href="#troubleshooting">Troubleshooting</a></li>
            <li><a href="#user-support">User Support</a></li>
            <li><a href="#technical-reference">Technical Reference</a></li>
            <li><a href="#monitoring">Monitoring and Analytics</a></li>
            <li><a href="#emergency">Emergency Procedures</a></li>
          </ol>
        </nav>

        {/* Section 1: Overview */}
        <section id="overview" className="guide-section">
          <h2>1. Theme System Overview</h2>

          <div className="subsection">
            <h3>What is the Theme System?</h3>
            <p>
              The C2PA Generator Product theme system provides users with four distinct visual themes
              to personalize their experience. Each theme is built using CSS custom properties (CSS variables)
              and applied via a <code>data-theme</code> attribute on the document root.
            </p>
          </div>

          <div className="subsection">
            <h3>Available Themes</h3>
            <div className="theme-grid">
              <div className="theme-card">
                <div className="theme-card-icon">🕹️</div>
                <h4>8-Bit Retro (Default)</h4>
                <p>Classic Atari-style interface with neon colors and pixel fonts.</p>
                <div className="theme-colors">
                  <span style={{backgroundColor: '#00FF00'}}></span>
                  <span style={{backgroundColor: '#00FFFF'}}></span>
                  <span style={{backgroundColor: '#FF00FF'}}></span>
                </div>
              </div>

              <div className="theme-card">
                <div className="theme-card-icon">✨</div>
                <h4>Modern Minimalist</h4>
                <p>Clean, sophisticated design with generous whitespace.</p>
                <div className="theme-colors">
                  <span style={{backgroundColor: '#3B82F6'}}></span>
                  <span style={{backgroundColor: '#64748B'}}></span>
                  <span style={{backgroundColor: '#FFFFFF'}}></span>
                </div>
              </div>

              <div className="theme-card">
                <div className="theme-card-icon">😊</div>
                <h4>Friendly & Approachable</h4>
                <p>Warm and inviting with soft colors and rounded corners.</p>
                <div className="theme-colors">
                  <span style={{backgroundColor: '#FB923C'}}></span>
                  <span style={{backgroundColor: '#60A5FA'}}></span>
                  <span style={{backgroundColor: '#FFFBF5'}}></span>
                </div>
              </div>

              <div className="theme-card">
                <div className="theme-card-icon">⚡</div>
                <h4>Tech-Savvy & Trustworthy</h4>
                <p>Dark professional theme with electric accents.</p>
                <div className="theme-colors">
                  <span style={{backgroundColor: '#00E5FF'}}></span>
                  <span style={{backgroundColor: '#0F1628'}}></span>
                  <span style={{backgroundColor: '#00FFA3'}}></span>
                </div>
              </div>
            </div>
          </div>

          <div className="subsection">
            <h3>How Themes Work</h3>
            <div className="info-box">
              <strong>Technical Implementation:</strong>
              <ul>
                <li><strong>CSS Custom Properties:</strong> All theme colors and styles use CSS variables</li>
                <li><strong>Data Attributes:</strong> Themes applied via <code>data-theme</code> attribute</li>
                <li><strong>localStorage:</strong> Theme preferences cached locally for fast loading</li>
                <li><strong>Database Sync:</strong> Authenticated users' preferences synced to backend</li>
                <li><strong>Real-time Switching:</strong> No page reload required to change themes</li>
              </ul>
            </div>
          </div>

          <div className="subsection">
            <h3>Theme Persistence Flow</h3>
            <div className="code-block">
              <pre>{`1. User selects theme in UI
2. ThemeContext updates state
3. data-theme attribute set on document root
4. CSS variables applied instantly
5. localStorage updated (cache)
6. API call syncs to database (if authenticated)
7. Theme persists across sessions and devices`}</pre>
            </div>
          </div>
        </section>

        {/* Section 2: Managing User Themes */}
        <section id="managing-users" className="guide-section">
          <h2>2. Managing User Themes</h2>

          <div className="subsection">
            <h3>Viewing User Theme Preferences</h3>
            <p>To see which themes users are using, you can query the database directly:</p>

            <div className="code-block">
              <strong>SQL Query - Theme Usage Statistics:</strong>
              <pre>{`SELECT
  theme_preference,
  COUNT(*) as user_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentage
FROM users
WHERE theme_preference IS NOT NULL
GROUP BY theme_preference
ORDER BY user_count DESC;`}</pre>
            </div>

            <div className="code-block">
              <strong>SQL Query - Users by Theme:</strong>
              <pre>{`SELECT
  id,
  email,
  name,
  theme_preference,
  last_login
FROM users
WHERE theme_preference = 'retro'  -- or 'modern-minimalist', etc.
ORDER BY last_login DESC;`}</pre>
            </div>
          </div>

          <div className="subsection">
            <h3>Resetting a User's Theme Preference</h3>
            <p>To reset a specific user to the default theme:</p>

            <div className="code-block">
              <strong>SQL Query:</strong>
              <pre>{`UPDATE users
SET theme_preference = 'retro'
WHERE id = 123;  -- Replace with actual user ID`}</pre>
            </div>

            <div className="warning-box">
              <strong>⚠️ Important:</strong> The user will see the change on their next login or page refresh.
              Their localStorage cache will be updated when they next authenticate.
            </div>
          </div>

          <div className="subsection">
            <h3>Setting Default Theme for New Users</h3>
            <p>The default theme is defined in the ThemeContext. To change it:</p>

            <div className="code-block">
              <strong>File:</strong> <code>/frontend/src/contexts/ThemeContext.jsx</code>
              <pre>{`// Line ~15-20
const DEFAULT_THEME = THEMES.RETRO;  // Change this value

// Options:
// THEMES.RETRO
// THEMES.MODERN_MINIMALIST
// THEMES.FRIENDLY_APPROACHABLE
// THEMES.TECH_SAVVY`}</pre>
            </div>

            <div className="tip-box">
              <strong>💡 Tip:</strong> After changing the default, restart the frontend development server
              or rebuild the production bundle for changes to take effect.
            </div>
          </div>

          <div className="subsection">
            <h3>Bulk Theme Updates</h3>
            <p>To update themes for multiple users at once:</p>

            <div className="code-block">
              <strong>Example: Set all users created before a date to Modern Minimalist:</strong>
              <pre>{`UPDATE users
SET theme_preference = 'modern-minimalist'
WHERE created_at < '2025-01-01'
  AND theme_preference IS NULL;`}</pre>
            </div>

            <div className="code-block">
              <strong>Example: Set all admin users to Tech-Savvy theme:</strong>
              <pre>{`UPDATE users
SET theme_preference = 'tech-savvy-trustworthy'
WHERE role = 'admin';`}</pre>
            </div>
          </div>
        </section>

        {/* Section 3: Configuration */}
        <section id="configuration" className="guide-section">
          <h2>3. Theme Configuration</h2>

          <div className="subsection">
            <h3>System Requirements</h3>
            <div className="info-box">
              <ul>
                <li><strong>Browser Support:</strong> Chrome 90+, Firefox 88+, Safari 14+</li>
                <li><strong>JavaScript:</strong> Required for theme switching</li>
                <li><strong>CSS Custom Properties:</strong> Must be supported</li>
                <li><strong>localStorage:</strong> Required for persistence</li>
              </ul>
            </div>
          </div>

          <div className="subsection">
            <h3>Theme File Locations</h3>
            <div className="code-block">
              <pre>{`frontend/src/
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
│       ├── friendlyApproachable.css # Friendly theme
│       └── techSavvy.css         # Tech-Savvy theme
└── pages/
    └── SettingsPage.jsx          # User theme settings`}</pre>
            </div>
          </div>

          <div className="subsection">
            <h3>GitHub Token Integration</h3>
            <p>
              Theme preferences are user-specific and not affected by GitHub token configuration.
              However, if you need to verify theme sync is working with the backend:
            </p>

            <div className="code-block">
              <strong>Test API Endpoint:</strong>
              <pre>{`# Get user's theme
GET /api/user/theme
Authorization: Bearer <token>

# Set user's theme
PUT /api/user/theme
Authorization: Bearer <token>
Content-Type: application/json

{
  "theme": "modern-minimalist"
}`}</pre>
            </div>
          </div>

          <div className="subsection">
            <h3>Performance Monitoring</h3>
            <p>Monitor theme switching performance in browser DevTools:</p>

            <div className="code-block">
              <pre>{`// Browser Console Commands

// Check current theme
document.documentElement.getAttribute('data-theme')

// Check localStorage cache
localStorage.getItem('app_theme')

// Performance: Measure theme switch time
console.time('theme-switch');
// ... switch theme ...
console.timeEnd('theme-switch');
// Should be < 50ms`}</pre>
            </div>

            <div className="tip-box">
              <strong>💡 Performance Tip:</strong> Theme switching should be instant. If users report
              delays, check for CSS conflicts or excessive JavaScript in theme change handlers.
            </div>
          </div>
        </section>

        {/* Section 4: Troubleshooting */}
        <section id="troubleshooting" className="guide-section">
          <h2>4. Troubleshooting</h2>

          <div className="subsection">
            <h3>Problem: Theme Not Applying</h3>

            <div className="troubleshooting-step">
              <strong>Symptoms:</strong>
              <ul>
                <li>Theme selector shows one theme but UI shows another</li>
                <li>Default theme always loads regardless of selection</li>
              </ul>
            </div>

            <div className="troubleshooting-step">
              <strong>Diagnostic Steps:</strong>
              <ol>
                <li>
                  <strong>Check data-theme attribute:</strong>
                  <div className="code-block">
                    <pre>{`// Open browser console (F12)
console.log(document.documentElement.getAttribute('data-theme'));
// Should match selected theme`}</pre>
                  </div>
                </li>
                <li>
                  <strong>Verify CSS file is loaded:</strong>
                  <div className="code-block">
                    <pre>{`// In DevTools → Network tab, filter by CSS
// Look for theme CSS files (retro.css, etc.)
// Status should be 200 OK`}</pre>
                  </div>
                </li>
                <li>
                  <strong>Check for CSS conflicts:</strong>
                  <div className="code-block">
                    <pre>{`// In DevTools → Elements → Computed
// Select an element and check if CSS variables are defined
// Look for --background-primary, --text-primary, etc.`}</pre>
                  </div>
                </li>
              </ol>
            </div>

            <div className="troubleshooting-step">
              <strong>Solutions:</strong>
              <ul>
                <li><strong>Hard refresh:</strong> Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)</li>
                <li><strong>Clear cache:</strong> Clear browser cache and localStorage</li>
                <li><strong>Check imports:</strong> Verify theme CSS files imported in App.jsx</li>
              </ul>
            </div>
          </div>

          <div className="subsection">
            <h3>Problem: Users Reporting Visual Issues</h3>

            <div className="troubleshooting-step">
              <strong>Common User Complaints:</strong>
              <ul>
                <li>"Text is hard to read"</li>
                <li>"Colors are too bright/dark"</li>
                <li>"Theme looks broken on mobile"</li>
              </ul>
            </div>

            <div className="troubleshooting-step">
              <strong>Resolution Steps:</strong>
              <ol>
                <li>
                  <strong>Verify browser compatibility:</strong>
                  <div className="code-block">
                    <pre>{`Ask user for:
- Browser name and version
- Operating system
- Screenshot of the issue`}</pre>
                  </div>
                </li>
                <li>
                  <strong>Suggest alternative theme:</strong>
                  <p>Recommend users try different themes based on their needs:</p>
                  <ul>
                    <li><strong>Too bright:</strong> Tech-Savvy (dark theme)</li>
                    <li><strong>Hard to read:</strong> Modern Minimalist (best contrast)</li>
                    <li><strong>Too formal:</strong> Friendly & Approachable</li>
                  </ul>
                </li>
                <li>
                  <strong>Check accessibility settings:</strong>
                  <p>User's OS settings may conflict with theme. Ask them to check:</p>
                  <ul>
                    <li>High contrast mode</li>
                    <li>Dark mode override</li>
                    <li>Custom fonts</li>
                    <li>Zoom level (should be 100%)</li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>

          <div className="subsection">
            <h3>Problem: Cache Clearing Required</h3>

            <div className="info-box">
              <strong>When to Clear Cache:</strong>
              <ul>
                <li>After theme CSS file updates</li>
                <li>When theme variables are modified</li>
                <li>After server-side theme changes</li>
                <li>User reports persistent theme issues</li>
              </ul>
            </div>

            <div className="code-block">
              <strong>User Instructions (send to user):</strong>
              <pre>{`1. Open your browser settings
2. Navigate to Privacy/Security section
3. Choose "Clear browsing data"
4. Select:
   ✓ Cached images and files
   ✓ Cookies and site data (optional)
5. Click "Clear data"
6. Refresh the page (Ctrl+Shift+R)`}</pre>
            </div>
          </div>

          <div className="subsection">
            <h3>Problem: Browser Compatibility Issues</h3>

            <div className="warning-box">
              <strong>Unsupported Browsers:</strong>
              <ul>
                <li>Internet Explorer (all versions) - NOT SUPPORTED</li>
                <li>Chrome/Edge before version 90</li>
                <li>Firefox before version 88</li>
                <li>Safari before version 14</li>
              </ul>
            </div>

            <div className="code-block">
              <strong>Check Browser Support:</strong>
              <pre>{`// User can run this in console
console.log(CSS.supports('color', 'var(--test)'));
// Should return true if CSS variables supported`}</pre>
            </div>
          </div>
        </section>

        {/* Section 5: User Support */}
        <section id="user-support" className="guide-section">
          <h2>5. User Support</h2>

          <div className="subsection">
            <h3>How to Help Users Switch Themes</h3>

            <div className="support-script">
              <strong>Support Script:</strong>
              <div className="script-box">
                <p><strong>Step 1:</strong> "Let's switch your theme together. Can you see the navigation bar at the top?"</p>
                <p><strong>Step 2:</strong> "Look for the theme selector - it might show an icon like 🕹️ or a dropdown menu."</p>
                <p><strong>Step 3:</strong> "Click on it to open the theme menu."</p>
                <p><strong>Step 4:</strong> "You'll see four themes with icons. Which one would you like to try?"</p>
                <p><strong>Step 5:</strong> "Click on your choice. The page will update immediately."</p>
                <p><strong>Step 6:</strong> "Is the new theme displaying correctly? How does it look?"</p>
              </div>
            </div>
          </div>

          <div className="subsection">
            <h3>Common User Questions & Answers</h3>

            <div className="faq-item">
              <strong>Q: Will changing themes affect my work?</strong>
              <p><strong>A:</strong> No, changing themes only affects the visual appearance. All your data, progress, and settings remain unchanged.</p>
            </div>

            <div className="faq-item">
              <strong>Q: Can I switch themes on mobile?</strong>
              <p><strong>A:</strong> Yes! The theme switcher works on all devices. On mobile, you might need to open the settings menu first.</p>
            </div>

            <div className="faq-item">
              <strong>Q: Why does my theme reset when I log out?</strong>
              <p><strong>A:</strong> If you're logged in, your theme should persist. If it's resetting, there may be a sync issue. Try selecting your theme again while logged in.</p>
            </div>

            <div className="faq-item">
              <strong>Q: Can I customize the colors?</strong>
              <p><strong>A:</strong> Currently, themes use preset color schemes. Custom themes are planned for a future update.</p>
            </div>

            <div className="faq-item">
              <strong>Q: Which theme is best for accessibility?</strong>
              <p><strong>A:</strong> Modern Minimalist and Tech-Savvy have the best accessibility ratings. Modern Minimalist for light environments, Tech-Savvy for dark.</p>
            </div>
          </div>

          <div className="subsection">
            <h3>Screenshot Guide for Support Tickets</h3>

            <div className="info-box">
              <strong>Request from User:</strong>
              <ul>
                <li>Screenshot of the entire browser window</li>
                <li>URL visible in address bar</li>
                <li>Theme selector visible (if possible)</li>
                <li>Browser console open (F12 → Console tab)</li>
                <li>Date and time visible</li>
              </ul>
            </div>

            <div className="code-block">
              <strong>Helpful Console Commands for Users:</strong>
              <pre>{`// Copy this and send to user
console.log('Theme Info:', {
  currentTheme: document.documentElement.getAttribute('data-theme'),
  localStorage: localStorage.getItem('app_theme'),
  userAgent: navigator.userAgent
});`}</pre>
            </div>
          </div>

          <div className="subsection">
            <h3>Escalation Procedures</h3>

            <div className="escalation-levels">
              <div className="escalation-level">
                <strong>Level 1: Basic Support</strong>
                <ul>
                  <li>Theme won't switch</li>
                  <li>Visual preferences</li>
                  <li>How to find theme selector</li>
                </ul>
                <p><strong>Action:</strong> Follow support scripts above</p>
              </div>

              <div className="escalation-level">
                <strong>Level 2: Technical Support</strong>
                <ul>
                  <li>Persistent theme issues after cache clear</li>
                  <li>Theme not syncing across devices</li>
                  <li>Database-level theme corruption</li>
                </ul>
                <p><strong>Action:</strong> Escalate to backend admin for database check</p>
              </div>

              <div className="escalation-level">
                <strong>Level 3: Development Team</strong>
                <ul>
                  <li>Browser compatibility bugs</li>
                  <li>CSS rendering issues</li>
                  <li>Performance problems</li>
                </ul>
                <p><strong>Action:</strong> Create GitHub issue with full diagnostic info</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Technical Reference */}
        <section id="technical-reference" className="guide-section">
          <h2>6. Technical Reference</h2>

          <div className="subsection">
            <h3>Developer Documentation</h3>
            <div className="doc-links">
              <ul>
                <li><a href="/docs/THEME_SYSTEM.md">Theme System Implementation</a></li>
                <li><a href="/docs/DEVELOPER_GUIDE_THEMES.md">Developer Guide</a></li>
                <li><a href="/docs/API_REFERENCE_THEMES.md">API Reference</a></li>
                <li><a href="/docs/USER_GUIDE_THEMES.md">User Guide</a></li>
                <li><a href="/docs/CONTRIBUTING_THEMES.md">Contributing Guide</a></li>
              </ul>
            </div>
          </div>

          <div className="subsection">
            <h3>API Endpoints for Admins</h3>

            <div className="api-endpoint">
              <strong>GET /api/user/theme</strong>
              <p>Fetch user's saved theme preference</p>
              <div className="code-block">
                <pre>{`Request:
GET /api/user/theme
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "theme": "retro"
}`}</pre>
              </div>
            </div>

            <div className="api-endpoint">
              <strong>PUT /api/user/theme</strong>
              <p>Update user's theme preference</p>
              <div className="code-block">
                <pre>{`Request:
PUT /api/user/theme
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "theme": "modern-minimalist"
}

Response:
{
  "success": true,
  "message": "Theme updated successfully"
}`}</pre>
              </div>
            </div>

            <div className="api-endpoint">
              <strong>GET /api/admin/users</strong>
              <p>List all users (includes theme preferences)</p>
              <div className="code-block">
                <pre>{`Request:
GET /api/admin/users
Authorization: Bearer <admin-jwt-token>

Response:
{
  "success": true,
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "theme_preference": "retro",
      "last_login": "2025-10-23T10:30:00Z"
    }
  ]
}`}</pre>
              </div>
            </div>
          </div>

          <div className="subsection">
            <h3>Database Schema</h3>

            <div className="code-block">
              <strong>users table (relevant columns):</strong>
              <pre>{`CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  theme_preference TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- Index for theme queries
CREATE INDEX idx_users_theme ON users(theme_preference);`}</pre>
            </div>

            <div className="tip-box">
              <strong>💡 Note:</strong> The <code>theme_preference</code> column stores the theme key
              (e.g., 'retro', 'modern-minimalist'). NULL means user hasn't set a preference (will use default).
            </div>
          </div>

          <div className="subsection">
            <h3>Backup and Restore Procedures</h3>

            <div className="code-block">
              <strong>Backup Theme Preferences:</strong>
              <pre>{`# Export theme preferences to CSV
sqlite3 database.db <<EOF
.headers on
.mode csv
.output theme_backup_$(date +%Y%m%d).csv
SELECT id, email, theme_preference, updated_at
FROM users
WHERE theme_preference IS NOT NULL;
.quit
EOF`}</pre>
            </div>

            <div className="code-block">
              <strong>Restore Theme Preferences:</strong>
              <pre>{`# Import from CSV backup
sqlite3 database.db <<EOF
.mode csv
.import theme_backup_20251023.csv temp_theme_restore
UPDATE users
SET theme_preference = temp_theme_restore.theme_preference
FROM temp_theme_restore
WHERE users.id = temp_theme_restore.id;
DROP TABLE temp_theme_restore;
.quit
EOF`}</pre>
            </div>
          </div>
        </section>

        {/* Section 7: Monitoring */}
        <section id="monitoring" className="guide-section">
          <h2>7. Monitoring and Analytics</h2>

          <div className="subsection">
            <h3>Theme Usage Statistics</h3>

            <div className="code-block">
              <strong>Generate Usage Report:</strong>
              <pre>{`SELECT
  COALESCE(theme_preference, 'default') as theme,
  COUNT(*) as total_users,
  COUNT(CASE WHEN last_login > datetime('now', '-7 days') THEN 1 END) as active_users,
  ROUND(AVG(CASE WHEN last_login > datetime('now', '-30 days') THEN 1.0 ELSE 0 END) * 100, 2) as active_percentage
FROM users
GROUP BY theme_preference
ORDER BY total_users DESC;`}</pre>
            </div>
          </div>

          <div className="subsection">
            <h3>Performance Metrics</h3>

            <div className="metrics-list">
              <ul>
                <li><strong>Theme Switch Time:</strong> Should be &lt; 50ms</li>
                <li><strong>CSS Load Time:</strong> Theme CSS files should load &lt; 200ms</li>
                <li><strong>localStorage Access:</strong> &lt; 10ms</li>
                <li><strong>API Sync Time:</strong> &lt; 500ms</li>
              </ul>
            </div>

            <div className="code-block">
              <strong>Performance Testing Script:</strong>
              <pre>{`// Run in browser console
async function testThemePerformance() {
  const themes = ['retro', 'modern-minimalist', 'friendly-approachable', 'tech-savvy-trustworthy'];
  const results = [];

  for (const theme of themes) {
    const start = performance.now();
    document.documentElement.setAttribute('data-theme', theme);
    const end = performance.now();
    results.push({ theme, time: end - start });
  }

  console.table(results);
  const avg = results.reduce((sum, r) => sum + r.time, 0) / results.length;
  console.log('Average switch time:', avg.toFixed(2), 'ms');
}

testThemePerformance();`}</pre>
            </div>
          </div>

          <div className="subsection">
            <h3>User Satisfaction Tracking</h3>

            <div className="info-box">
              <strong>Metrics to Track:</strong>
              <ul>
                <li>Number of theme switches per user per session</li>
                <li>Time to first theme switch after registration</li>
                <li>Theme preference distribution by user role</li>
                <li>Support tickets related to themes</li>
                <li>Theme-related feature requests</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 8: Emergency Procedures */}
        <section id="emergency" className="guide-section">
          <h2>8. Emergency Procedures</h2>

          <div className="subsection">
            <h3>Emergency: Theme System Down</h3>

            <div className="warning-box">
              <strong>🚨 Critical Issue:</strong> All users reporting themes not working
            </div>

            <div className="emergency-steps">
              <ol>
                <li>
                  <strong>Verify Issue Scope:</strong>
                  <ul>
                    <li>Check if frontend is serving CSS files (Network tab)</li>
                    <li>Verify CDN is up (if using external fonts)</li>
                    <li>Check backend API endpoints responding</li>
                  </ul>
                </li>
                <li>
                  <strong>Immediate Mitigation:</strong>
                  <div className="code-block">
                    <pre>{`# Force default theme for all users
UPDATE users SET theme_preference = 'retro';

# Clear CDN cache if applicable
# Restart frontend service
docker-compose restart frontend`}</pre>
                  </div>
                </li>
                <li>
                  <strong>Communication:</strong>
                  <ul>
                    <li>Post status update on status page</li>
                    <li>Email active users with workaround</li>
                    <li>Update support channels</li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>

          <div className="subsection">
            <h3>Emergency: CSS Files Corrupted</h3>

            <div className="emergency-steps">
              <ol>
                <li>
                  <strong>Restore from Git:</strong>
                  <div className="code-block">
                    <pre>{`cd frontend/src/styles/themes/
git checkout HEAD -- *.css
npm run build  # or yarn build
docker-compose restart frontend`}</pre>
                  </div>
                </li>
                <li>
                  <strong>Verify Restoration:</strong>
                  <div className="code-block">
                    <pre>{`# Check file integrity
md5sum frontend/src/styles/themes/*.css
# Compare with known good checksums`}</pre>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          <div className="subsection">
            <h3>Emergency: Database Corruption</h3>

            <div className="emergency-steps">
              <ol>
                <li>
                  <strong>Assess Damage:</strong>
                  <div className="code-block">
                    <pre>{`sqlite3 database.db "PRAGMA integrity_check;"`}</pre>
                  </div>
                </li>
                <li>
                  <strong>Restore Theme Data:</strong>
                  <div className="code-block">
                    <pre>{`# From most recent backup
sqlite3 database.db < theme_backup_latest.sql`}</pre>
                  </div>
                </li>
                <li>
                  <strong>Reset Affected Users:</strong>
                  <div className="code-block">
                    <pre>{`UPDATE users
SET theme_preference = NULL
WHERE theme_preference NOT IN (
  'retro',
  'modern-minimalist',
  'friendly-approachable',
  'tech-savvy-trustworthy'
);`}</pre>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          <div className="subsection">
            <h3>Emergency Contacts</h3>

            <div className="contact-list">
              <ul>
                <li><strong>Frontend Team Lead:</strong> [Insert contact info]</li>
                <li><strong>Backend Team Lead:</strong> [Insert contact info]</li>
                <li><strong>DevOps On-Call:</strong> [Insert contact info]</li>
                <li><strong>Product Manager:</strong> [Insert contact info]</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="guide-footer">
          <div className="footer-content">
            <p>
              <strong>Questions or Issues?</strong> Contact the development team or open a GitHub issue.
            </p>
            <p>
              For urgent theme-related incidents, follow the emergency procedures above.
            </p>
            <div className="footer-links">
              <Link to="/admin">Return to Admin Panel</Link>
              <span>•</span>
              <a href="https://github.com/c2pa-generator" target="_blank" rel="noopener noreferrer">
                GitHub Repository
              </a>
              <span>•</span>
              <Link to="/settings">User Settings</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminGuidePage;
