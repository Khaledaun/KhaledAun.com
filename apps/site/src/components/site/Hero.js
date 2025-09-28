'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  const t = useTranslations('Hero');

  return (
    <section data-testid="hero" className="relative min-h-screen flex items-center overflow-hidden bg-brand-navy">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero/bg-placeholder.jpg"
          alt="Professional legal office environment"
          fill
          className="object-cover"
          priority
        />
        <div className="gradient-overlay" />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-balance">
              {t('headline')}
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl">
              {t('subheadline')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => {
                  const event = new CustomEvent('openConsultationModal');
                  window.dispatchEvent(event);
                }}
                className="btn-primary text-lg px-8 py-4"
              >
                {t('bookConsultation')}
              </button>
              
              <Link
                href="/ventures"
                className="btn-secondary text-lg px-8 py-4"
              >
                {t('viewVentures')}
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto lg:mx-0">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-gold mb-2">15+</div>
                <div className="text-sm text-gray-400">{t('yearsExperience')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-gold mb-2">200+</div>
                <div className="text-sm text-gray-400">{t('casesResolved')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-gold mb-2">95%</div>
                <div className="text-sm text-gray-400">{t('successRate')}</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px] rounded-lg overflow-hidden">
              <Image
                src="/images/hero/portrait-placeholder.jpg"
                alt="Khaled Aun - Legal Strategist and Business Advisor"
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-brand-ink p-6 rounded-lg shadow-xl max-w-xs">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center">
                  <span className="text-brand-navy font-bold text-lg">KA</span>
                </div>
                <div>
                  <div className="font-semibold text-brand-navy dark:text-white">
                    {t('expertise')}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('specialization')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-brand-gold rounded-full flex justify-center">
          <div className="w-1 h-3 bg-brand-gold rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
}
