# Production Deployment Guide

This guide covers the complete setup and deployment of the KhaledAun.com application to production using Vercel and Supabase.

## 🚀 Overview

The application is designed for production deployment with:
- **Frontend**: Next.js application deployed on Vercel
- **Backend**: Supabase (PostgreSQL, Auth, Real-time, Storage)
- **Monitoring**: Sentry for error tracking and performance monitoring
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Security**: Rate limiting, CORS, security headers, and vulnerability scanning

## 📋 Prerequisites

### Required Accounts
- [Vercel Account](https://vercel.com) (free tier available)
- [Supabase Account](https://supabase.com) (free tier available)
- [Sentry Account](https://sentry.io) (free tier available)
- [GitHub Account](https://github.com) (for CI/CD)

### Required Tools
- Node.js 18+ and pnpm
- Git
- Vercel CLI (optional): `npm i -g vercel`

## 🔧 Environment Setup

### 1. Supabase Setup

#### Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose organization and enter project details:
   - **Name**: `khaledaun-production`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
4. Wait for project creation (2-3 minutes)

#### Configure Supabase
1. **Get API Keys**:
   - Go to Settings > API
   - Copy `Project URL` and `anon public` key
   - Copy `service_role` key (keep this secret!)

2. **Set up Database**:
   ```bash
   # Run migrations
   npx prisma migrate deploy
   
   # Seed database
   pnpm run db:seed
   ```

3. **Configure RLS Policies**:
   - Go to Authentication > Policies
   - Import policies from `packages/db/sql/rls-policies.sql`

4. **Set up Authentication**:
   - Go to Authentication > Settings
   - Configure allowed redirect URLs
   - Set up email templates (optional)

### 2. Vercel Setup

#### Create Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/admin`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`

#### Configure Environment Variables
In Vercel Dashboard > Project Settings > Environment Variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Next.js Configuration
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret

# Sentry Configuration
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# Security Configuration
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_ERROR_REPORTING=true
ENABLE_PERFORMANCE_MONITORING=true
```

### 3. Sentry Setup

#### Create Sentry Project
1. Go to [Sentry Dashboard](https://sentry.io)
2. Create new project:
   - **Platform**: Next.js
   - **Project Name**: `khaledaun-production`
3. Get DSN from project settings

#### Configure Sentry
1. **Install Sentry CLI** (optional):
   ```bash
   npm install -g @sentry/cli
   ```

2. **Configure Sentry**:
   - Set up release tracking
   - Configure error filtering
   - Set up performance monitoring

### 4. GitHub Secrets Setup

In GitHub Repository > Settings > Secrets and variables > Actions:

```bash
# Vercel Integration
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id

# Test Environment (for CI/CD)
TEST_SUPABASE_URL=https://your-test-project.supabase.co
TEST_SUPABASE_ANON_KEY=your-test-supabase-anon-key
TEST_SUPABASE_SERVICE_ROLE_KEY=your-test-supabase-service-role-key
TEST_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[TEST-PROJECT-REF].supabase.co:5432/postgres

# Sentry Integration
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
```

## 🚀 Deployment Process

### 1. Initial Deployment

#### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd apps/admin
vercel --prod
```

#### Verify Deployment
1. Check Vercel deployment logs
2. Test health endpoint: `https://your-domain.com/api/health`
3. Verify all environment variables are set
4. Test authentication flow
5. Check Sentry for any errors

### 2. CI/CD Pipeline

The GitHub Actions workflow automatically:
- Runs tests on every PR
- Deploys to Vercel on push to main
- Posts deployment status on PRs
- Runs security scans

#### Manual Deployment
```bash
# Trigger deployment via GitHub Actions
git push origin main

# Or deploy directly via Vercel CLI
vercel --prod
```

## 🔍 Monitoring & Observability

### 1. Health Monitoring

#### Health Check Endpoint
- **URL**: `https://your-domain.com/api/health`
- **Method**: GET
- **Response**: JSON with system status

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 45
    }
  },
  "responseTime": 50
}
```

#### Monitoring Setup
1. **Uptime Monitoring**: Use services like UptimeRobot or Pingdom
2. **Health Check URL**: `https://your-domain.com/api/health`
3. **Alert Threshold**: 5 minutes downtime
4. **Notification**: Email/Slack alerts

### 2. Error Tracking (Sentry)

#### Viewing Errors
1. Go to [Sentry Dashboard](https://sentry.io)
2. Select your project
3. View Issues, Performance, and Releases tabs

#### Error Categories
- **Frontend Errors**: JavaScript errors, React errors
- **Backend Errors**: API errors, database errors
- **Performance Issues**: Slow queries, high response times

#### Alerting
- Set up alerts for error rate spikes
- Configure notifications for critical errors
- Set up performance alerts

### 3. Logging

#### Application Logs
- **Vercel Logs**: Available in Vercel Dashboard
- **Sentry Logs**: Integrated error logging
- **Console Logs**: Available in browser dev tools

#### Log Levels
- **DEBUG**: Development only
- **INFO**: General information
- **WARN**: Warning conditions
- **ERROR**: Error conditions
- **FATAL**: Critical errors

## 🔒 Security

### 1. Security Headers

The application includes comprehensive security headers:
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: 1; mode=block
- **Strict-Transport-Security**: max-age=31536000
- **Content-Security-Policy**: Restrictive CSP
- **Referrer-Policy**: origin-when-cross-origin

### 2. Rate Limiting

- **API Endpoints**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit info in response headers
- **Response**: 429 status code when exceeded

### 3. CORS Configuration

- **Allowed Origins**: Configured via environment variables
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization

### 4. Vulnerability Scanning

- **GitHub Actions**: Automated security scans
- **Dependencies**: Regular security audits
- **Trivy**: Container and filesystem scanning

## 📊 Performance

### 1. Performance Monitoring

#### Core Web Vitals
- **LCP**: Largest Contentful Paint
- **FID**: First Input Delay
- **CLS**: Cumulative Layout Shift

#### Performance Metrics
- **Page Load Time**: < 2 seconds
- **API Response Time**: < 100ms
- **Database Query Time**: < 50ms

### 2. Optimization

#### Frontend Optimization
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Caching**: Vercel Edge Network
- **Bundle Analysis**: `pnpm run analyze`

#### Backend Optimization
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Supabase handles this
- **Caching**: Redis (if needed)

## 🔄 Backup & Recovery

### 1. Database Backups

#### Supabase Backups
- **Automatic**: Daily backups (7 days retention)
- **Manual**: On-demand backups
- **Point-in-time**: Available for Pro plans

#### Backup Verification
1. Go to Supabase Dashboard > Settings > Database
2. Check backup status and retention
3. Test restore process (staging environment)

### 2. Disaster Recovery

#### Recovery Procedures
1. **Database Recovery**:
   - Restore from latest backup
   - Update connection strings
   - Verify data integrity

2. **Application Recovery**:
   - Redeploy from GitHub
   - Verify environment variables
   - Test critical functionality

#### Recovery Testing
- Test backup restoration monthly
- Document recovery procedures
- Train team on recovery process

## 🧪 Testing

### 1. Pre-Deployment Testing

#### Local Testing
```bash
# Run all tests
pnpm test

# Run E2E tests
pnpm run test:e2e

# Run security audit
pnpm audit
```

#### Staging Testing
- Deploy to staging environment
- Run full test suite
- Test with production-like data
- Performance testing

### 2. Post-Deployment Testing

#### Smoke Tests
- Health check endpoint
- Authentication flow
- Critical user journeys
- API endpoints

#### Monitoring
- Error rates
- Performance metrics
- User feedback
- System logs

## 🚨 Troubleshooting

### Common Issues

#### 1. Deployment Failures
- **Check**: Vercel deployment logs
- **Verify**: Environment variables
- **Test**: Local build process

#### 2. Database Connection Issues
- **Check**: Supabase project status
- **Verify**: Connection string
- **Test**: Database connectivity

#### 3. Authentication Issues
- **Check**: Supabase Auth settings
- **Verify**: JWT configuration
- **Test**: Auth flow

#### 4. Performance Issues
- **Check**: Sentry performance data
- **Verify**: Database query performance
- **Test**: Network connectivity

### Debug Commands

```bash
# Check application health
curl https://your-domain.com/api/health

# Test database connection
npx prisma db pull

# Check environment variables
vercel env ls

# View deployment logs
vercel logs
```

## 📚 Additional Resources

### Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Sentry Documentation](https://docs.sentry.io)
- [Next.js Documentation](https://nextjs.org/docs)

### Support
- [Vercel Support](https://vercel.com/support)
- [Supabase Support](https://supabase.com/support)
- [Sentry Support](https://sentry.io/support)

### Community
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [Next.js Community](https://github.com/vercel/next.js/discussions)

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Supabase project created and configured
- [ ] Vercel project created and configured
- [ ] Sentry project created and configured
- [ ] Environment variables set in Vercel
- [ ] GitHub secrets configured
- [ ] Database migrations run
- [ ] RLS policies configured
- [ ] All tests passing locally

### Deployment
- [ ] Initial deployment successful
- [ ] Health check endpoint responding
- [ ] Authentication working
- [ ] Database connectivity verified
- [ ] Sentry error tracking active
- [ ] Security headers present
- [ ] Rate limiting working
- [ ] CORS configured correctly

### Post-Deployment
- [ ] Smoke tests passing
- [ ] Performance metrics acceptable
- [ ] Error rates within normal range
- [ ] Monitoring alerts configured
- [ ] Backup procedures tested
- [ ] Documentation updated
- [ ] Team trained on monitoring

### Ongoing Maintenance
- [ ] Regular security audits
- [ ] Performance monitoring
- [ ] Backup verification
- [ ] Dependency updates
- [ ] Error rate monitoring
- [ ] User feedback collection
- [ ] Documentation updates

This comprehensive guide ensures a robust, secure, and observable production deployment of your application.
