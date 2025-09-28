# KhaledAun.com

A modern, production-ready content management system built with Next.js, Supabase, and real-time features.

## 🚀 Features

- **Authentication & Authorization**: Supabase Auth with role-based access control
- **Real-time Dashboard**: Live updates for leads, content, and AI operations
- **HITL Workflows**: Human-in-the-loop approval processes for high-risk content
- **Content Management**: AI-powered content generation with human oversight
- **Lead Capture**: Real-time lead management and tracking
- **Security**: Rate limiting, CORS, security headers, and vulnerability scanning
- **Monitoring**: Sentry error tracking and performance monitoring
- **Testing**: Comprehensive E2E test suite with Playwright

## 🏗️ Architecture

- **Frontend**: Next.js 14 with App Router
- **Backend**: Supabase (PostgreSQL, Auth, Real-time, Storage)
- **Deployment**: Vercel with automated CI/CD
- **Monitoring**: Sentry for error tracking and performance
- **Testing**: Playwright for E2E testing, Vitest for unit tests

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Khaledaun/KhaledAun.com.git
   cd KhaledAun.com
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.production.example .env.local
   # Fill in your Supabase credentials
   ```

4. **Set up the database**
   ```bash
   pnpm run db:seed
   ```

5. **Start the development server**
   ```bash
   pnpm run dev:admin
   ```

6. **Run tests**
   ```bash
   pnpm test
   ```

## 📚 Documentation

- **[Production Deployment Guide](docs/PRODUCTION_DEPLOYMENT.md)** - Complete production setup
- **[Deployment Validation Checklist](docs/DEPLOYMENT_VALIDATION_CHECKLIST.md)** - Pre-deployment testing
- **[Verification Guide](docs/VERIFICATION.md)** - Testing and security documentation
- **[Phase 2 Changes](docs/CHANGES_PHASE2.md)** - Feature implementation summary

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm run dev:admin          # Start admin app
pnpm run dev:web           # Start web app

# Building
pnpm run build             # Build for production
pnpm run start             # Start production server

# Testing
pnpm test                  # Run E2E tests
pnpm run test:ui           # Run tests with UI
pnpm run test:headed       # Run tests in headed mode
pnpm run test:debug        # Run tests in debug mode

# Code Quality
pnpm run type-check        # TypeScript type checking
pnpm run lint              # ESLint code linting
pnpm run lint:fix          # Fix linting issues
pnpm run format            # Format code with Prettier
pnpm run format:check      # Check code formatting

# Security
pnpm audit                 # Security audit
pnpm audit:fix             # Fix security vulnerabilities

# Database
pnpm run db:seed           # Seed database with test data
```

### Project Structure

```
├── apps/
│   ├── admin/                 # Next.js admin application
│   │   ├── app/              # App Router pages and API routes
│   │   ├── middleware.ts     # Security middleware
│   │   └── sentry.*.config.ts # Sentry configuration
│   └── tests/                # E2E test suite
│       ├── e2e/              # Playwright tests
│       └── workflows/        # Comprehensive workflow tests
├── packages/
│   ├── auth/                 # Authentication utilities
│   ├── db/                   # Database schema and migrations
│   ├── env/                  # Environment validation
│   └── utils/                # Shared utilities and logging
├── docs/                     # Documentation
├── .github/workflows/        # CI/CD pipelines
└── vercel.json              # Vercel deployment configuration
```

## 🚀 Production Deployment

### Automated Deployment

The application uses GitHub Actions for automated CI/CD:

1. **On Pull Request**: Runs tests, linting, and security scans
2. **On Push to Main**: Deploys to Vercel production
3. **Preview Deployments**: Automatic preview deployments for PRs

### Manual Deployment

```bash
# Deploy to Vercel
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

### Environment Setup

1. **Supabase**: Create production project and configure RLS policies
2. **Vercel**: Set up project and configure environment variables
3. **Sentry**: Create project for error tracking
4. **GitHub**: Configure secrets for CI/CD

See [Production Deployment Guide](docs/PRODUCTION_DEPLOYMENT.md) for detailed instructions.

## 🔒 Security

### Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable allowed origins
- **Security Headers**: Comprehensive security headers
- **Authentication**: JWT-based authentication with role-based access
- **RLS Policies**: Row-level security at database level
- **Vulnerability Scanning**: Automated security scans in CI/CD

### Security Headers

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy`: Restrictive CSP
- `Referrer-Policy: origin-when-cross-origin`

## 📊 Monitoring

### Health Monitoring

- **Health Endpoint**: `/api/health` for system status
- **Uptime Monitoring**: Automated uptime checks
- **Performance Monitoring**: Core Web Vitals tracking

### Error Tracking

- **Sentry Integration**: Frontend and backend error tracking
- **Performance Monitoring**: API response time tracking
- **User Session Replay**: Error context and user actions

### Logging

