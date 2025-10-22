# Documentation Enhancement Plan

## Overview
Consolidate technical documentation into a read-only help feature for different user roles.

## Proposed Solution

### Documentation System
- **Tool**: [Docusaurus](https://docusaurus.io/) or [VitePress](https://vitepress.dev/)
  - Lightweight, open-source
  - Supports versioning
  - Built-in search
  - Easy markdown-based content
  - Can be embedded in existing React apps

### User Documentation Structure

#### 1. **Regular User Guide** (Public/User Role)
**Minimal UI Guide - Focus on Core Features:**

```
Getting Started
├── Creating Your Account
├── Understanding C2PA Basics
└── Your First Certification Step

Using the Assistant
├── Asking Questions
├── Uploading Documents
└── Understanding Recommendations

Progress Tracking
├── Viewing Your Progress
├── Understanding Phases
└── Completing Requirements

Settings
├── Profile Management
└── Notification Preferences
```

**What to EXCLUDE from User Guide:**
- Admin panel features
- System configuration
- User management
- Database operations
- GitHub RAG setup
- OpenWebUI integration details
- Backend architecture

#### 2. **Admin Documentation** (Admin Role Only)
**Complete Technical Reference:**

```
System Administration
├── Configuration
│   ├── Environment Variables
│   ├── AI Provider Setup (Ollama/OpenAI)
│   └── OpenWebUI Integration
├── User Management
│   ├── Creating Users
│   ├── Managing Roles
│   └── Blocking/Unblocking
└── Monitoring
    ├── System Health
    └── Usage Statistics

GitHub RAG Integration
├── Setup & Authentication
├── Repository Indexing
└── Search Configuration

Database Management
├── Backup & Restore
├── Migration Guide
└── Database Schema

API Documentation
├── REST Endpoints
├── OpenAI-Compatible API
└── Authentication

Deployment
├── Docker Setup
├── Environment Configuration
└── Production Best Practices

Troubleshooting
├── Common Issues
├── Log Analysis
└── Support Resources
```

## Implementation Steps

### Phase 1: Setup Documentation Framework
1. Install Docusaurus/VitePress
2. Configure build system
3. Set up routing for `/docs` and `/admin/docs`
4. Implement role-based access control

### Phase 2: Content Migration
1. Migrate existing documentation to markdown
2. Organize by user type
3. Add screenshots and diagrams
4. Create user flow guides

### Phase 3: Integration
1. Add "Help" button to navigation
2. Implement in-app documentation viewer
3. Add contextual help links
4. Set up search functionality

### Phase 4: Polish
1. Add responsive design
2. Test on mobile devices
3. Add dark mode support
4. Implement feedback mechanism

## File Structure
```
docs/
├── user/                    # Regular user documentation
│   ├── getting-started.md
│   ├── using-assistant.md
│   ├── progress-tracking.md
│   └── settings.md
├── admin/                   # Admin-only documentation
│   ├── system-admin/
│   ├── github-rag/
│   ├── database/
│   ├── api/
│   └── deployment/
└── .vitepress/config.js     # or docusaurus.config.js
```

## Access Control Implementation

```javascript
// middleware/docs-access.js
function checkDocsAccess(req, res, next) {
  const isAdminRoute = req.path.startsWith('/docs/admin');

  if (isAdminRoute && req.user?.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin documentation requires administrator privileges'
    });
  }

  next();
}
```

## UI Components

### User Help Button
```jsx
// Regular users see this in navbar
<HelpButton>
  <Icon name="help-circle" />
  <Dropdown>
    <DropdownItem href="/docs/getting-started">Getting Started</DropdownItem>
    <DropdownItem href="/docs/faq">FAQ</DropdownItem>
    <DropdownItem href="/docs/contact">Contact Support</DropdownItem>
  </Dropdown>
</HelpButton>
```

### Admin Documentation Access
```jsx
// Admins see additional option in sidebar
{user.role === 'admin' && (
  <SidebarItem href="/admin/docs" icon="book">
    Technical Documentation
  </SidebarItem>
)}
```

## Benefits

### For Regular Users:
- ✅ Clean, focused help content
- ✅ No technical jargon
- ✅ Task-oriented guides
- ✅ Quick answers to common questions

### For Admins:
- ✅ Complete technical reference
- ✅ System architecture details
- ✅ Configuration guides
- ✅ Troubleshooting resources

## Current Documentation Files to Consolidate

### Move to User Docs:
- `README.md` (public overview)
- `SPEC.md` (simplified version for users)

### Move to Admin Docs:
- `GITHUB_RAG_IMPLEMENTATION.md`
- `SECURITY.md`
- `backend/docs/` (all files)
- Deployment guides
- API documentation

### Archive/Reference:
- Development notes
- Architecture decisions
- Migration guides

## Recommendation: VitePress

**Why VitePress over Docusaurus:**
- ⚡ Faster build times (Vite-based)
- 🎨 Better default theme
- 📦 Smaller bundle size
- 🔧 Simpler configuration
- ⚛️ Easy Vue/React integration
- 🔍 Built-in search

## Next Steps (To Be Implemented)

1. [ ] Install VitePress: `npm install -D vitepress`
2. [ ] Create `/docs` directory structure
3. [ ] Add role-based routing middleware
4. [ ] Migrate current documentation
5. [ ] Add help button to frontend
6. [ ] Test with different user roles
7. [ ] Deploy and verify access controls

## Estimated Effort
- Setup: 2-3 hours
- Content migration: 4-6 hours
- Integration: 2-3 hours
- Testing & polish: 2-3 hours
- **Total: ~10-15 hours**

---
**Status**: Planning Phase
**Priority**: Medium
**Dependencies**: None
**Assignee**: TBD
