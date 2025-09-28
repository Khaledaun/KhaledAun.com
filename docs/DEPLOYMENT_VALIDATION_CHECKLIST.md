# Deployment Validation Checklist

This checklist ensures that all production deployment features are working correctly before merging to main.

## 🔧 Pre-Deployment Setup

### Environment Configuration
- [ ] **Supabase Project**: Production project created and configured
- [ ] **Vercel Project**: Production project created and configured  
- [ ] **Sentry Project**: Error tracking project created and configured
- [ ] **Environment Variables**: All required variables set in Vercel
- [ ] **GitHub Secrets**: All CI/CD secrets configured
- [ ] **Database**: Migrations run and RLS policies applied

### Local Testing
- [ ] **Build Process**: `pnpm build` completes successfully
- [ ] **Type Checking**: `pnpm run type-check` passes
- [ ] **Linting**: `pnpm run lint` passes
- [ ] **Security Audit**: `pnpm audit` shows no high/critical vulnerabilities
- [ ] **E2E Tests**: `pnpm test` passes locally

## 🚀 Deployment Testing

### 1. CI/CD Pipeline Validation

#### GitHub Actions Workflow
- [ ] **Quality Checks**: Code quality job passes
- [ ] **Build & Test**: Build and test job passes
- [ ] **Security Scan**: Security scanning job passes
- [ ] **Deployment**: Vercel deployment job succeeds
- [ ] **Status Updates**: PR comments with deployment status

#### Test Commands
```bash
# Run the same commands as CI/CD
pnpm install --frozen-lockfile
pnpm run type-check
pnpm run lint
pnpm audit --audit-level moderate
pnpm run build
pnpm exec playwright test
```

### 2. Production E2E Validation Tests

#### Automated Production Validation
- [ ] **Static Validation**: Run production readiness tests
- [ ] **Security Headers**: Validate security headers configuration
- [ ] **CORS Configuration**: Test CORS policy enforcement
- [ ] **Rate Limiting**: Verify rate limiting implementation
- [ ] **Health Endpoint**: Comprehensive health check validation
- [ ] **Error Handling**: Test error boundaries and graceful failures

#### Test Commands
```bash
# Run production readiness validation (no server required)
pnpm exec playwright test --config=playwright.config.simple.ts

# Run full production validation tests (server required)
pnpm exec playwright test apps/tests/e2e/production-validation.spec.ts

# Run specific validation categories
pnpm exec playwright test --grep "Security Headers"
pnpm exec playwright test --grep "CORS Validation"
pnpm exec playwright test --grep "Rate Limiting"
pnpm exec playwright test --grep "Health Endpoint"
```

### 3. Vercel Deployment Validation

#### Deployment Status
- [ ] **Deployment URL**: Accessible and loading correctly
- [ ] **Build Logs**: No errors in Vercel build logs
- [ ] **Environment Variables**: All variables properly set
- [ ] **Domain Configuration**: Custom domain working (if configured)

#### Test Commands
```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Check environment variables
vercel env ls
```

### 3. Health Check Validation

#### Health Endpoint Testing
- [ ] **Basic Health**: `GET /api/health` returns 200
- [ ] **Database Connectivity**: Database status shows "healthy"
- [ ] **Response Time**: Health check responds in < 100ms
- [ ] **Error Handling**: Health check handles database errors gracefully

#### Test Commands
```bash
# Test health endpoint
curl -i https://your-domain.com/api/health

# Test with different methods
curl -X HEAD https://your-domain.com/api/health

# Expected response format
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 45
    }
  }
}
```

## 🔒 Security Validation

### 1. Security Headers Testing

#### Required Headers
- [ ] **X-Frame-Options**: DENY
- [ ] **X-Content-Type-Options**: nosniff
- [ ] **X-XSS-Protection**: 1; mode=block
- [ ] **Strict-Transport-Security**: max-age=31536000
- [ ] **Content-Security-Policy**: Restrictive CSP present
- [ ] **Referrer-Policy**: origin-when-cross-origin

#### Test Commands
```bash
# Check security headers
curl -I https://your-domain.com

# Test with security header checker
# Use online tools like securityheaders.com
```

### 2. Rate Limiting Testing

#### Rate Limit Validation
- [ ] **Normal Usage**: 100 requests in 15 minutes works
- [ ] **Rate Limit Exceeded**: 101st request returns 429
- [ ] **Rate Limit Headers**: Response includes rate limit headers
- [ ] **Reset Time**: Rate limit resets after window expires

