'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ExternalLink, Globe, Users, Scale } from 'lucide-react';

export default function VenturesStrip() {
  const t = useTranslations('Ventures');

  const ventures = [
    {
      name: 'WorldTME',
      url: 'https://worldtme.com/',
      description: t('worldtmeDescription'),
      role: t('worldtmeRole'),
      logo: '/images/ventures/worldtme-logo.png',
      icon: Globe,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'LVJ Visa',
      url: 'https://www.lvj-visa.com/',
      description: t('lvjVisaDescription'),
      role: t('lvjVisaRole'),
      logo: '/images/ventures/lvj-visa-logo.png',
      icon: Users,
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'NAS Law',
      url: 'https://www.nas-law.com/',
      description: t('nasLawDescription'),
      role: t('nasLawRole'),
      logo: '/images/ventures/nas-law-logo.png',
      icon: Scale,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <section id="ventures" data-testid="ventures" className="section-padding bg-brand-navy">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-brand-gold">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Ventures Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ventures.map((venture, index) => (
            <div
              key={index}
              className="bg-brand-ink/50 backdrop-blur-sm rounded-lg p-6 hover:bg-brand-ink/70 transition-all duration-300 hover:shadow-xl hover:shadow-brand-gold/10 group"
            >
              {/* Logo */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white p-4">
                  <Image
                    src={venture.logo.replace('.png', '-placeholder.svg')}
                    alt={`${venture.name} - ${venture.description}`}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-heading font-semibold mb-2 text-white group-hover:text-brand-gold transition-colors duration-200">
                  {venture.name}
                </h3>
                
                <p className="text-gray-300 text-sm mb-3">
                  {venture.description}
                </p>

                <div className="inline-flex items-center space-x-2 text-brand-gold text-sm font-medium">
                  <venture.icon className="w-4 h-4" />
                  <span>{venture.role}</span>
                </div>
              </div>

              {/* CTA */}
              <a
                href={venture.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-secondary inline-flex items-center justify-center space-x-2 group-hover:bg-brand-gold group-hover:text-brand-navy transition-all duration-200"
              >
                <span>{t('visitWebsite')}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-brand-ink/30 backdrop-blur-sm rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-heading font-semibold mb-4 text-white">
              {t('ctaTitle')}
            </h3>
            <p className="text-gray-300 mb-6">
              {t('ctaDescription')}
            </p>
            <a
              href="/ventures"
              className="btn-primary"
            >
              {t('viewAllVentures')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
