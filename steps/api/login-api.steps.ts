import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ApiExecutor, LoginService, ResponseValidator, LoginResponse } from '../../api';
import { UserConfig } from '../../config/user';
import { API_BASE_URL } from '../../config/config';
import { TestDataLoader } from '../../utils';

let executor: ApiExecutor;
let loginService: LoginService;
let loginResponse: any;
let lastResponseStatus: number;
let currentTestData: any;

/**
 * Initialize API executor
 */
Given('API client is initialized', async function () {
  executor = new ApiExecutor({ baseUrl: API_BASE_URL });
  await executor.init();
  loginService = new LoginService(executor);
});

/**
 * Login with valid test data by index
 */
When('I send login request with valid test data index {int}', async function (index: number) {
  const validLogins = TestDataLoader.getApiLogin();
  const testData = validLogins[index - 1]; // Convert to 0-based index
  
  expect(testData).toBeDefined();
  currentTestData = testData;
  
  loginResponse = await loginService.login(testData.email, testData.password);
  lastResponseStatus = loginResponse.status;
  
  // Store in world context for shared access
  this.lastLoginResponse = loginResponse;
  this.lastResponseStatus = lastResponseStatus;
});

/**
 * Login with failed test data by index
 */
When('I send login request with failed login data index {int}', async function (index: number) {
  const failedLogins = TestDataLoader.getApiLoginFailures();
  const testData = failedLogins[index - 1]; // Convert to 0-based index
  
  expect(testData).toBeDefined();
  currentTestData = testData;
  
  loginResponse = await loginService.login(testData.email, testData.password);
  lastResponseStatus = loginResponse.status;
});

/**
 * Verify response status matches test data expectation
 */
Then('API response status should match test data expected status', async function () {
  expect(currentTestData).toBeDefined();
  expect(lastResponseStatus).toBe(currentTestData.expectedStatus);
});

/**
 * Successful login with valid credentials
 */
When('I send login request with valid credentials', async function () {
  loginResponse = await loginService.login(
    UserConfig.apiUser.email,
    UserConfig.apiUser.password
  );
  lastResponseStatus = loginResponse.status;
});

/**
 * Login with invalid email
 */
When('I send login request with invalid email {string} and valid password', async function (
  email: string
) {
  loginResponse = await loginService.login(email, UserConfig.apiUser.password);
  lastResponseStatus = loginResponse.status;
});

/**
 * Login with invalid password
 */
When('I send login request with valid email and invalid password {string}', async function (
  password: string
) {
  loginResponse = await loginService.login(UserConfig.apiUser.email, password);
  lastResponseStatus = loginResponse.status;
});

/**
 * Login with empty credentials
 */
When('I send login request with empty email and empty password', async function () {
  loginResponse = await loginService.loginWithPayload({
    email: '',
    password: '',
  });
  lastResponseStatus = loginResponse.status;
});

/**
 * Verify response status is 200
 */
Then('API response status should be 200', async function () {
  ResponseValidator.validateStatus(lastResponseStatus, 200);
});

/**
 * Verify response status is 400 or 401
 */
Then('API response status should be 400 or 401', async function () {
  expect(lastResponseStatus === 400 || lastResponseStatus === 401).toBe(true);
});

/**
 * Verify response status is 400
 */
Then('API response status should be 400', async function () {
  ResponseValidator.validateStatus(lastResponseStatus, 400);
});

/**
 * Verify authentication token exists
 */
Then('API response should contain authentication token', async function () {
  expect(loginResponse.body).toBeDefined();
  const hasToken =
    loginResponse.body.token ||
    loginResponse.body.accessToken ||
    loginResponse.body.auth_token ||
    loginResponse.body.access_token;
  expect(hasToken).toBeTruthy();
  
  // Store token for later use
  this.authToken = hasToken;
});

/**
 * Verify response contains user email
 */
