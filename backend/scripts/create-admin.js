#!/usr/bin/env node

/**
 * Admin User Creation Script
 *
 * Creates an admin user account for the C2PA Generator Product application.
 * Can be run interactively or with command-line arguments.
 *
 * Usage:
 *   Interactive mode:
 *     node scripts/create-admin.js
 *
 *   Command-line mode:
 *     node scripts/create-admin.js --email admin@example.com --password SecurePass123! --name "Admin User"
 *
 *   Non-interactive overwrite mode:
 *     node scripts/create-admin.js --email admin@example.com --password SecurePass123! --name "Admin User" --force
 *     node scripts/create-admin.js --email admin@example.com --password SecurePass123! --name "Admin User" --yes
 *
 *   Environment variable mode:
 *     ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=SecurePass123! ADMIN_NAME="Admin User" node scripts/create-admin.js
 *     ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=SecurePass123! ADMIN_NAME="Admin User" ADMIN_FORCE=true node scripts/create-admin.js
 */

const readline = require('readline');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Import User model and database
const User = require('../src/models/user');
const { initDatabase } = require('../src/models/database');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Helper function to print colored messages
function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to print section headers
function printHeader(message) {
  console.log('\n' + '='.repeat(60));
  print(message, 'cyan');
  console.log('='.repeat(60) + '\n');
}

// Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const value = args[i + 1];

      // Handle flags without values (like --force, --yes)
      if (!value || value.startsWith('--')) {
        parsed[key] = true;
      } else {
        parsed[key] = value;
        i++; // Skip next arg since we used it as value
      }
    }
  }

  return parsed;
}

// Create readline interface for interactive prompts
function createReadline() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

