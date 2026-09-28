/**
 * API Login Test Data
 * Contains test data for API login scenarios
 */

export const ApiLoginTestData = {
  // Valid credentials
  validCredentials: {
    email: 'demo@demowebshop.com',
    password: 'demo',
  },

  // Invalid email scenarios
  invalidEmails: [
    'invalid@example.com',
    'notregistered@test.com',
    'fake.user@mail.com',
    '',
    'plainaddress',
    'user@.com',
    '@nodomain.com',
  ],

  // Invalid password scenarios
  invalidPasswords: [
    'wrongpassword',
    'WrongPass123!',
    'test',
    '',
    '123456',
    'password',
    'Password@1',
  ],

  // SQL injection attempts
  sqlInjectionPayloads: [
    { email: "' OR '1'='1", password: "' OR '1'='1" },
    { email: "admin' --", password: "anything" },
    { email: "' OR 1=1 --", password: "' OR 1=1 --" },
  ],

  // XSS attempts
  xssPayloads: [
    { email: '<script>alert("xss")</script>', password: '<img src=x onerror="alert(\'xss\')">' },
    { email: '"><script>alert("xss")</script>', password: 'password' },
  ],

  // Edge cases
  edgeCases: {
    emptyEmail: '',
    emptyPassword: '',
    nullEmail: null,
    nullPassword: null,
    undefinedEmail: undefined,
    undefinedPassword: undefined,
    spaceEmail: '   ',
    spacePassword: '   ',
    veryLongEmail: 'a'.repeat(1000) + '@example.com',
    veryLongPassword: 'a'.repeat(1000),
    specialCharPassword: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    unicodeEmail: 'tëst@éxämplé.com',
    unicodePassword: 'Pässwörd@123',
  },

  // Required field validations
  requiredFieldTests: [
    { email: '', password: 'Test@123', expectedError: 'Email is required' },
    { email: 'test@example.com', password: '', expectedError: 'Password is required' },
    { email: '', password: '', expectedError: 'required' },
  ],

  // Response validation data
  expectedResponseFields: {
    successResponse: ['token', 'email', 'userId'],
    errorResponse: ['error', 'message', 'statusCode'],
  },

  // Common error messages
  errorMessages: {
    invalidCredentials: 'Invalid credentials',
    userNotFound: 'User not found',
    accountLocked: 'Account is locked',
    invalidEmail: 'Invalid email format',
    passwordTooShort: 'Password must be at least',
    requiredField: 'required',
    tooManyAttempts: 'Too many login attempts',
  },

  // JWT token test data
  jwtToken: {
    validFormat: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  },

  // Rate limiting scenarios
  rateLimitTests: {
    maxAttempts: 5,
    lockoutDuration: 900, // 15 minutes in seconds
  },

  // Session timeout scenarios
  sessionTimeoutTests: {
    tokenExpiry: 3600, // 1 hour in seconds
  },
};

/**
 * Helper function to generate random invalid credentials
 */
export function generateRandomInvalidCredentials() {
  return {
    email: `test${Math.random().toString(36).substring(7)}@fakeemail.com`,
    password: `RandomPass${Math.random().toString(36).substring(7)}`,
  };
}

/**
 * Helper function to generate test user data
 */
export function generateTestUser(baseEmail: string = 'test') {
  const timestamp = Date.now();
  return {
    email: `${baseEmail}${timestamp}@example.com`,
    password: `TestPass${timestamp}!`,
    firstName: 'Test',
    lastName: 'User',
  };
}
