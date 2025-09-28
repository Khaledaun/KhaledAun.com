# Deployment Readiness Checklist

## Environment Configuration

| Item | Status | Action Required |
|------|--------|----------------|
| **NEXT_PUBLIC_SITE_URL** set | ❌ **NO** | Add to Vercel environment variables |
| **External images domains** configured | ✅ **YES** | `worldtme.com`, `www.lvj-visa.com`, `www.nas-law.com` in next.config.js |

## Build & Routing

| Item | Status | Action Required |
|------|--------|----------------|
| **Next.js version** is ^14.x | ✅ **YES** | `"next": "^14.2.5"` in package.json |
| **Scripts present** | ✅ **YES** | `dev`, `build`, `start`, `lint` all configured |
| **Vercel project** points to apps/site | ❌ **NO** | Set "Root Directory" to `apps/site` in Vercel |

## Quality Gates

| Item | Status | Action Required |
|------|--------|----------------|
| **Playwright passes** on preview | ⚠️ **PENDING** | Run tests after deployment |
| **Lighthouse smoke** ≥ SEO 95, CLS ≤ 0.05 | ⚠️ **PENDING** | Run after deployment |
| **Security headers** middleware | ❌ **NO** | Add security headers middleware |

## Accessibility

| Item | Status | Action Required |
|------|--------|----------------|
| **Skip link functional** | ✅ **YES** | Implemented in layout.js |
| **Focus ring visible** | ✅ **YES** | Implemented in globals.css |
| **Arabic pages** with dir="rtl" | ✅ **YES** | Implemented in locale layout |

## SEO

| Item | Status | Action Required |
|------|--------|----------------|
| **Sitemap.xml** returns 200 | ⚠️ **PENDING** | Test after deployment |
| **Robots.txt** returns 200 | ⚠️ **PENDING** | Test after deployment |
| **Hreflang alternates** present | ✅ **YES** | Implemented in sitemap.js |

## Ventures

| Item | Status | Action Required |
|------|--------|----------------|
| **All 3 external links** resolve 200 | ⚠️ **PENDING** | Test after deployment |
| **Links open in new tab** | ✅ **YES** | `target="_blank"` implemented |
| **Security attributes** present | ✅ **YES** | `rel="noopener noreferrer"` implemented |

## Do Before Production Deploy

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Build the Site
```bash
pnpm --filter @khaledaun/site build
```

### 3. Run E2E Tests
```bash
pnpm exec playwright test apps/tests/e2e/public-phase5.spec.ts
```

### 4. Optional: Lighthouse Audit
```bash
pnpm lhci autorun --upload.target=filesystem --collect.url="http://localhost:3001/en"
```

## Vercel Configuration

### Project Settings
- **Root Directory**: `apps/site`
- **Build Command**: `pnpm --filter @khaledaun/site build`
- **Install Command**: `pnpm install`
- **Output Directory**: (Next.js auto-detects)

### Environment Variables
```bash
NEXT_PUBLIC_SITE_URL=https://khaledaun.com
```

### Additional Domains (if needed)
```bash
NEXT_PUBLIC_WORLDTME_URL=https://worldtme.com
NEXT_PUBLIC_LVJ_VISA_URL=https://www.lvj-visa.com
NEXT_PUBLIC_NAS_LAW_URL=https://www.nas-law.com
```

## Remaining Tasks

### High Priority
1. **Set Vercel Root Directory** to `apps/site`
2. **Add NEXT_PUBLIC_SITE_URL** environment variable
3. **Add security headers middleware** for production
4. **Test deployment** and run E2E tests

### Medium Priority
1. **Run Lighthouse audit** on deployed site
2. **Verify external links** are working
3. **Test sitemap.xml and robots.txt** on live site

### Low Priority
1. **Add JSON-LD structured data** for better SEO
2. **Implement analytics tracking** if needed
3. **Add error monitoring** (Sentry integration)

## Security Headers Middleware

Create `apps/site/middleware-security.js`:
```javascript
import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## Deployment Status

**Current Status**: 🟡 **READY WITH MINOR CONFIGURATION NEEDED**

**Blockers**: None
**Warnings**: 
- Vercel project configuration needed
- Environment variables need to be set
- Security headers middleware recommended

**Estimated Time to Deploy**: 15-30 minutes (configuration only)
