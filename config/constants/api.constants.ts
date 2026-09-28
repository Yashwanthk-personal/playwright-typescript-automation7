/**
 * API Constants
 * Contains endpoints, status codes, headers, and error messages for API testing
 */

export const API_CONSTANTS = {
  // ==================== HTTP METHODS ====================
  HTTP_METHODS: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
    HEAD: 'HEAD',
    OPTIONS: 'OPTIONS',
  },

  // ==================== HTTP STATUS CODES ====================
  STATUS_CODES: {
    // 2xx Success
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,

    // 3xx Redirection
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    NOT_MODIFIED: 304,
    TEMPORARY_REDIRECT: 307,

    // 4xx Client Error
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,

    // 5xx Server Error
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
  },

  // ==================== HTTP HEADERS ====================
  HEADERS: {
    // Content Type
    CONTENT_TYPE_JSON: 'application/json',
    CONTENT_TYPE_FORM: 'application/x-www-form-urlencoded',
    CONTENT_TYPE_MULTIPART: 'multipart/form-data',
    CONTENT_TYPE_XML: 'application/xml',
    CONTENT_TYPE_TEXT: 'text/plain',
    CONTENT_TYPE_HTML: 'text/html',

    // Authorization
    BEARER_TOKEN: 'Bearer',
    BASIC_AUTH: 'Basic',

    // Common Headers
    ACCEPT: 'accept',
    AUTHORIZATION: 'authorization',
    CONTENT_LENGTH: 'content-length',
    CONTENT_TYPE: 'content-type',
    USER_AGENT: 'user-agent',
    ACCEPT_ENCODING: 'accept-encoding',
    CACHE_CONTROL: 'cache-control',
    CONNECTION: 'connection',
    HOST: 'host',
    REFERER: 'referer',
    ORIGIN: 'origin',

    // CORS
    ACCESS_CONTROL_ALLOW_ORIGIN: 'access-control-allow-origin',
    ACCESS_CONTROL_ALLOW_METHODS: 'access-control-allow-methods',
    ACCESS_CONTROL_ALLOW_HEADERS: 'access-control-allow-headers',

    // Custom
    X_REQUEST_ID: 'x-request-id',
    X_CORRELATION_ID: 'x-correlation-id',
    X_API_VERSION: 'x-api-version',
  },

  // ==================== API ENDPOINTS ====================
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REGISTER: '/auth/register',
      REFRESH_TOKEN: '/auth/refresh',
      VERIFY_EMAIL: '/auth/verify-email',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },

    // Users
    USERS: {
      GET_ALL: '/users',
      GET_BY_ID: '/users/{id}',
      CREATE: '/users',
      UPDATE: '/users/{id}',
      DELETE: '/users/{id}',
      GET_PROFILE: '/users/profile',
      UPDATE_PROFILE: '/users/profile',
    },

    // Products
    PRODUCTS: {
      GET_ALL: '/products',
      GET_BY_ID: '/products/{id}',
      CREATE: '/products',
      UPDATE: '/products/{id}',
      DELETE: '/products/{id}',
      SEARCH: '/products/search',
      GET_CATEGORIES: '/products/categories',
    },

    // Cart
    CART: {
      GET: '/cart',
      ADD_ITEM: '/cart/items',
      UPDATE_ITEM: '/cart/items/{id}',
      REMOVE_ITEM: '/cart/items/{id}',
      CLEAR: '/cart/clear',
    },

    // Orders
    ORDERS: {
      GET_ALL: '/orders',
      GET_BY_ID: '/orders/{id}',
      CREATE: '/orders',
      UPDATE: '/orders/{id}',
      CANCEL: '/orders/{id}/cancel',
    },

    // Wishlist
    WISHLIST: {
      GET: '/wishlist',
      ADD_ITEM: '/wishlist/items',
      REMOVE_ITEM: '/wishlist/items/{id}',
      CLEAR: '/wishlist/clear',
    },
  },

  // ==================== TIMEOUT VALUES ====================
  TIMEOUTS: {
    SHORT: 5000,
    MEDIUM: 15000,
    LONG: 30000,
    EXTRA_LONG: 60000,
    REQUEST_TIMEOUT: 30000,
  },

  // ==================== RETRY CONFIGURATION ====================
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 1000, // ms
    MAX_DELAY: 10000, // ms
    BACKOFF_MULTIPLIER: 2,
    RETRYABLE_STATUS_CODES: [408, 429, 500, 502, 503, 504],
  },

  // ==================== ERROR MESSAGES ====================
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
    BAD_REQUEST: 'Bad request',
    VALIDATION_ERROR: 'Validation error',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    SERVICE_UNAVAILABLE: 'Service unavailable',
    TIMEOUT: 'Request timeout',
    NETWORK_ERROR: 'Network error',
  },

  // ==================== SUCCESS MESSAGES ====================
  SUCCESS_MESSAGES: {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    RETRIEVED: 'Resource retrieved successfully',
  },

  // ==================== FIELD TYPES ====================
  FIELD_TYPES: {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    ARRAY: 'array',
    OBJECT: 'object',
    DATE: 'date',
    UUID: 'uuid',
    EMAIL: 'email',
    URL: 'url',
  },

  // ==================== RESPONSE STRUCTURE ====================
  RESPONSE_STRUCTURE: {
    SUCCESS: {
      status: 'success',
      code: 200,
    },
    ERROR: {
      status: 'error',
      code: 400,
    },
  },

  // ==================== DEFAULT REQUEST BODY ====================
  DEFAULT_PAYLOADS: {
    EMPTY_BODY: {},
    EMPTY_ARRAY: [],
  },

  // ==================== CONTENT TYPES ====================
  CONTENT_TYPES: {
    JSON: 'application/json',
    FORM_URLENCODED: 'application/x-www-form-urlencoded',
    MULTIPART_FORM: 'multipart/form-data',
    XML: 'application/xml',
    TEXT: 'text/plain',
    HTML: 'text/html',
  },
} as const;

export type APIConstants = typeof API_CONSTANTS;
