import { test, expect } from '@playwright/test';
import { API_BASE_URL } from '../config/config';
import { ApiExecutor, LoginService, ResponseValidator, LoginResponse } from '../api';
import { UserConfig } from '../config/user';
import { ApiLoginTestData, generateRandomInvalidCredentials } from '../testdata/api-login.data';

test.describe('API Login Test Suite', () => {
  let executor: ApiExecutor;
  let loginService: LoginService;
  let authToken: string;

  /**
   * Setup: Initialize API executor before all tests
   */
  test.beforeAll(async () => {
    executor = new ApiExecutor({ baseUrl: API_BASE_URL });
    await executor.init();
    loginService = new LoginService(executor);
  });

  /**
   * Teardown: Close API executor after all tests
   */
  test.afterAll(async () => {
    await executor.close();
  });

  test.describe('Successful Login Scenarios', () => {
    test('API-L1: Should successfully login with valid credentials', async () => {
      // Execute
      const response = await loginService.login(
        UserConfig.apiUser.email,
        UserConfig.apiUser.password
      );

      // Validate status
      ResponseValidator.validateStatus(response.status, 200);
      ResponseValidator.validateSuccess(response.status);

      // Validate response has token
      expect(response.body).toBeDefined();
      const token =
        response.body.token ||
        response.body.accessToken ||
        response.body.auth_token ||
        '';
      expect(token).toBeTruthy();
      authToken = token;

      // Validate response has user email
      ResponseValidator.validateHasKey(response.body, 'email');
      expect(response.body.email).toBe(UserConfig.apiUser.email);
    });

    test('API-L2: Login response should contain valid JWT token', async () => {
      // Execute
      const response = await loginService.login(
        UserConfig.apiUser.email,
        UserConfig.apiUser.password
      );

      // Extract token
      const token =
        response.body.token ||
        response.body.accessToken ||
        response.body.auth_token ||
        '';

      // Validate JWT format (xxx.yyy.zzz)
      const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
      expect(jwtRegex.test(token)).toBe(true);
    });

    test('API-L3: Login response should contain all required fields', async () => {
      // Execute
      const response = await loginService.login(
        UserConfig.apiUser.email,
        UserConfig.apiUser.password
      );

      // Validate required fields
      ResponseValidator.validateHasKeys(response.body, ['email']);
      const hasToken =
        response.body.token ||
        response.body.accessToken ||
        response.body.auth_token;
      expect(hasToken).toBeTruthy();
    });

    test('API-L4: Login response headers should be correct', async () => {
      // Execute
      const response = await loginService.login(
        UserConfig.apiUser.email,
        UserConfig.apiUser.password
      );

      // Validate headers
      expect(response.headers).toBeDefined();
      expect(response.ok).toBe(true);
    });
  });

  test.describe('Failed Login Scenarios - Invalid Credentials', () => {
    test('API-L5: Should fail login with invalid email', async () => {
      // Execute
      const response = await loginService.login(
        'invalid.email@notexist.com',
        UserConfig.apiUser.password
      );

      // Validate error status (400 or 401)
      expect(
        response.status === 400 || response.status === 401 || response.status === 403
      ).toBe(true);

      // Validate error response
      const hasError =
        response.body.error ||
        response.body.message ||
        response.body.errors;
      expect(hasError).toBeTruthy();

      // Validate no token in error response
      const hasToken =
        response.body.token ||
        response.body.accessToken ||
        response.body.auth_token;
      expect(hasToken).toBeFalsy();
    });

    test('API-L6: Should fail login with invalid password', async () => {
      // Execute
      const response = await loginService.login(
        UserConfig.apiUser.email,
        'wrongpassword123'
      );

      // Validate error status
      expect(
        response.status === 400 || response.status === 401 || response.status === 403
      ).toBe(true);

      // Validate error message
      expect(
        response.body.error ||
        response.body.message ||
        response.body.errors
      ).toBeTruthy();
    });

    test('API-L7: Should fail login with both invalid credentials', async () => {
      // Execute
      const invalidCreds = generateRandomInvalidCredentials();
      const response = await loginService.login(
        invalidCreds.email,
        invalidCreds.password
      );

      // Validate error
      expect(response.status).not.toBe(200);
      expect(
        response.body.error ||
        response.body.message ||
        response.body.errors
      ).toBeTruthy();
    });
  });

  test.describe('Failed Login Scenarios - Empty Fields', () => {
    test('API-L8: Should fail login with empty email', async () => {
      // Execute
      const response = await loginService.loginWithPayload({
        email: '',
        password: UserConfig.apiUser.password,
      });

      // Validate error
      expect(response.status).toBe(400);
      expect(response.body.error || response.body.errors).toBeTruthy();
    });

    test('API-L9: Should fail login with empty password', async () => {
      // Execute
      const response = await loginService.loginWithPayload({
        email: UserConfig.apiUser.email,
        password: '',
      });

      // Validate error
      expect(response.status).toBe(400);
      expect(response.body.error || response.body.errors).toBeTruthy();
    });

    test('API-L10: Should fail login with both empty fields', async () => {
      // Execute
      const response = await loginService.loginWithPayload({
        email: '',
        password: '',
      });

      // Validate error
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeTruthy();
    });
  });

  test.describe('Login Security Tests', () => {
    test('API-L11: Should not expose sensitive information on failed login', async () => {
      // Execute
      const response = await loginService.login(
        'nonexistent@example.com',
        'anypassword'
      );

      // Validate: Should not return password or other sensitive data
      const responseString = JSON.stringify(response.body);
      expect(responseString).not.toContain('password');
      expect(responseString).not.toContain(UserConfig.apiUser.password);
    });

    test('API-L12: Should reject SQL injection attempts', async () => {
      // Execute
      const sqlInjection = ApiLoginTestData.sqlInjectionPayloads[0];
      const response = await loginService.loginWithPayload(sqlInjection);

      // Validate: Should reject, not execute query
      expect(response.status).not.toBe(200);
      expect(
        response.body.error ||
        response.body.message ||
        response.body.errors
      ).toBeTruthy();
    });

    test('API-L13: Should reject XSS attempts in email field', async () => {
      // Execute
      const xssPayload = ApiLoginTestData.xssPayloads[0];
      const response = await loginService.loginWithPayload(xssPayload);

      // Validate: Should reject
      expect(response.status).not.toBe(200);
      expect(response.body.error || response.body.errors).toBeTruthy();
    });
  });

  test.describe('Login Response Format Tests', () => {
    test('API-L14: Success login response should be valid JSON', async () => {
      // Execute
      const response = await loginService.login(
        UserConfig.apiUser.email,
        UserConfig.apiUser.password
      );

      // Validate JSON
      expect(typeof response.body).toBe('object');
      expect(response.body).not.toBeNull();
    });

    test('API-L15: Error login response should contain error details', async () => {
      // Execute
      const response = await loginService.login(
        'invalid@example.com',
        'invalidpass'
      );

      // Validate error details
      const body = response.body;
      const hasErrorInfo =
        body.error ||
        body.message ||
        body.errors ||
        body.errorMessage;
      expect(hasErrorInfo).toBeTruthy();
    });
  });

  test.describe('Login Edge Cases', () => {
    test('API-L16: Should handle special characters in password', async () => {
      // Execute - using test data with special characters
      const response = await loginService.loginWithPayload({
        email: UserConfig.apiUser.email,
        password: ApiLoginTestData.edgeCases.specialCharPassword,
      });

      // Should process request (may fail auth validation)
      expect(response.status).toBeDefined();
      expect(response.body).toBeDefined();
    });

    test('API-L17: Should handle unicode characters gracefully', async () => {
      // Execute
      const response = await loginService.loginWithPayload({
        email: ApiLoginTestData.edgeCases.unicodeEmail,
        password: ApiLoginTestData.edgeCases.unicodePassword,
      });

      // Should process request and return error (not 500)
      expect(response.status).not.toBe(500);
      expect(response.status).not.toBe(null);
    });

    test('API-L18: Should handle very long email gracefully', async () => {
      // Execute
      const response = await loginService.loginWithPayload({
        email: ApiLoginTestData.edgeCases.veryLongEmail,
        password: UserConfig.apiUser.password,
      });

      // Should not crash - should return validation error
      expect(response.status).not.toBe(500);
    });
  });

  test.describe('Token Validation Tests', () => {
    test('API-L19: Should verify token with valid token', async () => {
      // First login to get token
      const loginResponse = await loginService.login(
        UserConfig.apiUser.email,
        UserConfig.apiUser.password
      );

      const token =
        loginResponse.body.token ||
        loginResponse.body.accessToken ||
        loginResponse.body.auth_token ||
        '';

      // Verify token
      const verifyResponse = await loginService.verifyToken(token);

      // Token should be valid
      expect(verifyResponse.status).toBe(200);
    });

    test('API-L20: Should reject verification with invalid token', async () => {
      // Execute with invalid token
      const response = await loginService.verifyToken('invalid.token.here');

      // Should return error
      expect(response.status).not.toBe(200);
    });
  });

  test.describe('Login Workflow Tests', () => {
    test('API-L21: Complete login workflow - login and verify token', async () => {
      // Step 1: Login
      const loginResponse = await loginService.login(
        UserConfig.apiUser.email,
        UserConfig.apiUser.password
      );

      expect(loginResponse.status).toBe(200);

      const token =
        loginResponse.body.token ||
        loginResponse.body.accessToken ||
        loginResponse.body.auth_token ||
        '';
      expect(token).toBeTruthy();

      // Step 2: Verify token
      const verifyResponse = await loginService.verifyToken(token);
      expect(verifyResponse.status).toBe(200);

      // Step 3: Logout
      const logoutResponse = await loginService.logout(token);
      expect(logoutResponse.status).toBeLessThan(500);
    });
  });
});

