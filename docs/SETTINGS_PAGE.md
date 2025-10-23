# Settings Page Documentation

The Settings Page provides a comprehensive web interface for administrators to configure all aspects of the C2PA Generator Product Certification Assistant application.

## Overview

**Access**: Admin users only
**URL**: http://localhost:8080/settings
**Navigation**: Click "⚙️ SETTINGS" in the header

The settings page is organized into six main categories:
1. **General** - Basic application configuration
2. **AI & Models** - AI provider and behavior settings
3. **Security** - Authentication and security policies
4. **Features** - Enable/disable application features
5. **Notifications** - Notification preferences
6. **Advanced** - Maintenance and advanced tasks

## Settings Categories

### 1. General Settings 🏠

Basic application configuration and branding.

#### Available Settings

| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| **Application Name** | Text | Name displayed in header and titles | "C2PA Generator Assistant" |
| **Application Description** | Text Area | Brief description of the application | "" |
| **Maintenance Mode** | Checkbox | Only admins can access when enabled | false |
| **Allow User Registration** | Checkbox | Enable new user registration | true |
| **Require Email Verification** | Checkbox | Users must verify email to access app | false |

#### Use Cases

**Branding**: Update the application name to match your organization
```
Application Name: "Acme Corp C2PA Assistant"
```

**Maintenance**: Enable maintenance mode during updates
```
✓ Maintenance Mode
```

**Restrict Access**: Disable registration for closed systems
```
☐ Allow User Registration
```

---

### 2. AI & Model Settings 🤖

Configure AI provider, model selection, and behavior parameters.

#### Available Settings

| Setting | Type | Description | Default | Range |
|---------|------|-------------|---------|-------|
| **AI Provider** | Select | AI backend (none/openwebui/openai) | "none" | - |
| **Default AI Model** | Text | Model identifier | "" | - |
| **Temperature** | Slider | Response creativity level | 0.7 | 0.0-1.0 |
| **Max Tokens** | Number | Maximum response length | 500 | 100-4000 |
| **Enable RAG** | Checkbox | Use document context in responses | true | - |

#### Temperature Guide

- **0.0-0.3**: Very focused, deterministic responses
- **0.4-0.7**: Balanced creativity and accuracy
- **0.8-1.0**: More creative and varied responses

#### Use Cases

**Conservative AI**: For technical/compliance responses
```
Temperature: 0.3
Max Tokens: 300
```

**Creative AI**: For ideation and brainstorming
```
Temperature: 0.9
Max Tokens: 1000
```

**With Code Context**: Enable RAG for code-aware responses
```
✓ Enable RAG
```

---

### 3. Security Settings 🔒

Configure authentication policies and security controls.

#### Available Settings

| Setting | Type | Description | Default | Range |
|---------|------|-------------|---------|-------|
| **Session Timeout** | Number | Inactivity timeout (seconds) | 3600 | 300-86400 |
| **Max Login Attempts** | Number | Failed attempts before lockout | 5 | 3-10 |
| **Minimum Password Length** | Number | Required password characters | 8 | 8-32 |
| **Require Strong Passwords** | Checkbox | Enforce complexity rules | true | - |
| **Enable Two-Factor Auth** | Checkbox | Require 2FA for admins | false | - |

#### Session Timeout Examples

- **5 minutes** (300s): High-security environments
- **1 hour** (3600s): Standard office use
- **8 hours** (28800s): All-day sessions
- **24 hours** (86400s): Maximum allowed

#### Use Cases

**High Security**: Short sessions, strict passwords
```
Session Timeout: 900 (15 minutes)
Max Login Attempts: 3
Minimum Password Length: 12
✓ Require Strong Passwords
✓ Enable Two-Factor Auth
```

**Relaxed Development**: Longer sessions, basic security
```
Session Timeout: 28800 (8 hours)
Max Login Attempts: 10
Minimum Password Length: 8
☐ Require Strong Passwords
```

---

### 4. Feature Flags 🎮

Enable or disable specific application features with visual toggle switches.

#### Available Features

| Feature | Description | Default |
|---------|-------------|---------|
| **💬 Chat Interface** | AI-powered chat assistant | Enabled |
| **📄 Documents** | Document upload and management | Enabled |
| **📊 Progress Tracking** | Certification progress dashboard | Enabled |
| **🐙 GitHub Integration** | Code search and RAG | Disabled |
| **🎯 Adventure Mode** | Gamified certification experience | Enabled |
| **1️⃣ Phase 1 Module** | Introduction & Prerequisites | Enabled |

#### Use Cases

**Minimal Setup**: Only essential features
```
✓ Chat Interface
✓ Progress Tracking
☐ Documents
☐ GitHub Integration
☐ Adventure Mode
☐ Phase 1 Module
```

**Full Featured**: Everything enabled
```
✓ All features enabled
```

**Focus Mode**: Disable distractions
```
✓ Chat Interface
✓ Documents
✓ Progress Tracking
☐ Adventure Mode
```

---

### 5. Notification Settings 🔔

Configure how and when notifications are sent.

#### Available Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **Enable Email Notifications** | Send notifications via email | false |
| **Enable In-App Notifications** | Show in-app notification badges | true |
| **Notify on New User Registration** | Alert admins about new users | true |
| **Notify on System Errors** | Alert admins about critical errors | true |

#### Use Cases

**Email Alerts**: Get notified outside the app
```
✓ Enable Email Notifications
✓ Notify on New User Registration
✓ Notify on System Errors
```

**Quiet Mode**: Minimal notifications
```
☐ Enable Email Notifications
✓ Enable In-App Notifications
☐ Notify on New User Registration
☐ Notify on System Errors
```

---

### 6. Advanced Settings ⚡

Maintenance tasks and system operations.

#### Available Actions

