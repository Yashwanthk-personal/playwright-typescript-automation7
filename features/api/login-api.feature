@api
Feature: API User Login

  Background:
    Given API client is initialized

  Scenario: Successful API login with valid credentials
    When I send login request with valid credentials
    Then API response status should be 200
    And API response should contain authentication token
    And API response should have user email
    And API response should not have error message

  Scenario: Unsuccessful API login with invalid email
    When I send login request with invalid email "invalid@example.com" and valid password
    Then API response status should be 400 or 401
    And API response should contain error message
    And API response should not contain authentication token

  Scenario: Unsuccessful API login with invalid password
    When I send login request with valid email and invalid password "wrongpassword"
    Then API response status should be 400 or 401
    And API response should contain error message
    And API response should not contain authentication token

  Scenario: Unsuccessful API login with empty credentials
    When I send login request with empty email and empty password
    Then API response status should be 400
    And API response should contain validation error
    And API response should contain required field error

  Scenario: Successful API login should return consistent response format
    When I send login request with valid credentials
    Then API response should contain all required fields
    And API response token should be valid JWT format
    And API response should contain user details

  # New Scenarios using test data from api.json

  Scenario: Successful API login with test data index 1
    When I send login request with valid test data index 1
    Then API response status should match test data expected status
    And API response should contain token if test data expects token

  Scenario: Successful API login with test data index 2
    When I send login request with valid test data index 2
    Then API response status should match test data expected status
    And API response should contain token if test data expects token

  Scenario: Failed API login - user not found
    When I send login request with failed login data index 1
    Then API response status should match test data expected status
    And API response error should match test data expected error
    And API response should not contain authentication token

  Scenario: Failed API login - invalid credentials
    When I send login request with failed login data index 2
    Then API response status should match test data expected status
    And API response error should match test data expected error
    And API response should not contain authentication token

  Scenario: Failed API login - missing email
    When I send login request with failed login data index 3
    Then API response status should match test data expected status
    And API response error should match test data expected error
    And API response should not contain authentication token

  # API Mocking Scenarios

  Scenario: Mock successful login response
    When I mock login request to return success response
    And I send login request through mocked endpoint
    Then mocked response status should be 200
    And mocked response should contain authentication token
    And mocked login endpoint should have been called

  Scenario: Mock failed login response with error
    When I mock login request to return error response with status 401
    And I send login request through mocked endpoint
    Then mocked response status should be 401
    And mocked response should contain error message
    And mocked login endpoint should have been called once

  Scenario: Mock slow API response with retry
    When I mock login request to return delayed response after 2 seconds
    And I send login request with retry timeout 5000
    Then mocked response status should be 200
    And mocked response should contain authentication token
    And request should have been retried

  Scenario: Mock network timeout and verify retry behavior
    When I mock login request to timeout on first attempt and succeed on second
    And I send login request with retry timeout 10000
    Then mocked response status should be 200
    And mocked response retry count should be 2

  Scenario: Mock login request and verify request payload
    When I mock login request to capture payload
    And I send login request with specific email "test@example.com" and password "testpass"
    Then mocked response status should be 200
    And mocked request payload should contain email "test@example.com"
    And mocked request payload should contain password field

  # Visual Testing for API Scenarios

  Scenario: Take visual snapshot of successful login response
    When I send login request with valid credentials
    Then I capture API response structure as visual snapshot named "successful_login_response"
    And visual snapshot should be compared against baseline "successful_login_response"

  Scenario: Visual comparison of response headers
    When I send login request with valid credentials
    Then I capture response headers as visual snapshot named "login_response_headers"
    And I capture response body structure as visual snapshot named "login_response_body"
    And headers snapshot should match baseline structure

  Scenario: Visual regression test for error response format
    When I send login request with invalid credentials
    Then I capture error response as visual snapshot named "error_response_format"
    And error response snapshot should be compared against baseline "error_response_format"
    And response should contain all required error fields

  Scenario: API response time visual timeline
    When I send login request with valid credentials
    And I capture request duration as metric
    Then I create timeline snapshot showing response timing named "login_response_timeline"
    And response time should be within acceptable threshold 2000ms
    And visual timeline should show all request stages

  Scenario: Compare multiple API response variations
    When I send login request with test data index 1
    And I capture response as visual snapshot named "response_variation_1"
    And I send login request with test data index 2
    And I capture response as visual snapshot named "response_variation_2"
    Then I compare visual snapshots "response_variation_1" and "response_variation_2"
    And snapshots should have similar structure with different values
