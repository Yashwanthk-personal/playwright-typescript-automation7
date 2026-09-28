import { Before, After, setDefaultTimeout } from '@cucumber/cucumber';

setDefaultTimeout(30000);

/**
 * API-only hooks - No browser launch needed
 * Only runs for @api tagged features
 */
Before({ tags: '@api' }, async function () {
  // No browser initialization needed for API tests
  // API tests use APIRequestContext only
  console.log('Starting API test...');
});

After({ tags: '@api' }, async function () {
  // No browser cleanup needed
  console.log('API test completed');
});
