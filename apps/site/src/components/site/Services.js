'use client';

import { useTranslations } from 'next-intl';
import { 
  Scale, 
  Users, 
  Globe, 
  Shield, 
  Briefcase, 
  MessageSquare
} from 'lucide-react';

export default function Services() {
  const t = useTranslations('Services');

  const services = [
    {
      icon: Scale,
      title: t('litigation'),
      description: t('litigationDesc'),
      features: [t('litigationFeature1'), t('litigationFeature2'), t('litigationFeature3')]
    },
    {
      icon: Users,
      title: t('arbitration'),
      description: t('arbitrationDesc'),
      features: [t('arbitrationFeature1'), t('arbitrationFeature2'), t('arbitrationFeature3')]
    },
    {
      icon: Globe,
      title: t('crossBorder'),
      description: t('crossBorderDesc'),
      features: [t('crossBorderFeature1'), t('crossBorderFeature2'), t('crossBorderFeature3')]
    },
    {
      icon: Shield,
      title: t('conflictPrevention'),
      description: t('conflictPreventionDesc'),
      features: [t('conflictPreventionFeature1'), t('conflictPreventionFeature2'), t('conflictPreventionFeature3')]
    },
    {
      icon: Briefcase,
      title: t('businessAdvisory'),
      description: t('businessAdvisoryDesc'),
      features: [t('businessAdvisoryFeature1'), t('businessAdvisoryFeature2'), t('businessAdvisoryFeature3')]
    },
    {
      icon: MessageSquare,
      title: t('mentorship'),
      description: t('mentorshipDesc'),
      features: [t('mentorshipFeature1'), t('mentorshipFeature2'), t('mentorshipFeature3')]
    }
  ];

  return (
    <section id="services" data-testid="services" className="section-padding bg-brand-navy">
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

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-brand-ink/50 backdrop-blur-sm rounded-lg p-6 hover:bg-brand-ink/70 transition-all duration-300 hover:shadow-xl hover:shadow-brand-gold/10 group"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-brand-gold/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-brand-gold/30 transition-colors duration-300">
                <service.icon className="w-8 h-8 text-brand-gold" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-heading font-semibold mb-3 text-white">
                {service.title}
              </h3>
              
              <p className="text-gray-300 mb-4">
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-400">
                    <div className="w-1.5 h-1.5 bg-brand-gold rounded-full flex-shrink-0"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Hover Effect */}
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => {
                    const event = new CustomEvent('openConsultationModal');
                    window.dispatchEvent(event);
                  }}
                  className="text-brand-gold hover:text-white text-sm font-medium transition-colors duration-200"
                >
                  {t('learnMore')} →
                </button>
              </div>
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
            <button
              onClick={() => {
                const event = new CustomEvent('openConsultationModal');
                window.dispatchEvent(event);
              }}
              className="btn-primary"
            >
              {t('bookConsultation')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
