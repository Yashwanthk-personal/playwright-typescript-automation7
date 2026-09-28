import * as fs from 'fs';
import * as path from 'path';

/**
 * Test Data Loader - Load and manage JSON test data with multi-user support
 */
export class TestDataLoader {
  private static readonly DATA_DIR = path.join(__dirname, '..', '..', 'testdata');
  private static readonly dataCache = new Map<string, any>();

  /**
   * Load test data from JSON file with caching
   */
  static loadData<T>(filename: string): T {
    if (this.dataCache.has(filename)) {
      return this.dataCache.get(filename) as T;
    }

    const filepath = path.join(this.DATA_DIR, filename);
    
    if (!fs.existsSync(filepath)) {
      throw new Error(`Test data file not found: ${filepath}`);
    }

    const data = fs.readFileSync(filepath, 'utf8');
    const parsedData = JSON.parse(data) as T;
    this.dataCache.set(filename, parsedData);
    return parsedData;
  }

  /**
   * Clear data cache (useful for test isolation)
   */
  static clearCache(): void {
    this.dataCache.clear();
  }

  /**
   * Load users test data
   */
  static loadUsers() {
    return this.loadData<any>('users.json');
  }

  /**
   * Get valid users
   */
  static getValidUsers() {
    return this.loadUsers().validUsers || [];
  }

  /**
   * Get a specific valid user by index
   */
  static getValidUserByIndex(index: number) {
    const users = this.getValidUsers();
    if (index < 0 || index >= users.length) {
      throw new Error(`User index ${index} out of range. Available users: ${users.length}`);
    }
    return users[index];
  }

  /**
   * Get a specific valid user by email
   */
  static getValidUserByEmail(email: string) {
    const users = this.getValidUsers();
    const user = users.find((u: any) => u.email === email);
    if (!user) {
      throw new Error(`User with email ${email} not found in valid users`);
    }
    return user;
  }

  /**
   * Get a random valid user
   */
  static getRandomValidUser() {
    return this.random(this.getValidUsers());
  }

  /**
   * Get multiple users for multi-user testing scenarios
   */
  static getMultipleValidUsers(count: number) {
    const users = this.getValidUsers();
    if (count > users.length) {
      throw new Error(`Requested ${count} users but only ${users.length} available`);
    }
    return this.take(users, count);
  }

  /**
   * Get invalid users
   */
  static getInvalidUsers() {
    return this.loadUsers().invalidUsers || [];
  }

  /**
   * Get a random invalid user
   */
  static getRandomInvalidUser() {
    return this.random(this.getInvalidUsers());
  }

  /**
   * Get edge case users
   */
  static getEdgeCaseUsers() {
    return this.loadUsers().edgeCaseUsers || [];
  }

  /**
   * Get invalid email formats
   */
  static getInvalidEmailFormats() {
    return this.loadUsers().invalidEmailFormats || [];
  }

  /**
   * Get SQL injection test cases
   */
  static getSqlInjectionCases() {
    return this.loadUsers().sqlInjectionAttempts || [];
  }

  /**
   * Get XSS test cases
   */
  static getXssCases() {
    return this.loadUsers().xssAttempts || [];
  }

  /**
   * Load products test data
   */
  static loadProducts() {
    return this.loadData<any>('products.json');
  }

  /**
   * Get valid products
   */
  static getValidProducts() {
    return this.loadProducts().validProducts || [];
  }

  /**
   * Get low stock products
   */
  static getLowStockProducts() {
    return this.loadProducts().lowStockProducts || [];
  }

  /**
   * Get out of stock products
   */
  static getOutOfStockProducts() {
    return this.loadProducts().outOfStockProducts || [];
  }

  /**
   * Get products with price variations
   */
  static getPriceVariations() {
    return this.loadProducts().priceVariations || [];
  }

  /**
   * Get discounted products
   */
  static getDiscountedProducts() {
    return this.loadProducts().discountedProducts || [];
  }

  /**
   * Get search results test data
   */
  static getSearchResults() {
    return this.loadProducts().searchResults || [];
  }

  /**
   * Get filter criteria test data
   */
  static getFilterCriteria() {
    return this.loadProducts().filterCriteria || [];
  }

  /**
   * Load cart test data
   */
  static loadCart() {
    return this.loadData<any>('cart.json');
  }

  /**
   * Get cart operations
   */
  static getCartOperations() {
    return this.loadCart().cartOperations || [];
  }

  /**
   * Get cart validation test cases
   */
  static getCartValidation() {
    return this.loadCart().cartValidation || [];
  }

  /**
   * Get invalid cart operations
   */
  static getInvalidCartOperations() {
    return this.loadCart().invalidCartOperations || [];
  }

  /**
   * Get edge case cart operations
   */
  static getEdgeCaseCartOperations() {
    return this.loadCart().edgeCaseCartOperations || [];
  }

  /**
   * Get cart persistence test cases
   */
  static getCartPersistence() {
    return this.loadCart().cartPersistence || [];
  }

  /**
   * Load API test data
   */
  static loadApi() {
    return this.loadData<any>('api.json');
  }

  /**
   * Get API user creation test data
   */
  static getApiUserCreation() {
    return this.loadApi().apiUserCreation || [];
  }

  /**
   * Get API user validation test data
   */
  static getApiUserValidation() {
    return this.loadApi().apiUserValidation || [];
  }

  /**
   * Get API login test data
   */
  static getApiLogin() {
    return this.loadApi().apiLogin || [];
  }

  /**
   * Get API login failures
   */
  static getApiLoginFailures() {
    return this.loadApi().apiLoginFailures || [];
  }

  /**
   * Get API product operations
   */
  static getApiProductOperations() {
    return this.loadApi().apiProductOperations || [];
  }

  /**
   * Get API pagination tests
   */
  static getApiPaginationTests() {
    return this.loadApi().apiPaginationTests || [];
  }

  /**
   * Get API error responses
   */
  static getApiErrorResponses() {
    return this.loadApi().apiErrorResponses || [];
  }

  /**
   * Get API response validation
   */
  static getApiResponseValidation() {
    return this.loadApi().apiResponseValidation || [];
  }

  /**
   * Get random item from array
   */
  static random<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }

  /**
   * Get first N items from array
   */
  static take<T>(items: T[], count: number): T[] {
    return items.slice(0, count);
  }

  /**
   * Filter test data by condition
   */
  static filter<T>(items: T[], predicate: (item: T) => boolean): T[] {
    return items.filter(predicate);
  }

  /**
   * Map test data
   */
  static map<T, U>(items: T[], mapper: (item: T) => U): U[] {
    return items.map(mapper);
  }

  /**
   * Get user subset based on criteria (for multi-user scenarios)
   */
  static getUsersByFilter(predicate: (user: any) => boolean) {
    return this.filter(this.getValidUsers(), predicate);
  }

  /**
   * Create user contexts for parallel/multi-user testing
   */
  static createUserContexts(count: number) {
    const users = this.getMultipleValidUsers(count);
    return users.map((user: any, index) => ({
      userId: index,
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      sessionId: `session_${index}_${Date.now()}`,
      timestamp: Date.now()
    }));
  }

  /**
   * Get nth user for distributed/round-robin testing
   */
  static getNthUser(testIndex: number) {
    const users = this.getValidUsers();
    return users[testIndex % users.length];
  }
}
