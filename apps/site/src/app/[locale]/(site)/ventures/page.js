'use client';

import { useTranslations } from 'next-intl';
import Header from '../../../components/site/Header';
import Footer from '../../../components/site/Footer';
import ConsultationModal from '../../../components/common/ConsultationModal';
import Image from 'next/image';
import { ExternalLink, Globe, Users, Scale, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Ventures() {
  const t = useTranslations('Ventures');
  const nav = useTranslations('Navigation');

  const ventures = [
    {
      name: 'WorldTME',
      url: 'https://worldtme.com/',
      description: t('worldtmeDescription'),
      role: t('worldtmeRole'),
      logo: '/images/ventures/worldtme-logo.png',
      icon: Globe,
      color: 'from-blue-500 to-blue-600',
      details: 'WorldTME is a leading provider of global technology and media solutions, offering innovative platforms and services that connect businesses worldwide. As Legal Advisor, I provide strategic legal guidance on international operations, regulatory compliance, and business development initiatives.'
    },
    {
      name: 'LVJ Visa',
      url: 'https://www.lvj-visa.com/',
      description: t('lvjVisaDescription'),
      role: t('lvjVisaRole'),
      logo: '/images/ventures/lvj-visa-logo.png',
      icon: Users,
      color: 'from-green-500 to-green-600',
      details: 'LVJ Visa specializes in comprehensive immigration and visa services, helping individuals and businesses navigate complex immigration processes. As Strategic Partner, I contribute legal expertise in immigration law, policy analysis, and strategic business development.'
    },
    {
      name: 'NAS Law',
      url: 'https://www.nas-law.com/',
      description: t('nasLawDescription'),
      role: t('nasLawRole'),
      logo: '/images/ventures/nas-law-logo.png',
      icon: Scale,
      color: 'from-purple-500 to-purple-600',
      details: 'NAS Law provides comprehensive legal services and consultation across various practice areas. As Legal Consultant, I offer specialized expertise in complex litigation, international arbitration, and strategic legal planning for business growth.'
    }
  ];

  return (
    <>
      <Header />
      <main id="main-content" className="pt-16">
        {/* Hero Section */}
        <section className="bg-brand-navy text-white py-20">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <Link 
                href="/"
                className="inline-flex items-center space-x-2 text-brand-gold hover:text-white transition-colors duration-200 mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
              
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                {t('title')}
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Ventures Details */}
        <section className="py-20 bg-brand-ink">
          <div className="container">
            <div className="space-y-16">
              {ventures.map((venture, index) => (
                <div key={index} className="bg-brand-navy/50 backdrop-blur-sm rounded-lg p-8 lg:p-12">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <div>
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-white rounded-lg p-4">
                          <Image
                            src={venture.logo}
                            alt={`${venture.name} logo`}
                            width={48}
                            height={48}
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <h2 className="text-3xl font-heading font-bold text-white">
                            {venture.name}
                          </h2>
                          <div className="flex items-center space-x-2 text-brand-gold">
                            <venture.icon className="w-5 h-5" />
                            <span className="font-medium">{venture.role}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-lg text-gray-300 mb-6">
                        {venture.description}
                      </p>

                      <p className="text-gray-300 mb-8">
                        {venture.details}
                      </p>

                      <a
                        href={venture.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex items-center space-x-2"
                      >
                        <span>{t('visitWebsite')}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    {/* Visual */}
                    <div className="relative">
                      <div className="relative w-full h-64 lg:h-80 rounded-lg overflow-hidden">
                        <Image
                          src={`/images/ventures/${venture.name.toLowerCase().replace(' ', '-')}-showcase.jpg`}
                          alt={`${venture.name} showcase`}
                          fill
                          className="object-cover"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${venture.color} opacity-20`} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-brand-navy">
          <div className="container">
            <div className="text-center">
              <div className="bg-brand-ink/30 backdrop-blur-sm rounded-lg p-12 max-w-3xl mx-auto">
                <h2 className="text-3xl font-heading font-bold mb-6 text-white">
                  {t('ctaTitle')}
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  {t('ctaDescription')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      const event = new CustomEvent('openConsultationModal');
                      window.dispatchEvent(event);
                    }}
                    className="btn-primary"
                  >
                    {nav('bookConsultation')}
                  </button>
                  <Link href="/" className="btn-secondary">
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ConsultationModal />
    </>
  );
}