Then('API response should have user email', async function () {
  ResponseValidator.validateHasKey(loginResponse.body, 'email');
  expect(loginResponse.body.email).toBeTruthy();
});

/**
 * Verify response does not have error message
 */
Then('API response should not have error message', async function () {
  expect(
    !loginResponse.body.error &&
      !loginResponse.body.message?.includes('error') &&
      !loginResponse.body.errors
  ).toBe(true);
});

/**
 * Verify error message exists
 */
Then('API response should contain error message', async function () {
  const hasError =
    loginResponse.body.error ||
    loginResponse.body.message ||
    loginResponse.body.errors ||
    loginResponse.body.errorMessage;
  expect(hasError).toBeTruthy();
});

/**
 * Verify token does not exist
 */
Then('API response should not contain authentication token', async function () {
  const hasToken =
    loginResponse.body.token ||
    loginResponse.body.accessToken ||
    loginResponse.body.auth_token ||
    loginResponse.body.access_token;
  expect(hasToken).toBeFalsy();
});

/**
 * Verify validation error
 */
Then('API response should contain validation error', async function () {
  const hasValidationError =
    loginResponse.body.errors ||
    loginResponse.body.validationErrors ||
    (Array.isArray(loginResponse.body.errors) && loginResponse.body.errors.length > 0);
  expect(hasValidationError).toBeTruthy();
});

/**
 * Verify required field error
 */
Then('API response should contain required field error', async function () {
  expect(loginResponse.body.errors || loginResponse.body.validationErrors).toBeTruthy();
});

/**
 * Verify all required fields exist in response
 */
Then('API response should contain all required fields', async function () {
  expect(loginResponse.body).toBeDefined();
  expect(loginResponse.body.email).toBeDefined();
  
  // Check for at least one token field
  const hasToken =
    loginResponse.body.token ||
    loginResponse.body.accessToken ||
    loginResponse.body.auth_token ||
    loginResponse.body.access_token;
  expect(hasToken).toBeDefined();
});

/**
 * Verify token exists or not based on test data expectation
 */
Then('API response should contain token if test data expects token', async function () {
  if (currentTestData?.expectToken) {
    expect(loginResponse.body).toBeDefined();
    const hasToken =
      loginResponse.body.token ||
      loginResponse.body.accessToken ||
      loginResponse.body.auth_token ||
      loginResponse.body.access_token;
    expect(hasToken).toBeTruthy();
    this.authToken = hasToken;
  }
});

/**
 * Verify error message based on test data expectation
 */
Then('API response error should match test data expected error', async function () {
  if (currentTestData?.expectedError) {
    const errorMsg =
      loginResponse.body.error ||
      loginResponse.body.message ||
      loginResponse.body.errorMessage ||
      loginResponse.body.errors?.[0];
    
    expect(errorMsg).toBeDefined();
    
    // Handle multiple possible error messages separated by |
    const possibleErrors = currentTestData.expectedError.split('|').map((e: string) => e.trim());
    const errorMatches = possibleErrors.some((expected: string) => 
      String(errorMsg).toLowerCase().includes(expected.toLowerCase())
    );
    
    expect(errorMatches).toBe(true);
  }
});

/**
 * Verify JWT token format
 */
Then('API response token should be valid JWT format', async function () {
  const token =
    loginResponse.body.token ||
    loginResponse.body.accessToken ||
    loginResponse.body.auth_token;
  
  expect(token).toBeTruthy();
  
  // JWT format: xxxx.yyyy.zzzz
  const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
  expect(jwtRegex.test(token)).toBe(true);
});

/**
 * Verify user details in response
 */
Then('API response should contain user details', async function () {
  expect(loginResponse.body.email).toBeDefined();
  expect(loginResponse.body.email).toBe(UserConfig.apiUser.email);
});

/**
 * Cleanup after tests
 */
Given('cleanup API resources', async function () {
  if (executor) {
    await executor.close();
  }
});

