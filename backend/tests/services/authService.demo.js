/**
 * Authentication Service Demonstration
 *
 * This script demonstrates the authService functionality including:
 * - Password hashing and verification
 * - JWT token generation
 * - Token verification and decoding
 */

const authService = require('../../src/services/authService');

async function demonstrateAuthService() {
  console.log('========================================');
  console.log('AUTHENTICATION SERVICE DEMONSTRATION');
  console.log('========================================\n');

  // 1. Password Hashing
  console.log('1. PASSWORD HASHING');
  console.log('-------------------');
  const password = 'MySecurePassword123!';
  console.log('Original Password:', password);

  const hash = await authService.hashPassword(password);
  console.log('Hashed Password:', hash);
  console.log('Hash Length:', hash.length, 'characters');

  const isValid = await authService.verifyPassword(password, hash);
  console.log('Password Verification (correct):', isValid);

  const isInvalid = await authService.verifyPassword('WrongPassword', hash);
  console.log('Password Verification (incorrect):', isInvalid);
  console.log();

  // 2. JWT Token Generation
  console.log('2. JWT TOKEN GENERATION');
  console.log('-----------------------');
  const user = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'admin@example.com',
    role: 'admin',
    name: 'Admin User' // This won't be included in token
  };

  console.log('User Object:', JSON.stringify(user, null, 2));

  const token = authService.generateToken(user);
  console.log('\nGenerated Token:');
  console.log(token);
  console.log('\nToken Length:', token.length, 'characters');
  console.log('Token Parts:', token.split('.').length);
  console.log();

  // 3. Token Verification and Decoding
  console.log('3. TOKEN VERIFICATION AND DECODING');
  console.log('-----------------------------------');
  const decoded = authService.verifyToken(token);
  console.log('Decoded Payload:', JSON.stringify(decoded, null, 2));

  // Calculate expiration time
  const issuedAt = new Date(decoded.iat * 1000);
  const expiresAt = new Date(decoded.exp * 1000);
  const duration = (decoded.exp - decoded.iat) / 86400; // Days

  console.log('\nToken Metadata:');
  console.log('- Issued At:', issuedAt.toISOString());
  console.log('- Expires At:', expiresAt.toISOString());
  console.log('- Duration:', duration, 'days');
  console.log();

  // 4. Custom Expiration
  console.log('4. CUSTOM TOKEN EXPIRATION');
  console.log('--------------------------');
  const shortLivedToken = authService.generateToken(user, { expiresIn: '1h' });
  const shortDecoded = authService.verifyToken(shortLivedToken);
  const shortDuration = (shortDecoded.exp - shortDecoded.iat) / 3600; // Hours

  console.log('1-Hour Token Duration:', shortDuration, 'hours');
  console.log('Short-lived Token Expires:', new Date(shortDecoded.exp * 1000).toISOString());
  console.log();

  // 5. Token Payload Structure
  console.log('5. TOKEN PAYLOAD STRUCTURE');
  console.log('--------------------------');
  console.log('Included in Token:');
  console.log('- id:', decoded.id);
  console.log('- email:', decoded.email);
  console.log('- role:', decoded.role);
  console.log('- iat (issued at):', decoded.iat);
  console.log('- exp (expires):', decoded.exp);
  console.log('\nNOT Included in Token:');
  console.log('- name: undefined (filtered out)');
  console.log('- password_hash: undefined (never included)');
  console.log();

  // 6. Error Handling
  console.log('6. ERROR HANDLING');
  console.log('-----------------');

  try {
    authService.verifyToken('invalid.token.here');
  } catch (error) {
    console.log('Invalid Token Error:', error.message);
  }

  try {
    const expiredToken = authService.generateToken(user, { expiresIn: '0s' });
    authService.verifyToken(expiredToken);
  } catch (error) {
    console.log('Expired Token Error:', error.message);
  }

  try {
    const tamperedToken = token.slice(0, -1) + 'X';
    authService.verifyToken(tamperedToken);
  } catch (error) {
    console.log('Tampered Token Error:', error.message);
  }

  console.log();
  console.log('========================================');
  console.log('DEMONSTRATION COMPLETE');
  console.log('========================================');
}

// Run demonstration
demonstrateAuthService().catch(console.error);
