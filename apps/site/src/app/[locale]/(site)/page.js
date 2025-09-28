'use client';

import Header from '../../../components/site/Header.js';
import Hero from '../../../components/site/Hero.js';
import About from '../../../components/site/About.js';
import Services from '../../../components/site/Services.js';
import ExperienceTimeline from '../../../components/site/ExperienceTimeline.js';
import LinkedInSection from '../../../components/site/LinkedInSection.js';
import VenturesStrip from '../../../components/site/VenturesStrip.js';
import Footer from '../../../components/site/Footer.js';
import ConsultationModal from '../../../components/common/ConsultationModal.js';
import Script from 'next/script';

export default function Home() {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Khaled Aun',
    description: 'Expert legal counsel for complex business challenges and growth opportunities.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/images/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-123-4567',
      contactType: 'Legal Consultation',
      email: 'consultation@khaledaun.com'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'New York',
      addressRegion: 'NY',
      addressCountry: 'US'
    },
    sameAs: [
      'https://linkedin.com/in/khaledaun'
    ]
  };

  return (
    <>
      <Script
        id="organization-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd)
        }}
      />
      <Header />
      <main id="main-content">
        <Hero />
        <About />
        <Services />
        <ExperienceTimeline />
        <LinkedInSection />
        <VenturesStrip />
      </main>
      <Footer />
      <ConsultationModal />
    </>
  );
}