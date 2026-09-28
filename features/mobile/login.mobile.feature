# features/mobile/login.mobile.feature

@mobile
Feature: Mobile Login Functionality
  As a mobile user
  I want to log into the demo web shop
  So that I can access my account and purchase products

  Background:
    Given I am on the mobile login page

  Scenario: Successful login with valid credentials on mobile
    When I enter a mobile email "rupeshkumar10895@gmail.com"
    And I enter a mobile password "Login@123"
    And I click the mobile login button
    Then I should be redirected to the mobile homepage
    And I should see my mobile account link

  Scenario: Failed login with invalid email on mobile
    When I enter an invalid mobile email "invalid@example.com"
    And I enter a mobile password "Login@123"
    And I click the mobile login button
    Then I should see a mobile error message

  Scenario: Failed login with invalid password on mobile
    When I enter a mobile email "test@example.com"
    And I enter an invalid mobile password "wrongpassword"
    And I click the mobile login button
    Then I should see a mobile error message

  Scenario: Failed login with both invalid credentials on mobile
    When I enter an invalid mobile email "invalid@example.com"
    And I enter an invalid mobile password "wrongpassword"
    And I click the mobile login button
    Then I should see a mobile error message

  Scenario: Login form displays correctly on mobile
    Then the mobile login form should be visible
    And the mobile email field should be visible
    And the mobile password field should be visible
    And the mobile login button should be visible

  Scenario: Mobile login form is responsive
    When I view the login form on different mobile screen sizes
    Then all form elements should be accessible on small screens
    And all form elements should be accessible on large screens
    And all form elements should be accessible on tablet screens

  Scenario: Mobile login form validation
    When I click the mobile login button without entering credentials
    Then I should see validation error messages
    And the email field should be highlighted as required
    And the password field should be highlighted as required
