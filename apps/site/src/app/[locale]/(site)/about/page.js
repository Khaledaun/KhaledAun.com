import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

export default function AboutPage({ params: { locale } }) {
  // Enable static rendering
  setRequestLocale(locale);
  const t = useTranslations('about');

  return (
    <main id="main-content">
      <section className="min-h-screen bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-heading font-bold mb-6 text-brand-navy">
              {t('title')}
            </h1>
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-brand-ink mb-6">
                {t('subtitle')}
              </p>
              <p className="text-lg text-brand-ink mb-6">
                With extensive experience in complex legal matters, I provide strategic 
                guidance that helps businesses navigate challenges and seize opportunities.
              </p>
              <p className="text-lg text-brand-ink mb-6">
                My approach combines deep legal expertise with business acumen, ensuring 
                that legal strategies align with business objectives and drive sustainable growth.
              </p>
              <p className="text-lg text-brand-ink">
                Through strategic partnerships and ventures, I help businesses expand 
                their reach and achieve their growth objectives while maintaining legal 
                compliance and risk management.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
