import Header from '@/components/site/Header';
import Hero from '@/components/site/Hero';
import About from '@/components/site/About';
import Services from '@/components/site/Services';
import ExperienceTimeline from '@/components/site/ExperienceTimeline';
import LinkedInSection from '@/components/site/LinkedInSection';
import VenturesStrip from '@/components/site/VenturesStrip';
import Footer from '@/components/site/Footer';
import ConsultationModal from '@/components/common/ConsultationModal';
import Script from 'next/script';

export default function Home({params: {locale}}) {
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