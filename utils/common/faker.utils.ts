export class FakerUtils {

  // ===================== COMMON =====================
  private static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static uuid(): string {
    return crypto.randomUUID();
  }

  // ===================== USER =====================
  static firstName(): string {
    return `User${this.randomInt(1000, 9999)}`;
  }

  static lastName(): string {
    return `Test${this.randomInt(1000, 9999)}`;
  }

  static fullName(): string {
    return `${this.firstName()} ${this.lastName()}`;
  }

  static email(): string {
    return `user${Date.now()}${this.randomInt(100,999)}@test.com`;
  }

  static password(length: number = 12): string {
    return Math.random().toString(36).slice(-length) + "A@1";
  }

  static phoneNumber(): string {
    return `9${this.randomInt(100000000, 999999999)}`; // India style
  }

  static user() {
    return {
      firstName: this.firstName(),
      lastName: this.lastName(),
      email: this.email(),
      password: this.password(),
      phone: this.phoneNumber()
    };
  }

  // ===================== ADDRESS =====================
  static address() {
    return `${this.randomInt(1, 999)} Street-${this.randomInt(1, 50)}`;
  }

  static city() {
    return `City-${this.randomInt(1, 100)}`;
  }

  static state() {
    return `State-${this.randomInt(1, 50)}`;
  }

  static zipCode(): string {
    return `${this.randomInt(100000, 999999)}`;
  }

  static fullAddress() {
    return {
      street: this.address(),
      city: this.city(),
      state: this.state(),
      zipCode: this.zipCode(),
      country: 'India'
    };
  }

  // ===================== PRODUCT =====================
  static productName(): string {
    return `Product-${this.uuid().slice(0, 6)}`;
  }

  static productCategory(): string {
    return `Category-${this.randomInt(1, 20)}`;
  }

  static productPrice(min: number = 100, max: number = 50000): number {
    return this.randomInt(min, max);
  }

  static product() {
    return {
      id: this.randomInt(1, 10000),
      name: this.productName(),
      category: this.productCategory(),
      price: this.productPrice(),
      stock: this.randomInt(0, 1000)
    };
  }

  // ===================== PAYMENT =====================
  static creditCardNumber(): string {
    return Array.from({ length: 16 }, () =>
      this.randomInt(0, 9)
    ).join('');
  }

  static cvv(): string {
    return `${this.randomInt(100, 999)}`;
  }

  static expiryMonth(): string {
    return String(this.randomInt(1, 12)).padStart(2, '0');
  }

  static expiryYear(): string {
    return String(new Date().getFullYear() + this.randomInt(1, 10)).slice(-2);
  }

  static creditCard() {
    return {
      number: this.creditCardNumber(),
      holder: this.fullName(),
      expiryMonth: this.expiryMonth(),
      expiryYear: this.expiryYear(),
      cvv: this.cvv()
    };
  }

  // ===================== DATE =====================
  static pastDate(days: number = 30): Date {
    const date = new Date();
    date.setDate(date.getDate() - this.randomInt(0, days));
    return date;
  }

  static futureDate(days: number = 30): Date {
    const date = new Date();
    date.setDate(date.getDate() + this.randomInt(0, days));
    return date;
  }

  // ===================== NEGATIVE TEST DATA =====================
  static invalidEmail(): string {
    return `invalid${this.randomInt(1000,9999)}`;
  }

  // ===================== GENERATORS =====================
  static sequence<T>(count: number, generator: () => T): T[] {
    return Array.from({ length: count }, generator);
  }

  // ===================== GENERIC TEST DATA =====================
  static testData() {
    return {
      id: this.uuid(),
      createdAt: this.pastDate(90),
      updatedAt: this.pastDate(7),
      isActive: Math.random() > 0.3
    };
  }
}