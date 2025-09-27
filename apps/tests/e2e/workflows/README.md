# E2E Workflow Tests

This directory contains comprehensive end-to-end workflow tests that cover complete user journeys and complex multi-step processes.

## Test Structure

### 1. Content Creation Workflow (`content-creation-workflow.spec.ts`)
Tests the complete content creation process from idea generation to published post:

- **Idea Generation**: Create content ideas via API
- **Outline Generation**: Generate multiple outline options using AI
- **Outline Review**: Human selection and approval of outline options
- **Facts Generation**: Generate facts for the selected outline
- **Facts Review**: Human review and approval of facts
- **Post Creation**: Create the final post with approved artifacts
- **Status Transitions**: Move post through different statuses
- **HITL Validation**: Ensure high-risk posts require approvals

**Key Test Scenarios:**
- Complete workflow from idea to published post
- High-risk post validation (requires approvals)
- Low-risk post free transitions
- Error handling for missing approvals

### 2. Lead Capture Workflow (`lead-capture-workflow.spec.ts`)
Tests the complete lead capture and management process:

- **Public Form Submission**: Simulate public user contact form submission
- **Real-time Updates**: Verify leads appear in Command Center in real-time
- **Lead Management**: Update lead status and information
- **Multiple Submissions**: Handle multiple concurrent lead submissions
- **Form Validation**: Test form validation and error handling
- **Error Recovery**: Handle API failures and network issues

**Key Test Scenarios:**
- Real-time lead capture and verification
- Multiple lead submissions
- Contact form validation
- Error handling and recovery

### 3. Authentication & Authorization Workflow (`auth-authorization-workflow.spec.ts`)
Tests comprehensive authentication and authorization scenarios:

- **JWT Validation**: Test valid, invalid, and expired tokens
- **Role-Based Access**: Verify permissions for admin, editor, and ops roles
- **UI Access Control**: Test page access based on user roles
- **RLS Policies**: Verify database-level security policies
- **Concurrent Sessions**: Test multiple user sessions
- **Token Management**: Handle token expiration and refresh

**Key Test Scenarios:**
- Admin-only endpoint access
- Role-based permissions enforcement
- UI access control
- JWT token validation
- Concurrent user sessions
- Malformed token handling

### 4. HITL (Human-in-the-Loop) Workflow (`hitl-workflow.spec.ts`)
Tests the human approval workflows for high-risk content:

- **Outline Approval**: Human review and selection of AI-generated outlines
- **Facts Approval**: Human review and approval of AI-generated facts
- **Partial Approvals**: Handle scenarios where only some approvals are given
- **Rejection Workflow**: Handle rejection of AI-generated content
- **Multi-Reviewer**: Support multiple reviewers for the same content
- **Timeout Handling**: Handle timeouts and retries in approval process

**Key Test Scenarios:**
- Complete HITL workflow for high-risk content
- Partial approval handling
- Rejection workflow
- Multi-reviewer scenarios
- Timeout and retry mechanisms

### 5. Error Handling & Edge Cases (`error-handling-workflow.spec.ts`)
Tests system resilience and error handling:

- **Network Failures**: Handle network connectivity issues
- **API Server Errors**: Handle 500, 502, 503 errors
- **Invalid Data**: Handle malformed requests and validation errors
- **Concurrent Operations**: Test system behavior under load
- **Large Payloads**: Handle large data submissions
- **Rapid Requests**: Test system behavior with rapid successive requests
- **Database Failures**: Handle database connection issues
- **UI State Corruption**: Handle corrupted localStorage and state

**Key Test Scenarios:**
- Network failure handling
- API server error handling
- Invalid request data handling
- Concurrent operations
- Large data payloads
- Rapid successive requests
- Database connection failures
- UI state corruption handling

## Running Workflow Tests

### Prerequisites
1. **Server Running**: Ensure the development server is running on `http://localhost:3000`
2. **Database**: Ensure the database is set up with test data
3. **Dependencies**: Install all required dependencies

### Running Tests

