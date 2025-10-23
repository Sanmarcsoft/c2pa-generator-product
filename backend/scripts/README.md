# Backend Scripts

This directory contains utility scripts for managing the C2PA Generator Product application.

## create-admin.js

Creates an admin user account with elevated privileges.

### Usage

#### Interactive Mode (Recommended)

Run the script without arguments for an interactive prompt:

```bash
cd backend
node scripts/create-admin.js
```

You'll be prompted to enter:
- Email address
- Password (hidden input with confirmation)
- Full name (optional)

#### Command-Line Mode

Provide credentials as command-line arguments:

```bash
node scripts/create-admin.js \
  --email admin@example.com \
  --password "SecurePass123!" \
  --name "Admin User"
```

#### Environment Variable Mode

Set environment variables and run:

```bash
export ADMIN_EMAIL="admin@example.com"
export ADMIN_PASSWORD="SecurePass123!"
export ADMIN_NAME="Admin User"
node scripts/create-admin.js
```

Or as a one-liner:

```bash
ADMIN_EMAIL="admin@example.com" \
ADMIN_PASSWORD="SecurePass123!" \
ADMIN_NAME="Admin User" \
node scripts/create-admin.js
```

### Password Requirements

- Minimum 8 characters
- Should contain at least 3 of:
  - Uppercase letters (A-Z)
  - Lowercase letters (a-z)
  - Numbers (0-9)
  - Special characters (!@#$%^&*(),.?":{}|<>)

### Features

- **Email Validation**: Ensures valid email format
- **Password Strength Checking**: Enforces secure password requirements
- **Password Confirmation**: Prevents typos in interactive mode
- **Hidden Password Input**: Secure password entry (displays asterisks)
- **Duplicate Detection**: Checks if user already exists
- **Role Promotion**: Can promote existing users to admin
- **Password Update**: Can update password for existing admin users
- **Colored Output**: Clear, color-coded terminal output
- **Graceful Exit**: Handles Ctrl+C and cancellation

### Examples

#### Create first admin user

```bash
node scripts/create-admin.js
```

Output:
```
============================================================
C2PA Generator - Admin User Creation
============================================================

Initializing database...
✓ Database initialized

============================================================
Create Admin User Account
============================================================

Email address: admin@company.com
Password (min 8 characters): ********
Confirm password: ********
Password strength: Good
Full name (optional): John Admin

------------------------------------------------------------
Please confirm the following information:
------------------------------------------------------------
Email:    admin@company.com
Name:     John Admin
Role:     admin
------------------------------------------------------------

Create this admin user? (yes/no): yes

============================================================
Admin User Created Successfully!
============================================================

✓ Admin user created successfully!
  Email:      admin@company.com
  Name:       John Admin
  Role:       admin
  User ID:    550e8400-e29b-41d4-a716-446655440000
  Created:    2025-01-20T10:30:00.000Z

============================================================
Next Steps
============================================================

1. Use these credentials to log in to the application
2. Access admin-only features:
   - Configure AI settings (OpenWebUI, API keys)
   - Index GitHub repositories for RAG
   - Manage application settings
3. Create additional user accounts as needed
```

#### Update existing admin password

If an admin user already exists, the script will offer to update the password:

```bash
node scripts/create-admin.js --email admin@company.com --password "NewSecurePass123!"
```

Output:
```
User admin@company.com already exists and is an admin.
Update password for this user? (yes/no): yes

✓ Admin user password updated successfully!
  Email: admin@company.com
  Role:  admin
```

#### Promote existing user to admin

If a regular user exists, the script will offer to promote them:

```bash
node scripts/create-admin.js --email user@company.com --password "SecurePass123!"
```

Output:
```
User user@company.com already exists with role: user
Promote this user to admin? (yes/no): yes

✓ User promoted to admin successfully!
  Email: user@company.com
  Role:  admin
```

### Security Considerations

- Never commit passwords in scripts or environment files
- Use strong, unique passwords for admin accounts
- Store admin credentials in a password manager
- Rotate admin passwords regularly
- Limit the number of admin users
- Use environment variables for automated deployments
- Consider using secret management tools in production

### Troubleshooting

#### "User already exists"
The email is already registered. The script will offer to update the password or promote to admin.

#### "Invalid email format"
Ensure the email address is in valid format: `user@domain.com`

#### "Password must be at least 8 characters"
Use a longer password that meets the strength requirements.

#### "Database error"
Ensure the backend can connect to the SQLite database. Check file permissions on `data/app.db`.

#### Permission denied
Make sure the script is executable:
```bash
chmod +x scripts/create-admin.js
```

### Docker Usage

To run inside the Docker container:

```bash
docker-compose exec backend node scripts/create-admin.js
```

Or with environment variables:

```bash
docker-compose exec \
  -e ADMIN_EMAIL="admin@example.com" \
  -e ADMIN_PASSWORD="SecurePass123!" \
  backend node scripts/create-admin.js
```

### CI/CD Integration

For automated deployments, use environment variables:

```yaml
# Example GitHub Actions workflow
- name: Create admin user
  env:
    ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}
    ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
  run: |
    cd backend
    node scripts/create-admin.js
```

### Admin Privileges

Admin users have access to:

- **AI Configuration**
  - Configure OpenWebUI connection
  - Manage AI provider settings
  - Set API keys

- **GitHub RAG Management**
  - Authenticate with GitHub
  - Index repositories for RAG
  - Delete indexed repositories
  - Manage GitHub tokens

- **Application Settings**
  - Update application configuration
  - Complete/reset onboarding
  - Manage all settings

- **User Management** (future)
  - Create/edit/delete users
  - Assign roles
  - View user activity

### Related Documentation

- [Authentication TDD Strategy](../../docs/AUTH_TDD_STRATEGY.md) - Complete authentication implementation guide
- [Backend README](../README.md) - Backend setup and configuration
- [API Documentation](../../docs/API.md) - API endpoints reference