**🔄 Reset Onboarding**
- Resets the onboarding wizard for all users
- Users will see setup wizard on next login
- Use case: After major updates or configuration changes

**🗑️ Clear Cache** (Coming Soon)
- Clears application cache and temporary data
- May improve performance
- Use case: Troubleshooting performance issues

**📊 Export Settings** (Coming Soon)
- Export current settings as JSON
- Use case: Backup before major changes, migration

**⚠️ Reset All Settings** (Coming Soon)
- Reset all settings to default values
- Cannot be undone
- Use case: Fresh start or troubleshooting

#### Reset Onboarding Use Cases

**After Setup Changes**:
```
Scenario: Changed AI provider from OpenAI to OpenWebUI
Action: Reset onboarding so users see updated configuration wizard
```

**New Features**:
```
Scenario: Added GitHub integration capabilities
Action: Reset onboarding to introduce new features
```

---

## Complete Configuration Examples

### Example 1: Production Environment

```yaml
General:
  App Name: "Acme Corp C2PA Certification"
  Maintenance Mode: false
  Allow Registration: false
  Require Email Verification: true

AI & Models:
  Provider: openai
  Model: gpt-4
  Temperature: 0.5
  Max Tokens: 800
  Enable RAG: true

Security:
  Session Timeout: 3600 (1 hour)
  Max Login Attempts: 5
  Password Min Length: 12
  Require Strong Passwords: true
  Enable Two-Factor: true

Features:
  All enabled

Notifications:
  Email: true
  In-App: true
  New User: true
  Errors: true
```

### Example 2: Development Environment

```yaml
General:
  App Name: "C2PA Assistant (DEV)"
  Maintenance Mode: false
  Allow Registration: true
  Require Email Verification: false

AI & Models:
  Provider: openwebui
  Model: llama2
  Temperature: 0.7
  Max Tokens: 500
  Enable RAG: true

Security:
  Session Timeout: 28800 (8 hours)
  Max Login Attempts: 10
  Password Min Length: 8
  Require Strong Passwords: false
  Enable Two-Factor: false

Features:
  All enabled for testing

Notifications:
  Email: false
  In-App: true
  New User: false
  Errors: true
```

### Example 3: Minimal Setup

```yaml
General:
  App Name: "C2PA Quick Start"
  Maintenance Mode: false
  Allow Registration: true
  Require Email Verification: false

AI & Models:
  Provider: none (fallback mode)
  Enable RAG: false

Security:
  Session Timeout: 3600
  Max Login Attempts: 5
  Password Min Length: 8
  Require Strong Passwords: true

Features:
  Chat: true
  Progress: true
  Others: false

Notifications:
  All in-app only
```

---

## Settings Persistence

### How Settings Are Stored

- **Database**: All settings stored in `app_settings` table
- **Format**: Key-value pairs with type information
- **Types**: string, boolean, number, json
- **Updates**: Real-time via API, no restart required (usually)

### Settings That May Require Restart

- AI Provider changes (OpenAI ↔ OpenWebUI)
- Security settings (session timeout, password requirements)
- Feature flags may need user re-login to take effect

### Backup Recommendations

Before major changes:
```bash
# Export settings (when feature is available)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/settings > settings-backup.json
```

---

## API Integration

### Get All Settings

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/settings
```

### Update a Setting

```bash
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value": true}' \
  http://localhost:8080/api/settings/enable_chat
```

### Reset Onboarding

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/settings/onboarding/reset
```

---

## Troubleshooting

### Settings Not Saving

**Issue**: Changes don't persist after page reload

**Solutions**:
1. Check browser console for API errors
2. Verify admin authentication token is valid
3. Check backend logs for database errors
4. Ensure database volume is properly mounted

### Feature Flags Not Working

**Issue**: Disabled features still appear

**Solutions**:
1. Log out and log back in
2. Clear browser cache
3. Check if feature is hard-coded (not fully implemented)
4. Restart the application container

### Permission Denied

**Issue**: "Access Denied" error on settings page

**Solutions**:
1. Verify user account has `role: admin`
2. Check JWT token is valid and not expired
3. Use admin credential reset script if needed

### AI Settings Not Applied

**Issue**: AI still using old configuration

**Solutions**:
1. Save settings using "Save AI Settings" button
2. May need to configure API keys in Admin Panel
3. Some settings require application restart
4. Check backend logs for AI initialization errors

---

## Best Practices

### 1. Change Management
- **Test in dev first**: Try new settings in development before production
- **Document changes**: Keep notes on what settings work best
- **Backup before changes**: Export settings before major modifications

### 2. Security
- **Strong defaults**: Use strong passwords and short sessions for production
- **Regular reviews**: Review security settings quarterly
- **Monitor logs**: Watch for unusual login attempts

### 3. Features
- **Progressive rollout**: Enable one feature at a time
- **User feedback**: Ask users about feature usefulness
- **Performance monitoring**: Disable unused features to improve performance

### 4. AI Configuration
- **Start conservative**: Begin with lower temperature, increase if needed
- **Monitor costs**: OpenAI API charges per token
- **Test responses**: Verify AI quality after configuration changes

---

## Keyboard Shortcuts

While on the settings page:

- **Tab + Enter**: Navigate and activate toggles
- **Number keys (1-6)**: Quick switch between tabs (when implemented)
- **Ctrl/Cmd + S**: Quick save (browser default)

---

## See Also

- [Admin Panel Documentation](./ADMIN_PANEL.md) - AI provider and GitHub configuration
- [Admin Setup Guide](../ADMIN_SETUP.md) - Creating admin users
- [Security Guide](../SECURITY.md) - Security best practices
- [API Documentation](./API.md) - Complete API reference

---

**Need Help?** Contact the development team or refer to the [main documentation](../README.md).
