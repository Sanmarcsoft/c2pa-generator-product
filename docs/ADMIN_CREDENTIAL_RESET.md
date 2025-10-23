# Admin Credential Reset Guide

This guide explains how to reset or overwrite admin credentials for the C2PA Generator Product web application.

## Overview

As of the latest update, the admin credential management system now supports **overwriting existing user accounts** with confirmation. This means you can:

1. Reset forgotten admin passwords
2. Convert regular users to admin users
3. Update admin account information
4. Force overwrite for automation/scripting

## How It Works

When you try to create an admin user with an email that already exists:

1. **The script shows you a comparison**:
   ```
   User account already exists for admin@example.com
   ------------------------------------------------------------
   Current Information:
     Email:      admin@example.com
     Name:       John Doe
     Role:       user
     User ID:    abc123
     Created:    2025-01-15T10:30:00.000Z
   ------------------------------------------------------------
   New Information:
     Email:      admin@example.com
     Name:       Jane Smith
     Role:       admin
     Password:   [will be updated]
   ------------------------------------------------------------
   ```

2. **You confirm the overwrite**:
   - Interactive mode: Prompts `Overwrite this user account and set as admin? (yes/no):`
   - Force mode: Automatically overwrites without prompting

3. **The account is updated**:
   - Role is set to `admin`
   - Password is updated
   - Name is updated (or kept if not provided)
   - All other data remains intact (ID, created date, etc.)

## Usage Examples

### Example 1: Reset Forgotten Password (Interactive)

```bash
./scripts/set-admin.sh admin@sanmarcsoft.com "NewSecurePass123!" "System Administrator"
```

**What happens**:
- Shows current user info
- Shows new info that will be set
- Asks: `Overwrite this user account and set as admin? (yes/no):`
- Type `yes` to confirm
- Password is reset, user is set as admin

### Example 2: Force Reset (No Confirmation)

Perfect for automation or when you're certain:

```bash
./scripts/set-admin.sh admin@sanmarcsoft.com "NewSecurePass123!" "System Administrator" --force
```

**What happens**:
- Shows current and new user info
- Displays: `Force overwrite enabled - skipping confirmation`
- Immediately updates the account
- No user input required

### Example 3: Docker Command with Force

```bash
docker exec c2pa-generator-assistant node scripts/create-admin.js \
  --email admin@company.com \
  --password "NewPassword456!" \
  --name "Admin User" \
  --force
```

### Example 4: Environment Variables with Force

```bash
docker exec -e ADMIN_EMAIL=admin@company.com \
  -e ADMIN_PASSWORD="NewPassword456!" \
  -e ADMIN_NAME="Admin User" \
  -e ADMIN_FORCE=true \
  c2pa-generator-assistant node scripts/create-admin.js
```

## Force Flags

The following flags skip confirmation prompts:

- `--force` - Force overwrite without confirmation
- `--yes` - Alias for `--force`
- `ADMIN_FORCE=true` - Environment variable for force mode

## Common Scenarios

### Scenario 1: Locked Out (Forgot Password)

**Problem**: You forgot your admin password and can't log in.

**Solution**:
```bash
# Quick reset with force flag
./scripts/set-admin.sh admin@sanmarcsoft.com "MyNewPassword123!" --force

# Or interactive if you want to see details
./scripts/set-admin.sh admin@sanmarcsoft.com "MyNewPassword123!"
# Then type 'yes' when prompted
```

### Scenario 2: Promote Regular User to Admin

**Problem**: A user account exists but needs admin privileges.

**Solution**:
```bash
# The script will detect the existing user and offer to overwrite
./scripts/set-admin.sh user@company.com "NewAdminPass123!" "User Name"
# Type 'yes' when asked to overwrite - role will be changed to admin
```

### Scenario 3: Automated Setup in CI/CD

**Problem**: Need to set up admin accounts in automated deployments.

**Solution**:
```bash
# Use force flag to skip interactive prompts
./scripts/set-admin.sh "$ADMIN_EMAIL" "$ADMIN_PASSWORD" "$ADMIN_NAME" --force
```

### Scenario 4: Update Admin Name but Keep Everything Else

**Problem**: Need to update just the display name.

**Solution**:
```bash
# Run with same email and password, new name
./scripts/set-admin.sh admin@sanmarcsoft.com "SamePassword123!" "New Display Name"
# Confirm when prompted
```

## Safety Features

### 1. Clear Comparison
Before overwriting, you see:
- What currently exists
- What will be changed
- Confirmation prompt (unless `--force` used)

### 2. No Accidental Overwrites
Without `--force`, you must explicitly type `yes` or `y` to confirm.

### 3. All Changes Are Logged
Every credential update is logged for audit purposes.

### 4. Password Validation
Even when overwriting, new passwords must meet security requirements:
- Minimum 8 characters
- Should contain uppercase, lowercase, numbers, special characters

## Security Considerations

### When to Use Force Mode

**✅ Safe to use `--force` when**:
- Running automated scripts in controlled environments
- You're absolutely certain about the change
- No one else is using the system
- It's a fresh deployment/setup

**❌ Don't use `--force` when**:
- Multiple admins exist and you're unsure which account to modify
- In production without a backup
- You're not sure about the current state

### Best Practices

1. **Always verify the email** before running the command
2. **Use strong passwords** even when resetting
3. **Keep a record** of admin credential changes
4. **Test the new credentials** immediately after reset
5. **Don't share** force-mode commands with credentials in logs

## Troubleshooting

### Issue: "User account was not modified"

**Cause**: You typed `no` at the confirmation prompt.

**Solution**: Run the command again and type `yes` when prompted, or use `--force`.

### Issue: Script hangs waiting for input

**Cause**: You're running in non-interactive mode without `--force`.

**Solution**: Add `--force` flag to skip confirmation:
```bash
./scripts/set-admin.sh admin@example.com "Pass123!" --force
```

### Issue: Can't log in after password reset

**Cause**: Password might have special characters that need escaping.

**Solution**: Quote the password properly:
```bash
# Use single quotes for passwords with special chars
./scripts/set-admin.sh admin@example.com 'P@$$w0rd!' "Admin" --force
```

### Issue: Want to abort without changes

**Solution**:
- Type `no` when prompted
- Or press Ctrl+C to cancel entirely

## See Also

- [Admin Setup Guide](../ADMIN_SETUP.md) - Initial admin account setup
- [Admin Panel Documentation](./ADMIN_PANEL.md) - Web-based admin interface
- [Security Guide](../SECURITY.md) - Security best practices

---

**Questions?** Check the main [README.md](../README.md) or contact the development team.