#### Test Commands
```bash
# Test rate limiting
for i in {1..105}; do
  curl -w "%{http_code}\n" -o /dev/null -s https://your-domain.com/api/admin/posts
done

# Check rate limit headers
curl -I https://your-domain.com/api/admin/posts
# Should include: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
```

### 3. CORS Testing

#### CORS Configuration
- [ ] **Allowed Origins**: Only configured domains allowed
- [ ] **Preflight Requests**: OPTIONS requests handled correctly
- [ ] **Credentials**: CORS credentials configured properly
- [ ] **Methods**: Allowed methods configured correctly

#### Test Commands
```bash
# Test CORS with allowed origin
curl -H "Origin: https://your-domain.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS https://your-domain.com/api/admin/posts

# Test CORS with disallowed origin
curl -H "Origin: https://malicious-site.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS https://your-domain.com/api/admin/posts
# Should return 403
```

## 📊 Monitoring Validation

### 1. Sentry Integration Testing

#### Error Tracking
- [ ] **Frontend Errors**: JavaScript errors captured
- [ ] **Backend Errors**: API errors captured
- [ ] **Performance Monitoring**: Performance data collected
- [ ] **Release Tracking**: Releases properly tagged

#### Test Commands
```bash
# Trigger a test error (in browser console)
throw new Error('Test error for Sentry');

# Check Sentry dashboard for the error
# Verify error appears in Sentry project
```

### 2. Logging Validation

#### Application Logging
- [ ] **Console Logs**: Appropriate log levels in production
- [ ] **Structured Logging**: Logs include proper context
- [ ] **Error Logging**: Errors properly logged with stack traces
- [ ] **Performance Logging**: API response times logged

#### Test Commands
```bash
# Check Vercel logs
vercel logs [deployment-url]

# Look for structured log entries
# Verify log levels are appropriate for production
```

## 🧪 Functional Testing

### 1. Authentication Testing

#### Auth Flow Validation
- [ ] **Login**: User can log in successfully
- [ ] **Logout**: User can log out successfully
- [ ] **Session Management**: Sessions persist correctly
- [ ] **Role-Based Access**: Different roles have correct permissions

#### Test Commands
```bash
# Test authentication endpoints
curl -X POST https://your-domain.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'

# Test protected endpoints
curl -H "Authorization: Bearer [token]" \
     https://your-domain.com/api/admin/posts
```

### 2. API Endpoint Testing

#### Core API Validation
- [ ] **Posts API**: CRUD operations work correctly
- [ ] **Leads API**: Lead management works correctly
- [ ] **AI Endpoints**: AI generation endpoints work
- [ ] **Health Check**: Health endpoint responds correctly

#### Test Commands
```bash
# Test all API endpoints
curl https://your-domain.com/api/health
curl https://your-domain.com/api/admin/posts
curl https://your-domain.com/api/admin/leads
curl https://your-domain.com/api/ai/outline
```

### 3. Real-time Features Testing

#### Real-time Validation
- [ ] **WebSocket Connections**: Real-time connections work
- [ ] **Live Updates**: UI updates in real-time
- [ ] **Connection Recovery**: Reconnects after network issues
- [ ] **Performance**: Real-time updates don't impact performance

#### Test Commands
```bash
# Test WebSocket connection (in browser)
# Open browser dev tools and check Network tab
# Verify WebSocket connections are established
```

## 📈 Performance Testing

### 1. Load Testing

#### Performance Metrics
- [ ] **Page Load Time**: < 2 seconds
- [ ] **API Response Time**: < 100ms
- [ ] **Database Query Time**: < 50ms
- [ ] **Real-time Latency**: < 500ms

#### Test Commands
```bash
# Test page load performance
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com

# Test API performance
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/api/health

# Create curl-format.txt:
# time_namelookup:  %{time_namelookup}\n
# time_connect:     %{time_connect}\n
# time_appconnect:  %{time_appconnect}\n
# time_pretransfer: %{time_pretransfer}\n
# time_redirect:    %{time_redirect}\n
# time_starttransfer: %{time_starttransfer}\n
# time_total:       %{time_total}\n
```

### 2. Stress Testing

#### Load Testing
- [ ] **Concurrent Users**: Handles expected user load
- [ ] **Database Load**: Database handles concurrent queries
- [ ] **Memory Usage**: Memory usage stays within limits
- [ ] **Error Rates**: Error rates remain low under load

#### Test Commands
```bash
# Simple load test with Apache Bench
ab -n 1000 -c 10 https://your-domain.com/api/health

# More comprehensive load testing
# Use tools like Artillery, k6, or JMeter
```

