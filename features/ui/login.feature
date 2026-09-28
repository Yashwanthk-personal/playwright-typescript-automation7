Feature: User Login

  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I click on the login link
    And I enter valid credentials
    And I click the login button
    Then I should be redirected to the homepage
    And I should see my account link

  Scenario: Unsuccessful login with invalid credentials
    Given I am on the login page
    When I click on the login link
    And I enter an invalid email "invalid@example.com"
    And I enter an invalid password "wrongpassword"
    And I click the login button
    Then I should see an error message "Login was unsuccessful. Please correct the errors and try again."