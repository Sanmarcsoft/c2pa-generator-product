# Manual Test Checklist - UI Validation
## C2PA Generator Product Certification Assistant

**Purpose:** Manual validation of user feedback elements and UI interactions that cannot be fully tested via API

**Test URL:** http://localhost:8080
**Admin Credentials:** matt@sanmarcsoft.com / Admin2025Pass

---

## Pre-Test Setup

- [ ] Application is running on http://localhost:8080
- [ ] Browser DevTools is open (Console + Network tabs)
- [ ] You have admin credentials available
- [ ] You have a test GitHub repository URL ready (e.g., https://github.com/contentauth/c2pa-js)

---

## Test Section 1: Admin Page Navigation

### 1.1 Access Admin Page
- [ ] Navigate to http://localhost:8080/admin
- [ ] Verify redirect to login if not authenticated
- [ ] Login with admin credentials
- [ ] Verify successful redirect back to /admin
- [ ] Page loads without errors in console

**Expected Result:** Admin page displays with all sections visible

**Screenshot Location:** `screenshots/admin-page-initial.png`

---

### 1.2 Admin Page Sections Present
Verify all sections are displayed:

- [ ] Page header: "⚙️ Admin Control Panel"
- [ ] Section: "📊 System Statistics"
  - [ ] Total Users card
  - [ ] Admin Users card
  - [ ] AI Provider card
  - [ ] Onboarding card
- [ ] Section: "🤖 AI Provider Configuration"
  - [ ] AI Provider dropdown
  - [ ] Configuration fields (conditional)
  - [ ] Test Connection button
  - [ ] Save AI Configuration button
- [ ] Section: "🐙 GitHub Integration"
  - [ ] Enable GitHub Integration checkbox
  - [ ] GitHub token input field
  - [ ] Save GitHub Configuration button
  - [ ] GitHub RAG Repository Management subsection
- [ ] Section: "📚 Configuration Help"

**Screenshot Location:** `screenshots/admin-page-sections.png`

---

## Test Section 2: User Feedback - Toast Notifications

### 2.1 Success Toast Notification
**Test:** Save AI configuration with valid settings

Steps:
1. [ ] Select AI Provider: "OpenWebUI"
2. [ ] Enter OpenWebUI URL: `http://localhost:3000/api`
3. [ ] Click "Save AI Configuration"
4. [ ] Observe toast notification appears

**Validation Points:**
- [ ] Toast appears in **top-right corner**
- [ ] Toast has **success styling** (green background)
- [ ] Toast shows **✓ icon**
- [ ] Message reads: "AI configuration saved successfully!"
- [ ] Toast **auto-hides after ~5 seconds**
- [ ] Toast does **NOT block** other UI elements
- [ ] Multiple toasts stack vertically (if testing multiple saves)

**Screenshot Location:** `screenshots/toast-success.png`

---

### 2.2 Error Toast Notification
**Test:** Attempt to add repository without GitHub token configured

Steps:
1. [ ] Ensure GitHub Integration checkbox is **unchecked**
2. [ ] Enter repository URL: `https://github.com/contentauth/c2pa-js`
3. [ ] Click "ADD REPOSITORY" button
4. [ ] Observe error toast notification

**Validation Points:**
- [ ] Toast appears in **top-right corner**
- [ ] Toast has **error styling** (red background)
- [ ] Toast shows **✗ icon**
- [ ] Message is clear and actionable
- [ ] Toast **auto-hides after ~5 seconds**

**Screenshot Location:** `screenshots/toast-error.png`

---

## Test Section 3: User Feedback - Button States

### 3.1 Button State: VALIDATING
**Test:** Repository URL validation phase

**Prerequisites:**
- [ ] GitHub Integration is enabled
- [ ] GitHub token is configured

Steps:
1. [ ] Enter repository URL in "Repository URL" field: `https://github.com/contentauth/c2pa-js`
2. [ ] Click "ADD REPOSITORY" button
3. [ ] **IMMEDIATELY** observe button text and state

**Validation Points:**
- [ ] Button text changes to: **"VALIDATING..."**
- [ ] Button is **disabled** (grayed out)
- [ ] User cannot click button again
- [ ] Button state persists for validation duration (~1-2 seconds)

**Screenshot Location:** `screenshots/button-validating.png`

**Note:** You may need to use slow network throttling in DevTools to capture this state

---

### 3.2 Button State: INDEXING
**Test:** Repository indexing phase

**Prerequisites:**
- [ ] Repository validation passed
- [ ] Repository URL is valid

Steps:
1. [ ] Continue from previous test (validation passed)
2. [ ] Observe button transitions to "INDEXING..." state

**Validation Points:**
- [ ] Button text changes from "VALIDATING..." to: **"INDEXING..."**
- [ ] Button remains **disabled**
- [ ] User cannot interact with button
- [ ] Button state persists for indexing duration (may be several seconds)
- [ ] On completion, button returns to: **"ADD REPOSITORY"**

**Screenshot Location:** `screenshots/button-indexing.png`

---

### 3.3 Button State: Return to Normal
**Test:** Button state after completion

**Validation Points:**
- [ ] Button text returns to: "ADD REPOSITORY"
- [ ] Button is **enabled** (no longer grayed out)
- [ ] Button is clickable
- [ ] Input field is cleared (if success)
- [ ] Input field retains value (if error)

---

## Test Section 4: User Feedback - Status Badges

### 4.1 Indexed Repository Badge
**Test:** Status badge appears after successful indexing

**Prerequisites:**
- [ ] At least one repository has been successfully indexed

Steps:
1. [ ] Navigate to "Configured Repositories" section
2. [ ] Locate a successfully indexed repository in the list
3. [ ] Observe the status badge

**Validation Points:**
- [ ] Badge appears **inline** with repository name
- [ ] Badge text: **"✓ Indexed (X files)"**
- [ ] Badge has **success styling** (green or distinct color)
- [ ] File count (X) is **> 0**
- [ ] Badge is **next to** repository owner/name link

**Screenshot Location:** `screenshots/status-badge-indexed.png`

---

### 4.2 Repository Without Badge
**Test:** Pending or failed repositories

**Validation Points:**
- [ ] Repository without "Indexed" status shows **no badge** OR
- [ ] Shows a different badge (e.g., "⏳ Pending", "⚠️ Error")

**Screenshot Location:** `screenshots/status-badge-pending.png` (if applicable)

---

### 4.3 Last Indexed Timestamp
**Test:** Timestamp display for indexed repositories

**Validation Points:**
- [ ] Timestamp appears **below** repository name
- [ ] Format: "Last indexed: [localized date/time]"
- [ ] Example format: "Last indexed: 10/23/2025, 2:30:15 PM"
- [ ] Timestamp is **accurate** (matches when indexing occurred)
- [ ] Timestamp only appears if repository **has been indexed**

**Screenshot Location:** `screenshots/timestamp-display.png`

---

## Test Section 5: User Feedback - Secret Input Controls

### 5.1 Secret Input - Hidden State (Default)
**Test:** Password/token fields are masked by default

Steps:
1. [ ] Locate the "GitHub Personal Access Token" field
2. [ ] Observe the input field and toggle button

**Validation Points:**
- [ ] Input field type is: **password** (shows •••• when typing)
- [ ] Toggle button shows: **👁️ icon** (eye open)
- [ ] Placeholder text: "••••••••••••" if token is configured
- [ ] OR placeholder text: "ghp_..." if token is NOT configured

**Screenshot Location:** `screenshots/secret-hidden.png`

---

### 5.2 Secret Input - Visible State
**Test:** Toggle password visibility

Steps:
1. [ ] Click the **👁️ toggle button**
2. [ ] Observe the changes

**Validation Points:**
- [ ] Input field type changes to: **text**
- [ ] Token value is now **visible** (if previously entered)
- [ ] Toggle button icon changes to: **🙈** (eye closed/hidden)
- [ ] Button is clearly clickable

**Screenshot Location:** `screenshots/secret-visible.png`

---

### 5.3 Secret Input - Configured Indicator
**Test:** Visual indication when secret is configured

**Validation Points:**
- [ ] Below input field, text appears: **"✓ Token configured"**
- [ ] Text has **success styling** (green color)
- [ ] Text only appears when secret **is configured**
- [ ] Placeholder shows "••••••••••••" when configured

**Screenshot Location:** `screenshots/secret-configured.png`

---

### 5.4 Secret Input - All Fields
**Test:** Verify all secret fields have toggle functionality

Test the following fields:
- [ ] OpenAI API Key (if AI Provider = OpenAI)
- [ ] OpenWebUI API Key (if AI Provider = OpenWebUI)
- [ ] GitHub Personal Access Token (if GitHub Integration enabled)

**Validation Points (for each):**
- [ ] Field has toggle button
- [ ] Toggle button works (shows/hides)
- [ ] Icons change appropriately (👁️ ↔️ 🙈)
- [ ] Field type switches (password ↔️ text)

---

## Test Section 6: Repository Management UI

### 6.1 Empty State
**Test:** Display when no repositories are configured

**Validation Points:**
- [ ] Message displays: "No repositories configured yet. Add a repository above to enable RAG features."
- [ ] Message is **clear and actionable**
- [ ] Empty state box is **styled distinctly** (bordered, centered text)

**Screenshot Location:** `screenshots/repos-empty-state.png`

---

### 6.2 Repository List Display
**Test:** Repositories display correctly in list

**Prerequisites:**
- [ ] At least one repository has been added

**Validation Points:**
- [ ] Heading: "Configured Repositories:"
- [ ] Each repository shows as a **card** with:
  - [ ] Repository owner/name as **clickable link**
  - [ ] Link opens GitHub repo in **new tab**
  - [ ] Status badge (if indexed)
  - [ ] Last indexed timestamp (if indexed)
  - [ ] Two action buttons: "RE-INDEX" and "REMOVE"

**Screenshot Location:** `screenshots/repos-list.png`

---

### 6.3 Repository Actions - Reindex Button
**Test:** Reindex button functionality

Steps:
1. [ ] Click "RE-INDEX" button on an existing repository
2. [ ] Observe feedback and behavior

**Validation Points:**
- [ ] Button is **clickable** and styled as secondary button
- [ ] On click, **toast notification** appears (loading/success/error)
- [ ] Button is **disabled during indexing** (or shows loading state)
- [ ] Repository status updates after completion
- [ ] Last indexed timestamp updates

**Screenshot Location:** `screenshots/reindex-button.png`

---

### 6.4 Repository Actions - Remove Button
**Test:** Remove button functionality

Steps:
1. [ ] Click "REMOVE" button on a repository
2. [ ] Observe confirmation dialog

**Validation Points:**
- [ ] Confirmation dialog appears: "Remove repository [name]?"
- [ ] Dialog has **Cancel** and **OK/Confirm** options
- [ ] On Cancel: No action taken, dialog closes
- [ ] On Confirm:
  - [ ] Toast notification shows removal status
  - [ ] Repository disappears from list
  - [ ] List updates immediately

**Screenshot Location:** `screenshots/remove-confirmation.png`

---

## Test Section 7: Error Handling & Edge Cases

### 7.1 Invalid URL Format
**Test:** Add repository with invalid URL

Steps:
1. [ ] Enter invalid URL: `not-a-url`
2. [ ] Click "ADD REPOSITORY"

**Validation Points:**
- [ ] Error toast appears
- [ ] Message: "Please enter a GitHub repository URL" OR similar
- [ ] Button returns to normal state
- [ ] Input field retains invalid value (for user to correct)

**Screenshot Location:** `screenshots/error-invalid-url.png`

---

### 7.2 Repository Not Found
**Test:** Add repository that doesn't exist

Steps:
1. [ ] Enter URL: `https://github.com/nonexistent/repository-does-not-exist-12345`
2. [ ] Click "ADD REPOSITORY"

**Validation Points:**
- [ ] Validation phase completes
- [ ] Error toast appears
- [ ] Message: "Repository [name] not found or not accessible..."
- [ ] Suggests checking URL and token permissions
- [ ] Button returns to normal state

**Screenshot Location:** `screenshots/error-not-found.png`

---

### 7.3 GitHub Token Not Configured
**Test:** Attempt to add repository without token

Steps:
1. [ ] Ensure GitHub Integration is **enabled**
2. [ ] Ensure GitHub token is **NOT configured**
3. [ ] Enter valid repository URL
4. [ ] Click "ADD REPOSITORY"

**Validation Points:**
- [ ] Error toast appears immediately (or after validation)
- [ ] Message: "GitHub token not configured. Please configure GitHub integration first."
- [ ] Message is **actionable** (tells user what to do)
- [ ] No repository added to list

**Screenshot Location:** `screenshots/error-no-token.png`

---

### 7.4 Network Error
**Test:** Simulate network failure (optional, requires DevTools)

**Note:** Use Chrome DevTools Network tab → Offline mode

Steps:
1. [ ] Enable offline mode in DevTools
2. [ ] Attempt to add repository
3. [ ] Observe error handling

**Validation Points:**
- [ ] Error toast appears
- [ ] Message indicates network/connection issue
- [ ] Button returns to enabled state
- [ ] User can retry

---

## Test Section 8: Chat Functionality Baseline

### 8.1 Send Chat Message
**Test:** Basic chat interaction

Steps:
1. [ ] Navigate to Chat page (/chat)
2. [ ] Enter message: "What is C2PA?"
3. [ ] Send message
4. [ ] Observe response

**Validation Points:**
- [ ] Message appears in chat history
- [ ] Loading indicator appears (if present)
- [ ] AI response is generated
- [ ] Response is **relevant** to question
- [ ] Response mentions "C2PA" or related terms
- [ ] No errors in console

**Screenshot Location:** `screenshots/chat-interaction.png`

---

## Test Section 9: Other Pages

### 9.1 Documents Page
**Test:** Documents page accessible

Steps:
1. [ ] Navigate to /documents
2. [ ] Observe page content

**Validation Points:**
- [ ] Page loads without errors
- [ ] Document upload interface visible (if implemented)
- [ ] Document list displays (if any documents exist)

**Screenshot Location:** `screenshots/documents-page.png`

---

### 9.2 Progress Page
**Test:** Progress page accessible

Steps:
1. [ ] Navigate to /progress
2. [ ] Observe page content

**Validation Points:**
- [ ] Page loads without errors
- [ ] Starship visualization displays
- [ ] Progress indicators visible

**Screenshot Location:** `screenshots/progress-page.png`

---

## Test Section 10: Console & Network Validation

### 10.1 Console Errors
**Test:** No critical errors during normal operation

Throughout all tests above:
- [ ] Check browser console regularly
- [ ] Note any errors or warnings

**Validation Points:**
- [ ] **No critical JavaScript errors**
- [ ] No 404 errors for missing resources
- [ ] Warnings are expected (e.g., development mode)
- [ ] No CORS errors
- [ ] No authentication errors (except during auth tests)

**Note Critical Issues:**
```
[List any console errors found]
```

---

### 10.2 Network Requests
**Test:** API requests are made correctly

Check DevTools Network tab:
- [ ] All API requests use proper HTTP methods (GET, POST, PUT, DELETE)
- [ ] Authentication header is sent: `Authorization: Bearer [token]`
- [ ] Response status codes are appropriate (200, 401, 500)
- [ ] Response times are reasonable (< 2s for most requests)

**Note Slow Requests (> 2s):**
```
[List any slow API endpoints]
```

---

## Test Completion Checklist

### Test Summary
- [ ] All sections completed
- [ ] All screenshots captured and saved
- [ ] All issues documented
- [ ] Console errors noted
- [ ] Network issues noted

### Overall Assessment
Rate each area (1-5, 5 = excellent):

| Area | Rating | Notes |
|------|--------|-------|
| Toast Notifications | __/5 | |
| Button States | __/5 | |
| Status Badges | __/5 | |
| Secret Input Controls | __/5 | |
| Error Handling | __/5 | |
| Repository Management | __/5 | |
| Overall UI/UX | __/5 | |

### Critical Issues Found
```
1. [Issue description]
   Severity: [Critical/High/Medium/Low]
   Steps to reproduce: [...]

2. [Issue description]
   ...
```

### Recommendations
```
1. [Recommendation]
2. [Recommendation]
...
```

---

## Sign-off

**Tester Name:** _______________________
**Date:** _______________________
**Test Duration:** _______ minutes
**Overall Status:** [ ] PASS [ ] PASS WITH ISSUES [ ] FAIL

**Notes:**
```
[Any additional notes or observations]
```

---

**End of Manual Test Checklist**