## 🔄 Backup & Recovery Testing

### 1. Database Backup Testing

#### Backup Validation
- [ ] **Automatic Backups**: Daily backups are created
- [ ] **Backup Retention**: Backups retained for required period
- [ ] **Backup Integrity**: Backups can be restored successfully
- [ ] **Point-in-time Recovery**: Point-in-time recovery works

#### Test Commands
```bash
# Check backup status in Supabase dashboard
# Verify backup creation and retention policies
# Test restore process in staging environment
```

### 2. Disaster Recovery Testing

#### Recovery Procedures
- [ ] **Database Recovery**: Can restore from backup
- [ ] **Application Recovery**: Can redeploy application
- [ ] **Data Integrity**: Restored data is consistent
- [ ] **Recovery Time**: Recovery within acceptable time

#### Test Commands
```bash
# Test recovery procedures
# Document recovery time and procedures
# Verify data integrity after recovery
```

## 🚨 Error Handling Testing

### 1. Error Scenarios

#### Error Handling Validation
- [ ] **Network Errors**: Graceful handling of network issues
- [ ] **Database Errors**: Proper error responses for DB issues
- [ ] **Authentication Errors**: Appropriate auth error handling
- [ ] **Validation Errors**: Clear validation error messages

#### Test Commands
```bash
# Test various error scenarios
curl -X POST https://your-domain.com/api/admin/posts \
     -H "Content-Type: application/json" \
     -d '{"invalid": "data"}'
# Should return 400 with validation error

# Test with invalid auth
curl https://your-domain.com/api/admin/posts
# Should return 401
```

### 2. Monitoring Alerts

#### Alert Configuration
- [ ] **Error Rate Alerts**: Alerts for high error rates
- [ ] **Performance Alerts**: Alerts for performance issues
- [ ] **Uptime Alerts**: Alerts for downtime
- [ ] **Security Alerts**: Alerts for security issues

#### Test Commands
```bash
# Trigger test alerts
# Verify alert notifications work
# Test alert escalation procedures
```

## ✅ Final Validation

### Production Readiness Checklist
- [ ] **All Tests Passing**: CI/CD pipeline green
- [ ] **Security Validated**: All security measures working
- [ ] **Performance Acceptable**: Meets performance requirements
- [ ] **Monitoring Active**: All monitoring systems operational
- [ ] **Backup Verified**: Backup and recovery procedures tested
- [ ] **Documentation Updated**: All documentation current
- [ ] **Team Trained**: Team knows how to monitor and maintain

### Go-Live Checklist
- [ ] **DNS Configuration**: Domain pointing to Vercel
- [ ] **SSL Certificate**: HTTPS working correctly
- [ ] **Analytics Setup**: Analytics tracking configured
- [ ] **User Acceptance**: Stakeholders approve deployment
- [ ] **Rollback Plan**: Rollback procedures documented
- [ ] **Support Ready**: Support team ready for issues

## 📞 Support & Escalation

### Emergency Contacts
- **Technical Lead**: [Contact Information]
- **DevOps Engineer**: [Contact Information]
- **Database Administrator**: [Contact Information]
- **Security Team**: [Contact Information]

### Escalation Procedures
1. **Level 1**: Application issues, performance problems
2. **Level 2**: Infrastructure issues, security concerns
3. **Level 3**: Critical system failures, data loss

### Communication Channels
- **Slack**: #production-alerts
- **Email**: alerts@your-domain.com
- **Phone**: Emergency hotline

---

## 📋 Validation Report Template

### Deployment Summary
- **Deployment Date**: [Date]
- **Deployment Version**: [Version]
- **Deployed By**: [Name]
- **Validation Completed By**: [Name]

### Test Results
- **CI/CD Pipeline**: ✅ Pass / ❌ Fail
- **Security Tests**: ✅ Pass / ❌ Fail
- **Performance Tests**: ✅ Pass / ❌ Fail
- **Functional Tests**: ✅ Pass / ❌ Fail
- **Monitoring Setup**: ✅ Pass / ❌ Fail

### Issues Found
- [ ] **Issue 1**: Description and resolution
- [ ] **Issue 2**: Description and resolution

### Recommendations
- **Immediate**: Actions to take before go-live
- **Short-term**: Improvements for next deployment
- **Long-term**: Strategic improvements

### Sign-off
- **Technical Lead**: [Name] [Date]
- **Product Owner**: [Name] [Date]
- **Security Team**: [Name] [Date]

This comprehensive validation checklist ensures that your production deployment is robust, secure, and ready for users.
