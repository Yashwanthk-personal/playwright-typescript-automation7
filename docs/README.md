# Demo Web Shop Automation

This project is an automation framework for testing the Demo Web Shop located at [https://demowebshop.tricentis.com/](https://demowebshop.tricentis.com/). It utilizes Playwright for browser automation and follows a Page Object Model (POM) structure for better maintainability and readability.

## Project Structure

```
demo-webshop-automation
├── features
│   ├── login.feature         # Scenarios for user login functionality
│   ├── product_search.feature # Scenarios for product search functionality
│   └── cart.feature          # Scenarios for cart functionality
├── steps
│   ├── login.steps.ts        # Step definitions for login feature
│   ├── product.steps.ts      # Step definitions for product search feature
│   └── cart.steps.ts         # Step definitions for cart feature
├── fixtures
│   └── test-fixtures.ts      # Test fixtures for setting up test data
├── pages
│   ├── base.page.ts          # Base page class for common methods
│   ├── home.page.ts          # Home page class with locators and methods
│   ├── login.page.ts         # Login page class with locators and methods
│   ├── product.page.ts       # Product detail page class with locators and methods
│   ├── cart.page.ts          # Shopping cart page class with locators and methods
│   └── account.page.ts       # Account page class with locators and methods
├── utils
│   ├── element.utils.ts       # Utility functions for interacting with elements
│   ├── wait.utils.ts          # Utility functions for waiting for elements
│   └── assertion.utils.ts      # Utility functions for assertions
├── .env.dev                   # Environment variables for development
├── package.json               # npm configuration file
├── tsconfig.json              # TypeScript configuration file
├── playwright.config.ts        # Playwright configuration settings
└── README.md                  # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd demo-webshop-automation
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.dev` file in the root directory and set the following variable:
   ```
   DEMOWEBSHOP_BASE_URL=https://demowebshop.tricentis.com/
   ```

4. **Run the tests:**
   You can run the tests using the following command:
   ```
   npx playwright test
   ```

## Usage

- The project is structured to allow easy addition of new features and tests.
- Each feature is defined in the `features` directory, with corresponding step definitions in the `steps` directory.
- Page objects are defined in the `pages` directory, encapsulating the locators and methods for interacting with the web application.
- Utility functions for element interactions, waiting, and assertions are located in the `utils` directory.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.