```bash
# Run all workflow tests
npx playwright test apps/tests/e2e/workflows/

# Run specific workflow test
npx playwright test apps/tests/e2e/workflows/content-creation-workflow.spec.ts

# Run with specific browser
npx playwright test apps/tests/e2e/workflows/ --project=chromium-workflows

# Run in headed mode (with browser UI)
npx playwright test apps/tests/e2e/workflows/ --headed

# Run in debug mode
npx playwright test apps/tests/e2e/workflows/ --debug

# Generate test report
npx playwright show-report
```

### Test Configuration

The workflow tests use a specialized configuration (`playwright.config.workflows.ts`) with:
- **Extended Timeouts**: 60 seconds for complex workflows
- **Multiple Browsers**: Chrome, Firefox, and Safari
- **Enhanced Reporting**: HTML, JSON, and JUnit reports
- **Screenshot/Video**: Captured on failures
- **Trace**: Enabled for debugging

## Test Data and Utilities

### Test Users
- **Admin**: Full access to all resources
- **Editor**: Can create and update content, cannot delete
- **Ops**: Can read operational data like leads

### Test Utilities (`test-utils.ts`)
- **Mock Authentication**: Simulate user login and JWT tokens
- **API Helpers**: Authenticated request helpers
- **Navigation Helpers**: Navigate to different pages
- **Assertion Helpers**: Common assertions for UI elements
- **Test Data**: Predefined test data for consistent testing

## Best Practices

### 1. Test Isolation
- Each test is independent and can run in parallel
- Tests clean up after themselves
- No shared state between tests

### 2. Realistic Scenarios
- Tests simulate real user behavior
- Use realistic data and timing
- Test both happy path and error scenarios

### 3. Comprehensive Coverage
- Test complete user journeys
- Cover edge cases and error scenarios
- Test different user roles and permissions

### 4. Maintainable Tests
- Use descriptive test names
- Group related tests in describe blocks
- Use helper functions for common operations

### 5. Performance Considerations
- Tests run in parallel when possible
- Use appropriate timeouts
- Clean up resources after tests

## Debugging Workflow Tests

### Common Issues
1. **Timeout Errors**: Increase timeout values for slow operations
2. **Element Not Found**: Check if UI components are properly rendered
3. **Authentication Failures**: Verify JWT token format and expiration
4. **Database Connection**: Check Supabase credentials and connection

### Debug Commands
```bash
# Run with verbose output
npx playwright test apps/tests/e2e/workflows/ --verbose

# Run with trace
npx playwright test apps/tests/e2e/workflows/ --trace on

# Run specific test with debug
npx playwright test apps/tests/e2e/workflows/content-creation-workflow.spec.ts --debug

# Generate test report
npx playwright show-report
```

### Test Reports
- **HTML Report**: Interactive test results with screenshots and videos
- **JSON Report**: Machine-readable test results
- **JUnit Report**: CI/CD integration format
- **Screenshots**: Captured on test failures
- **Videos**: Recorded for failed tests
- **Traces**: Detailed execution traces for debugging

## Continuous Integration

The workflow tests are designed to run in CI/CD pipelines:
- **Parallel Execution**: Tests run in parallel for faster execution
- **Retry Logic**: Failed tests are retried automatically
- **Artifact Collection**: Screenshots, videos, and traces are collected
- **Report Generation**: Multiple report formats for different tools

## Future Enhancements

### Planned Improvements
1. **Performance Testing**: Add performance benchmarks to workflows
2. **Load Testing**: Test system behavior under high load
3. **Accessibility Testing**: Add accessibility checks to workflows
4. **Cross-Browser Testing**: Expand browser coverage
5. **Mobile Testing**: Add mobile device testing

### Integration Opportunities
1. **API Testing**: Integrate with API testing tools
2. **Database Testing**: Add database state verification
3. **Monitoring Integration**: Connect with monitoring tools
4. **Alerting**: Set up alerts for test failures

This comprehensive workflow testing suite ensures that all user journeys work correctly and provides confidence in the system's reliability and functionality.
