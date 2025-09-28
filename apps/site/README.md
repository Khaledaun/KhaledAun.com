# Khaled Aun - Legal Strategy & Business Growth

A professional legal services website built with Next.js 14, featuring the Dennis index-dark layout adapted for legal services with bilingual support (EN/AR) and RTL functionality.

## Features

- **Dennis Index-Dark Layout**: Professional dark theme adapted for legal services
- **Bilingual Support**: English and Arabic with proper RTL support
- **Legal Services Focus**: Litigation, arbitration, cross-border advisory, business strategy
- **Ventures Integration**: Links to WorldTME, LVJ Visa, and NAS Law
- **LinkedIn Integration**: Social proof and insights section
- **Consultation Modal**: Calendly integration with fallback contact form
- **SEO Optimized**: Sitemap, robots.txt, metadata, JSON-LD structured data
- **Accessibility**: Skip links, focus management, ARIA labels
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Asset Requirements

### How to Replace Placeholders

All placeholder images are located in `public/images/` with clear naming conventions. Replace the placeholder files with actual images:

#### Hero Section
- **`/public/images/hero/portrait-placeholder.jpg`** → Replace with actual portrait (800×1000px)
  - Professional headshot of Khaled Aun
  - High quality, well-lit, professional attire
  - Alt text: "Khaled Aun - Legal Strategist and Business Advisor"

- **`/public/images/hero/bg-placeholder.jpg`** → Replace with actual background (2000×1200px)
  - Professional legal office background
  - High contrast for text overlay, dark professional atmosphere
  - Alt text: "Professional legal office environment"

#### Sections
- **`/public/images/sections/about-1-placeholder.jpg`** → Replace with actual image (800×600px)
  - Legal consultation setting, professional environment
  - Alt text: "Legal strategy consultation and business advisory"

- **`/public/images/sections/services-1-placeholder.jpg`** → Replace with actual image (800×600px)
  - Legal services environment, professional setting
  - Alt text: "Professional legal services and consultation"

#### Venture Logos
- **`/public/images/ventures/worldtme-placeholder.svg`** → Replace with actual SVG logo
  - WorldTME company logo, transparent background
  - Alt text: "WorldTME - Global Technology and Media Solutions"

- **`/public/images/ventures/lvj-visa-placeholder.svg`** → Replace with actual SVG logo
  - LVJ Visa company logo, transparent background
  - Alt text: "LVJ Visa - Immigration and Visa Services"

- **`/public/images/ventures/nas-law-placeholder.svg`** → Replace with actual SVG logo
  - NAS Law company logo, transparent background
  - Alt text: "NAS Law - Comprehensive Legal Services"

#### Experience Logos
- **`/public/images/experience/facebook.png`** → Replace with actual PNG logo
  - Facebook company logo, transparent background
  - Alt text: "Facebook - Legal Counsel"

- **`/public/images/experience/google.png`** → Replace with actual PNG logo
  - Google company logo, transparent background
  - Alt text: "Google - Legal Strategy Advisor"

- **`/public/images/experience/lenovo.png`** → Replace with actual PNG logo
  - Lenovo company logo, transparent background
  - Alt text: "Lenovo - International Legal Counsel"

- **`/public/images/experience/circleci.png`** → Replace with actual PNG logo
  - CircleCI company logo, transparent background
  - Alt text: "CircleCI - Legal Advisory"

### How to Update Experience Data

Edit `apps/site/src/data/experience.ts` to update work experience:

```typescript
export const experienceData: ExperienceItem[] = [
  {
    id: 'company-id',
    company: 'Company Name',
    role: 'Your Role',
    period: 'Start - End',
    logo: '/images/experience/company-logo.png',
    url: 'https://company.com',
    summary: 'Brief description of your role and achievements.',
    achievements: [
      'Achievement 1',
      'Achievement 2',
      'Achievement 3'
    ]
  }
];
```

**Note**: In Phase 6 (CMS), this data will move to the database with RBAC.

## Environment Variables

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://khaledaun.com

# Calendly Integration (Optional)
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/khaledaun/consultation

# Social Media Integration (Optional)
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/khaledaun
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/in/khaledaun

# LinkedIn Integration (Optional)
NEXT_PUBLIC_FF_SOCIAL_WALL=true
NEXT_PUBLIC_LINKEDIN_WALL_EMBED_HTML=<iframe src="..."></iframe>
NEXT_PUBLIC_LINKEDIN_PROFILE_URL=https://linkedin.com/in/khaledaun
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev:site

# Build for production
pnpm build:site

# Run E2E tests
pnpm exec playwright test apps/tests/e2e/public-phase5-final.spec.ts
```

## Deployment

### Vercel Configuration
- **Root Directory**: `apps/site`
- **Build Command**: `pnpm --filter @khaledaun/site build`
- **Install Command**: `pnpm install`
- **Output Directory**: (Next.js auto-detects)

### Environment Variables
Set the following in Vercel:
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_CALENDLY_URL` (optional)
- `NEXT_PUBLIC_INSTAGRAM_URL` (optional)
- `NEXT_PUBLIC_LINKEDIN_URL` (optional)
- `NEXT_PUBLIC_FF_SOCIAL_WALL` (optional)
- `NEXT_PUBLIC_LINKEDIN_WALL_EMBED_HTML` (optional)
- `NEXT_PUBLIC_LINKEDIN_PROFILE_URL` (optional)

## Testing

The site includes comprehensive E2E tests covering:
- Layout parity with Dennis index-dark
- Bilingual functionality (EN/AR, RTL)
- Ventures links and security
- SEO metadata and structured data
- Consultation modal functionality
- LinkedIn section integration
- Accessibility compliance
- Brand integration

## Customization

### Colors
Brand colors are defined in `tailwind.config.js`:
- Navy: `#0D1B2A`
- Gold: `#C5A46D`
- Ink: `#0B1220`
- Sand: `#F4EBDD`

### Fonts
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

### Content
All text content is managed through translation files:
- `src/messages/en.json` - English translations
- `src/messages/ar.json` - Arabic translations

## License

Private project for Khaled Aun legal services.