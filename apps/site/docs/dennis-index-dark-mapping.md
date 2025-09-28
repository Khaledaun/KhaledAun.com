# Dennis Index-Dark Layout Mapping

## Template Analysis
**Source**: `apps/site/temp/Dennis_NextJs_v1.0.0/Dennis_NextJs/src/app/index-dark/page.js`
**Demo URL**: https://dennis-shreethemes.vercel.app/index-dark

## Section Mapping Table

| index-dark Section | Our Component/File | Source Asset Path | Modifications Notes |
|-------------------|-------------------|-------------------|-------------------|
| **Navbar** | `src/components/site/Header.js` | `src/app/components/Navbar.js` | Dark variant, legal services nav, consultation CTA, language switch |
| **HeroOne** | `src/components/site/Hero.js` | `src/app/components/HeroOne.js` | Legal headline, strategy focus, consultation CTA, ventures link |
| **AboutUs** | `src/components/site/About.js` | `src/app/components/AboutUs.js` | Legal expertise bullets, arbitration focus, profile download |
| **Services** | `src/components/site/Services.js` | `src/app/components/Service.js` | Legal services cards (litigation, arbitration, advisory) |
| **CTABanner** | `src/components/site/ContactCTA.js` | `src/app/components/CTABanner.js` | Consultation booking CTA |
| **Experience** | `src/components/site/Experience.js` | `src/app/components/Experience.js` | Legal experience timeline |
| **Projects** | `src/components/site/CaseStudies.js` | `src/app/components/Projects.js` | Case studies grid, mediation outcomes |
| **Clients** | `src/components/site/Testimonials.js` | `src/app/components/Clients.js` | Client testimonials |
| **Blogs** | `src/components/site/Insights.js` | `src/app/components/Blogs.js` | Legal insights, latest posts |
| **GetInTouch** | `src/components/site/Contact.js` | `src/app/components/GetInTouch.js` | Contact form, consultation booking |
| **Footer** | `src/components/site/Footer.js` | `src/app/components/Footer.js` | Dark footer, legal links, social |
| **Switcher** | `src/components/common/ThemeSwitcher.js` | `src/app/components/Switcher.js` | Theme switcher (optional) |

## New Sections (Not in Dennis)

| Section | Our Component/File | Purpose | Implementation |
|---------|-------------------|---------|----------------|
| **From LinkedIn** | `src/components/site/LinkedInSection.js` | Social proof, insights | Embed wall or curated cards |
| **Ventures Strip** | `src/components/site/VenturesStrip.js` | Business partnerships | 3 external venture links |
| **Consultation Modal** | `src/components/common/ConsultationModal.js` | Booking system | Calendly integration |

## Layout Structure (Exact Order)

1. **Header** - Sticky dark navigation with consultation CTA
2. **Hero** - Dark hero with legal headline and CTAs
3. **About** - Legal expertise and strategy focus
4. **Services** - Legal services cards (litigation, arbitration, etc.)
5. **Contact CTA** - Consultation booking banner
6. **Experience** - Legal experience timeline
7. **Case Studies** - Portfolio grid with legal outcomes
8. **Testimonials** - Client testimonials
9. **LinkedIn Section** - Social proof and insights
10. **Ventures Strip** - Business partnership links
11. **Insights** - Latest legal insights/posts
12. **Contact** - Contact form and consultation
13. **Footer** - Dark footer with links and social

## Key Modifications for Legal Services

### Branding Changes
- **Colors**: Navy (#0D1B2A), Gold (#C5A46D), Ink (#0B1220), Sand (#F4EBDD)
- **Fonts**: Playfair Display (headings), Inter (body)
- **Tone**: Professional legal services vs. personal portfolio

### Content Adaptations
- **Hero**: "Strategy in Legal Conflicts. Vision to Expand and Grow."
- **Services**: Litigation, arbitration, conflict prevention, cross-border advisory
- **Projects**: Case studies with legal outcomes (settlements, awards)
- **About**: Legal strategy expertise, arbitration experience

### Technical Enhancements
- **i18n**: next-intl with EN/AR locales
- **RTL**: Arabic support with dir="rtl"
- **SEO**: Legal services metadata, JSON-LD
- **Accessibility**: Legal industry compliance

### New Features
- **Consultation Modal**: Calendly integration
- **LinkedIn Section**: Social proof and insights
- **Ventures Integration**: External business partnerships
- **Language Switch**: EN/AR toggle

## Asset Requirements

### Images Needed
- **Hero Portrait**: Professional headshot (2000×1200)
- **Venture Logos**: WorldTME, LVJ Visa, NAS Law (SVG/PNG)
- **Background Images**: Legal office, courtroom, documents
- **Icons**: Legal services icons (lucide-react)

### Placeholder Strategy
- Use professional stock photos for legal themes
- Create simple logo placeholders for ventures
- Use lucide-react icons for services
- Mark all asset paths clearly for easy replacement

## Implementation Priority

1. **Core Layout**: Header, Hero, About, Services, Footer
2. **New Sections**: LinkedIn, Ventures, Consultation Modal
3. **i18n Integration**: EN/AR translations and RTL
4. **SEO & Metadata**: Legal services optimization
5. **E2E Testing**: Comprehensive test coverage