// Prompt user for input
function prompt(rl, question) {
  return new Promise((resolve) => {
    rl.question(`${colors.bright}${question}${colors.reset} `, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Prompt for password (hidden input)
function promptPassword(rl, question) {
  return new Promise((resolve) => {
    const stdin = process.stdin;

    let password = '';
    let isResolved = false;

    // Write the question
    process.stdout.write(`${colors.bright}${question}${colors.reset} `);

    // Hide input
    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }

    const onData = (char) => {
      if (isResolved) return;

      char = char.toString();

      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl-D
          isResolved = true;
          if (stdin.isTTY) {
            stdin.setRawMode(false);
          }
          stdin.removeListener('data', onData);
          console.log(''); // New line after password
          resolve(password);
          break;
        case '\u0003': // Ctrl-C
          print('\n\nOperation cancelled by user.', 'yellow');
          if (stdin.isTTY) {
            stdin.setRawMode(false);
          }
          process.exit(0);
          break;
        case '\u007F': // Backspace
        case '\b': // Backspace (alternative)
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          // Filter out control characters
          if (char.charCodeAt(0) >= 32) {
            password += char;
            process.stdout.write('*');
          }
          break;
      }
    };

    stdin.on('data', onData);
  });
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
function isValidPassword(password) {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strength = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

  if (strength < 3) {
    return {
      valid: false,
      message: 'Password should contain at least 3 of: uppercase, lowercase, numbers, special characters'
    };
  }

  return { valid: true, message: 'Password strength: Good' };
}

// Interactive mode: collect user information
async function collectUserInfo() {
  const rl = createReadline();
  const userInfo = {};

  printHeader('Create Admin User Account');

  // Get email
  while (true) {
    userInfo.email = await prompt(rl, 'Email address:');

    if (!userInfo.email) {
      print('Email is required.', 'red');
      continue;
    }

    if (!isValidEmail(userInfo.email)) {
      print('Invalid email format. Please try again.', 'red');
      continue;
    }

    break;
  }

  // Get password
  while (true) {
    userInfo.password = await promptPassword(rl, 'Password (min 8 characters):');

    if (!userInfo.password) {
      print('Password is required.', 'red');
      continue;
    }

    const validation = isValidPassword(userInfo.password);
    if (!validation.valid) {
      print(validation.message, 'red');
      continue;
    }

    // Confirm password
    const confirmPassword = await promptPassword(rl, 'Confirm password:');

    if (userInfo.password !== confirmPassword) {
      print('Passwords do not match. Please try again.', 'red');
      continue;
    }

    print(validation.message, 'green');
    break;
  }

  // Get name (optional)
  userInfo.name = await prompt(rl, 'Full name (optional):');

  rl.close();

  return userInfo;
}

// Confirm user information
async function confirmUserInfo(userInfo) {
  const rl = createReadline();

  console.log('\n' + '-'.repeat(60));
  print('Please confirm the following information:', 'cyan');
  console.log('-'.repeat(60));
  print(`Email:    ${userInfo.email}`, 'bright');
  print(`Name:     ${userInfo.name || '(not provided)'}`, 'bright');
  print(`Role:     admin`, 'bright');
  console.log('-'.repeat(60) + '\n');

  const answer = await prompt(rl, 'Create this admin user? (yes/no):');
  rl.close();

  return answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y';
}

// Create admin user in database
async function createAdminUser(userInfo, forceOverwrite = false) {
  try {
    // Check if user already exists
    const existingUser = await User.findByEmail(userInfo.email);

    if (existingUser) {
      // User exists - show current info and ask to overwrite
      print(`\nUser account already exists for ${userInfo.email}`, 'yellow');
      console.log('-'.repeat(60));
      print(`Current Information:`, 'cyan');
      print(`  Email:      ${existingUser.email}`, 'dim');
      print(`  Name:       ${existingUser.name || '(not set)'}`, 'dim');
      print(`  Role:       ${existingUser.role}`, 'dim');
      print(`  User ID:    ${existingUser.id}`, 'dim');
      print(`  Created:    ${existingUser.created_at}`, 'dim');
      console.log('-'.repeat(60));
      print(`New Information:`, 'cyan');
      print(`  Email:      ${userInfo.email}`, 'dim');
      print(`  Name:       ${userInfo.name || '(not provided)'}`, 'dim');
      print(`  Role:       admin`, 'dim');
      print(`  Password:   [will be updated]`, 'dim');
      console.log('-'.repeat(60));

      let shouldOverwrite = forceOverwrite;

      // Ask for confirmation if not forced
      if (!forceOverwrite) {
        const rl = createReadline();
        const answer = await prompt(rl, 'Overwrite this user account and set as admin? (yes/no):');
        rl.close();
        shouldOverwrite = answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y';
      } else {
        print('Force overwrite enabled - skipping confirmation', 'yellow');
      }

      if (shouldOverwrite) {
        // Update existing user - overwrite with new info
        await User.update(existingUser.id, {
          role: 'admin',
          password: userInfo.password,
          name: userInfo.name || existingUser.name
        });

        print(`\n✓ User account overwritten and set as admin successfully!`, 'green');
        print(`  Email:      ${userInfo.email}`, 'dim');
        print(`  Name:       ${userInfo.name || existingUser.name}`, 'dim');
        print(`  Role:       admin`, 'dim');
        print(`  Updated:    ${new Date().toISOString()}`, 'dim');
      } else {
        print('\nNo changes made. User account was not modified.', 'yellow');
      }

      return;
    }

    // Create new admin user
    const user = await User.create({
      email: userInfo.email,
      password: userInfo.password,
      name: userInfo.name || null,
      role: 'admin'
    });

    printHeader('Admin User Created Successfully!');
    print(`✓ Admin user created successfully!`, 'green');
    print(`  Email:      ${user.email}`, 'dim');
    print(`  Name:       ${user.name || '(not provided)'}`, 'dim');
    print(`  Role:       ${user.role}`, 'dim');
    print(`  User ID:    ${user.id}`, 'dim');
    print(`  Created:    ${user.created_at}`, 'dim');
    console.log('');

    // Print next steps
    printHeader('Next Steps');
    print('1. Use these credentials to log in to the application', 'cyan');
    print('2. Access admin-only features:', 'cyan');
    print('   - Configure AI settings (OpenWebUI, API keys)', 'dim');
    print('   - Index GitHub repositories for RAG', 'dim');
    print('   - Manage application settings', 'dim');
    print('3. Create additional user accounts as needed', 'cyan');
    console.log('');

  } catch (error) {
    print('\n✗ Error creating admin user:', 'red');
    print(`  ${error.message}`, 'red');
    throw error;
  }
}

// Main function
async function main() {
  try {
    printHeader('C2PA Generator - Admin User Creation');

    // Initialize database
    print('Initializing database...', 'dim');
    await initDatabase();
    print('✓ Database initialized\n', 'green');

    let userInfo;

    // Check for command-line arguments
    const args = parseArgs();

    // Check for environment variables
    const envEmail = process.env.ADMIN_EMAIL;
    const envPassword = process.env.ADMIN_PASSWORD;
    const envName = process.env.ADMIN_NAME;
    const envForce = process.env.ADMIN_FORCE === 'true';

    // Check for force/yes flag
    const forceOverwrite = args.force || args.yes || envForce;

    if (args.email && args.password) {
      // Command-line mode
      print('Using command-line arguments...', 'dim');
      if (forceOverwrite) {
        print('Force overwrite enabled', 'yellow');
      }
      userInfo = {
        email: args.email,
        password: args.password,
        name: args.name || ''
      };

      // Validate
      if (!isValidEmail(userInfo.email)) {
        print('✗ Invalid email format', 'red');
        process.exit(1);
      }

      const passwordValidation = isValidPassword(userInfo.password);
      if (!passwordValidation.valid) {
        print(`✗ ${passwordValidation.message}`, 'red');
        process.exit(1);
      }
    } else if (envEmail && envPassword) {
      // Environment variable mode
      print('Using environment variables...', 'dim');
      if (forceOverwrite) {
        print('Force overwrite enabled', 'yellow');
      }
      userInfo = {
        email: envEmail,
        password: envPassword,
        name: envName || ''
      };

      // Validate
      if (!isValidEmail(userInfo.email)) {
        print('✗ Invalid email format', 'red');
        process.exit(1);
      }

      const passwordValidation = isValidPassword(userInfo.password);
      if (!passwordValidation.valid) {
        print(`✗ ${passwordValidation.message}`, 'red');
        process.exit(1);
      }
    } else {
      // Interactive mode
      userInfo = await collectUserInfo();

      // Confirm
      const confirmed = await confirmUserInfo(userInfo);

      if (!confirmed) {
        print('\nOperation cancelled by user.', 'yellow');
        process.exit(0);
      }
    }

    // Create admin user (with force flag if specified)
    await createAdminUser(userInfo, forceOverwrite);

  } catch (error) {
    print('\n✗ Fatal error:', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  print('\n\nOperation cancelled by user.', 'yellow');
  process.exit(0);
});

// Run main function
main();
