'use client';

import { useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';

export default function ContactPage() {
  const t = useTranslations('contact');

  return (
    <main id="main-content">
      <section className="min-h-screen bg-brand-sand py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-heading font-bold mb-6 text-brand-navy text-center">
              {t('title')}
            </h1>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <p className="text-lg text-brand-ink mb-6 text-center">
                {t('subtitle')}
              </p>
              <div className="text-center">
                <a 
                  href="mailto:contact@khaledaun.com" 
                  className="btn-primary"
                  aria-label="Send email to contact@khaledaun.com"
                >
                  Get In Touch
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