- **Structured Logging**: JSON-formatted logs with context
- **Log Levels**: DEBUG, INFO, WARN, ERROR, FATAL
- **Centralized Logging**: Vercel logs and Sentry integration

## 🧪 Testing

### Test Coverage

- **E2E Tests**: Complete user journey testing with Playwright
- **Workflow Tests**: Multi-step process testing
- **API Tests**: Endpoint testing and validation
- **Security Tests**: Authentication and authorization testing
- **Performance Tests**: Load and stress testing
- **Production Validation**: Deployment readiness validation

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test apps/tests/e2e/workflows/
pnpm test apps/tests/e2e/content-creation-workflow.spec.ts

# Run tests with different configurations
pnpm run test:headed    # With browser UI
pnpm run test:debug     # Debug mode
pnpm run test:ui        # Playwright UI
```

### Production Validation Tests

#### Quick Production Readiness Check
```bash
# Static validation (no server required)
pnpm exec playwright test --config=playwright.config.simple.ts
```

This validates:
- ✅ Middleware configuration (security headers, CORS, rate limiting)
- ✅ Health endpoint setup
- ✅ Package.json validity
- ✅ Next.js configuration
- ✅ Environment documentation
- ✅ Deployment documentation

#### Full Production Validation (Server Required)
```bash
# Start development server
pnpm run dev:admin

# In another terminal, run full validation
pnpm exec playwright test apps/tests/e2e/production-validation.spec.ts
```

This tests:
- 🔒 **Security Headers**: All required headers present and correct
- 🌐 **CORS Validation**: Origin filtering and preflight handling
- ⏱️ **Rate Limiting**: Request limits and proper headers
- 🏥 **Health Endpoint**: Response format and database connectivity
- 🚀 **Production Environment**: Error handling and performance
- ⚡ **Performance**: Response times and concurrent request handling

#### Specific Validation Categories
```bash
# Test only security headers
pnpm exec playwright test --grep "Security Headers"

# Test only CORS configuration
pnpm exec playwright test --grep "CORS Validation"

# Test only rate limiting
pnpm exec playwright test --grep "Rate Limiting"

# Test only health endpoint
pnpm exec playwright test --grep "Health Endpoint"
```

### Deployment Validation Workflow

#### Pre-Deployment Checklist
```bash
# 1. Static validation
pnpm exec playwright test --config=playwright.config.simple.ts

# 2. Build validation
pnpm run build

# 3. Type checking
pnpm run type-check

# 4. Linting
pnpm run lint

# 5. Security audit
pnpm audit --audit-level moderate

# 6. Full E2E tests
pnpm test
```

#### Production Environment Testing
```bash
# Set production URL for testing
export PRODUCTION_URL=https://your-domain.com

# Run production validation against live site
pnpm exec playwright test apps/tests/e2e/production-validation.spec.ts
```

### Test Configuration

- **Default Config**: `playwright.config.ts` - Full E2E tests with web server
- **Simple Config**: `playwright.config.simple.ts` - Static validation tests
- **Workflows Config**: `apps/tests/e2e/workflows/playwright.config.workflows.ts` - Complex workflow tests

See [Deployment Validation Checklist](docs/DEPLOYMENT_VALIDATION_CHECKLIST.md) for complete validation procedures.

## 🔄 Backup & Recovery

### Database Backups

- **Automatic Backups**: Daily backups with 7-day retention
- **Manual Backups**: On-demand backup creation
- **Point-in-time Recovery**: Available for Pro plans

### Disaster Recovery

- **Recovery Procedures**: Documented recovery processes
- **Testing**: Monthly recovery testing
- **Monitoring**: Automated backup verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation

- [Production Deployment Guide](docs/PRODUCTION_DEPLOYMENT.md)
- [Deployment Validation Checklist](docs/DEPLOYMENT_VALIDATION_CHECKLIST.md)
- [Verification Guide](docs/VERIFICATION.md)

### Community

- [GitHub Discussions](https://github.com/Khaledaun/KhaledAun.com/discussions)
- [Issues](https://github.com/Khaledaun/KhaledAun.com/issues)

### Emergency Support

For production issues, please check:
1. [Vercel Status](https://vercel-status.com)
2. [Supabase Status](https://status.supabase.com)
3. [Sentry Status](https://status.sentry.io)

---

## 🎯 Roadmap

### Phase 3 (In Progress)
- ✅ Enhanced E2E Testing
- 🔄 Performance Optimization
- 🔄 Advanced Real-time Features

### Phase 4 (Completed)
- ✅ Production Deployment
- ✅ Monitoring & Logging
- ✅ Security Hardening
- ✅ CI/CD Pipeline

### Future Phases
- Content Management Improvements
- SEO Optimization Tools
- Advanced Analytics
- Mobile Application

---

**Built with ❤️ using Next.js, Supabase, and modern web technologies.**
