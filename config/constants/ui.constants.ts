/**
 * UI Constants
 * Contains selectors, timeouts, messages, and paths for UI testing
 */

export const UI_CONSTANTS = {
  // ==================== TIMEOUT VALUES ====================
  TIMEOUTS: {
    SHORT: 5000,
    MEDIUM: 15000,
    LONG: 30000,
    EXTRA_LONG: 60000,
    NAVIGATION: 60000,
    ELEMENT_LOAD: 30000,
    IMPLICIT_WAIT: 5000,
  },

  // ==================== WAIT CONDITIONS ====================
  WAIT_CONDITIONS: {
    LOAD: 'load' as const,
    DOMCONTENTLOADED: 'domcontentloaded' as const,
    NETWORKIDLE: 'networkidle' as const,
    COMMIT: 'commit' as const,
  },

  // ==================== COMMON SELECTORS ====================
  SELECTORS: {
    // Navigation
    LOGIN_LINK: 'a[href*="login"]',
    LOGOUT_LINK: 'a[href*="logout"]',
    HOME_LINK: 'a[href*="home"]',
    ACCOUNT_LINK: 'a[href*="account"]',
    CART_LINK: 'a[href*="cart"]',

    // Search
    SEARCH_INPUT: '#small-searchterms',
    SEARCH_BUTTON: '.search-box-button',
    SEARCH_SUGGESTION: '.ui-autocomplete li',

    // Forms
    INPUT_TEXT: 'input[type="text"]',
    INPUT_EMAIL: 'input[type="email"]',
    INPUT_PASSWORD: 'input[type="password"]',
    CHECKBOX: 'input[type="checkbox"]',
    RADIO: 'input[type="radio"]',
    SELECT: 'select',
    BUTTON: 'button',
    FORM: 'form',

    // Messages
    SUCCESS_MESSAGE: '.message-success',
    ERROR_MESSAGE: '.message-error',
    WARNING_MESSAGE: '.message-warning',
    INFO_MESSAGE: '.message-info',

    // Tables
    TABLE: 'table',
    TABLE_ROW: 'tbody tr',
    TABLE_CELL: 'td',
    TABLE_HEADER: 'th',

    // Modals
    MODAL: '.modal',
    MODAL_CLOSE_BUTTON: '.modal-close',
  },

  // ==================== PAGE PATHS ====================
  PATHS: {
    HOME: '/',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    ACCOUNT: '/account',
    CART: '/cart',
    CHECKOUT: '/checkout',
    PRODUCTS: '/products',
    WISHLIST: '/wishlist',
    SEARCH: '/search',
  },

  // ==================== COMMON TEXT MESSAGES ====================
  MESSAGES: {
    SUCCESS: 'Success',
    ERROR: 'Error',
    WARNING: 'Warning',
    LOADING: 'Loading...',
    PLEASE_WAIT: 'Please wait...',
    NO_RESULTS: 'No results found',
    INVALID_INPUT: 'Invalid input',
    REQUIRED_FIELD: 'This field is required',
    SESSION_EXPIRED: 'Your session has expired',
    LOGIN_SUCCESSFUL: 'Login successful',
    LOGOUT_SUCCESSFUL: 'Logged out successfully',
  },

  // ==================== KEYBOARD SHORTCUTS ====================
  KEYS: {
    ENTER: 'Enter',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    SPACE: ' ',
    BACKSPACE: 'Backspace',
    DELETE: 'Delete',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
  },

  // ==================== COMMON ATTRIBUTES ====================
  ATTRIBUTES: {
    ID: 'id',
    CLASS: 'class',
    NAME: 'name',
    VALUE: 'value',
    PLACEHOLDER: 'placeholder',
    TYPE: 'type',
    HREF: 'href',
    SRC: 'src',
    ALT: 'alt',
    TITLE: 'title',
    ROLE: 'role',
    ARIA_LABEL: 'aria-label',
    DATA_TESTID: 'data-testid',
  },

  // ==================== VISUAL CONSTANTS ====================
  VISUAL: {
    DEFAULT_WIDTH: 1280,
    DEFAULT_HEIGHT: 720,
    MOBILE_WIDTH: 375,
    MOBILE_HEIGHT: 667,
    TABLET_WIDTH: 768,
    TABLET_HEIGHT: 1024,
    DESKTOP_WIDTH: 1920,
    DESKTOP_HEIGHT: 1080,
  },

  // ==================== ELEMENT STATES ====================
  STATES: {
    VISIBLE: 'visible',
    HIDDEN: 'hidden',
    DISABLED: 'disabled',
    ENABLED: 'enabled',
    FOCUSED: 'focused',
    CHECKED: 'checked',
    UNCHECKED: 'unchecked',
  },

  // ==================== VALIDATION PATTERNS ====================
  PATTERNS: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\d{10}$/,
    ZIP_CODE: /^\d{5}$/,
    URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  },
} as const;

export type UIConstants = typeof UI_CONSTANTS;
