/**
 * Login Service
 * Handles all authentication-related API operations
 */
import { BaseApiService } from './base.service';
import { ApiExecutor, ExecutionResponse } from '../core/executor';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  auth_token?: string;
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  message?: string;
  error?: string;
  errorMessage?: string;
  errors?: Record<string, string[]>;
}

/**
 * Login Service - Manages authentication operations
 */
export class LoginService extends BaseApiService {
  private endpoints = {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    register: '/api/auth/register',
    verifyToken: '/api/auth/verify',
    refreshToken: '/api/auth/refresh',
  };

  constructor(executor: ApiExecutor) {
    super(executor);
  }

  /**
   * Login with email and password
   * @param email - User email
   * @param password - User password
   * @returns Login response with token
   */
  async login(
    email: string,
    password: string
  ): Promise<ExecutionResponse<LoginResponse>> {
    const payload: LoginPayload = {
      email,
      password,
    };

    return this.methods.post<LoginResponse>(this.endpoints.login, payload, {
      headers: this.getJsonHeaders(),
    });
  }

  /**
   * Login with custom payload
   * Useful for testing edge cases and invalid data
   */
  async loginWithPayload(payload: any): Promise<ExecutionResponse<LoginResponse>> {
    return this.methods.post<LoginResponse>(this.endpoints.login, payload, {
      headers: this.getJsonHeaders(),
    });
  }

  /**
   * Logout user
   * @param token - Authentication token
   * @returns Logout response
   */
  async logout(token: string): Promise<ExecutionResponse<any>> {
    return this.methods.post(this.endpoints.logout, undefined, {
      headers: this.getAuthHeaders(token),
    });
  }

  /**
   * Register new user
   * @param email - User email
   * @param password - User password
   * @param firstName - User first name
   * @param lastName - User last name
   * @returns Registration response
   */
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<ExecutionResponse<LoginResponse>> {
    const payload = {
      email,
      password,
      firstName,
      lastName,
    };

    return this.methods.post<LoginResponse>(this.endpoints.register, payload, {
      headers: this.getJsonHeaders(),
    });
  }

  /**
   * Verify authentication token
   * @param token - Authentication token
   * @returns Token verification response
   */
  async verifyToken(token: string): Promise<ExecutionResponse<any>> {
    return this.methods.get(this.endpoints.verifyToken, {
      headers: this.getAuthHeaders(token),
    });
  }

  /**
   * Refresh authentication token
   * @param token - Current authentication token
   * @returns New token response
   */
  async refreshToken(token: string): Promise<ExecutionResponse<LoginResponse>> {
    return this.methods.post<LoginResponse>(this.endpoints.refreshToken, undefined, {
      headers: this.getAuthHeaders(token),
    });
  }

  /**
   * Get all auth endpoints
   */
  getEndpoints() {
    return { ...this.endpoints };
  }

  /**
   * Get specific endpoint
   */
  getEndpoint(name: keyof typeof this.endpoints): string {
    return this.endpoints[name];
  }
}
