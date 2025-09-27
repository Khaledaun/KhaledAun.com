# Verification and Security Documentation

This document explains how to run verification checks on the project and documents the security architecture.

## Authentication System

### Supabase Auth
The application uses **Supabase Auth** as the primary authentication system:

- **JWT Token Validation**: All admin API routes require valid Supabase JWT tokens
- **Role-Based Access**: User roles are stored in JWT metadata (`user_metadata.role` or `app_metadata.role`)
- **Server-Side Utilities**: `requireAdmin()` function validates tokens and extracts user roles
- **No NextAuth**: Previously considered authentication solutions have been removed in favor of Supabase Auth

### Supported Roles
- **admin**: Full access to all resources
- **editor**: Can create and update content, but cannot delete
- **ops**: Can read operational data like leads
- **user**: Default role with limited access

## Row Level Security (RLS) Model

### Database Security
The application implements Row Level Security policies on Supabase/PostgreSQL:

#### Post Table Policies
- **Admins**: Can perform any action (CREATE, READ, UPDATE, DELETE)
- **Editors**: Can create and update posts, but cannot delete them
- **Authenticated Users**: Can only read posts with status `PUBLISHED`
- **Anonymous Users**: Can only read posts with status `PUBLISHED`

#### Lead Table Policies
- **Admins & Ops**: Can read all leads
- **Admins Only**: Can create, update, and delete leads
- **Other Roles**: No access to leads

### API Data Security
- All admin API routes are protected with JWT validation
- Role extraction happens server-side using Supabase client
- Database queries are automatically filtered by RLS policies
- Failed authentication returns appropriate HTTP status codes (401/403)

## E2E Test Suite

### Overview
The project includes a comprehensive E2E test suite using Playwright that covers:
- **Authentication & Authorization**: JWT validation and role-based access
- **Content Workflow**: Full content creation and approval process
- **Lead Capture**: Real-time lead capture and verification
- **HITL Workflows**: Human-in-the-loop approval processes
- **API Security**: RLS policies and endpoint protection

### Test Files
- `apps/tests/e2e/content-happy-path.spec.ts` - Full content workflow testing
- `apps/tests/e2e/lead-capture-happy-path.spec.ts` - Lead capture and real-time updates
- `apps/tests/e2e/auth-rls.spec.ts` - Authentication and RLS policy testing
- `apps/tests/e2e/api-smoke.spec.ts` - Basic API endpoint testing
- `apps/tests/e2e/media-governance.spec.ts` - Media management testing
- `apps/tests/e2e/seo-guardrails.spec.ts` - SEO validation testing

### Test Utilities
- `apps/tests/test-utils.ts` - Common test helpers and utilities
  - Mock authentication for different user roles
  - Test data factories
  - Navigation helpers
  - Assertion utilities

### Running E2E Tests

#### Prerequisites
1. **Environment Setup**: Ensure `.env` file is configured with Supabase credentials
2. **Database**: Run Prisma migrations to set up test database
3. **Dependencies**: Install all project dependencies

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

#### Running Tests

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test apps/tests/e2e/content-happy-path.spec.ts

# Run tests in headed mode (with browser UI)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug

# Run tests with specific browser
npx playwright test --project=chromium
```

#### Test Configuration
- **Base URL**: Tests run against `http://localhost:3000` by default
- **Timeout**: 30 seconds for most operations
- **Retries**: 2 retries on failure
- **Parallel**: Tests run in parallel by default

#### Test Data
- **Mock Users**: Predefined test users with different roles
- **Test Data**: Factory functions for consistent test data
- **Cleanup**: Automatic cleanup after each test

### Test Scenarios

#### 1. Content Happy Path Test
**File**: `content-happy-path.spec.ts`

**What it tests**:
- Editor login and authentication
- Idea creation via API
- Outline review and approval workflow
- Facts review and approval workflow
- High-risk post creation and status transitions
- Validation of HITL business logic

**Key Assertions**:
- Successful authentication as editor
- Outline options are presented and selectable
- Facts can be reviewed and approved
- High-risk posts require approved artifacts
- Post status transitions work correctly

#### 2. Lead Capture Happy Path Test
**File**: `lead-capture-happy-path.spec.ts`

**What it tests**:
- Admin login and Command Center access
- Public user contact form submission
- Real-time lead updates in Command Center
- Multiple lead submissions
- Form validation

**Key Assertions**:
- Admin can access Command Center
- Contact form accepts valid submissions
- New leads appear in real-time
- Lead count updates correctly
- Form validation works properly

#### 3. Authentication & RLS Test
**File**: `auth-rls.spec.ts`

**What it tests**:
- JWT token validation
- Role-based access control
- RLS policy enforcement
- API endpoint protection

**Key Assertions**:
- Unauthorized requests return 401
- Invalid tokens are rejected
- Role-based permissions are enforced
- RLS policies prevent unauthorized access

### Debugging Tests

#### Common Issues
1. **Authentication Failures**: Check JWT token format and expiration
2. **Database Connection**: Verify Supabase credentials and connection
3. **Element Not Found**: Check if UI components are properly rendered
4. **Timeout Issues**: Increase timeout values for slow operations

#### Debug Commands
```bash
# Run with verbose output
npx playwright test --verbose

# Run with trace
npx playwright test --trace on

# Run specific test with debug
npx playwright test --debug content-happy-path.spec.ts

# Generate test report
npx playwright show-report
```

#### Test Reports
- **HTML Report**: Generated after test runs
- **Screenshots**: Captured on test failures
- **Videos**: Recorded for failed tests
- **Traces**: Detailed execution traces

### Continuous Integration

#### GitHub Actions
Tests are automatically run in CI/CD pipeline:
- **Trigger**: On pull requests and pushes to main
- **Environment**: GitHub-hosted runners
- **Database**: Test database with seeded data
- **Reporting**: Test results and coverage reports

#### Local CI Simulation
```bash
# Run tests as they would in CI
npx playwright test --reporter=github
```

## Verification Commands

Run these commands to verify the project setup: