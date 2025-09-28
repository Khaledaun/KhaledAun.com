'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { ExternalLink, Calendar, MapPin } from 'lucide-react';
import { experienceData } from '../../data/experience';

export default function ExperienceTimeline() {
  const t = useTranslations('Experience');
  const locale = useLocale();

  return (
    <section 
      id="experience" 
      className="section-padding bg-brand-navy"
      aria-labelledby="experience-title"
    >
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            id="experience-title"
            className="text-3xl md:text-4xl font-heading font-bold mb-4 text-brand-gold"
          >
            {t('title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line - Decorative */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-brand-gold/30 hidden lg:block"
            aria-hidden="true"
          />
          
          {/* Timeline Items */}
          <ol 
            role="list" 
            className="space-y-12 lg:space-y-16"
            data-testid="experience-timeline"
          >
            {experienceData.map((item, index) => (
              <li 
                key={item.id}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
                data-testid={`experience-item-${item.id}`}
              >
                {/* Timeline Dot - Decorative */}
                <div 
                  className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-brand-gold rounded-full border-4 border-brand-navy hidden lg:block z-10"
                  aria-hidden="true"
                />

                {/* Content Card */}
                <div className={`w-full lg:w-5/12 ${
                  index % 2 === 0 ? 'lg:pr-8' : 'lg:pl-8'
                }`}>
                  <div className="bg-brand-ink/50 backdrop-blur-sm rounded-lg p-6 hover:bg-brand-ink/70 transition-all duration-300 hover:shadow-xl hover:shadow-brand-gold/10 group">
                    {/* Company Header */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-white rounded-lg p-2 flex-shrink-0">
                        <Image
                          src={item.logo}
                          alt={`${item.company} logo`}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-heading font-semibold text-white group-hover:text-brand-gold transition-colors duration-200">
                          {item.company}
                        </h3>
                        <div className="flex items-center space-x-2 text-brand-gold text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{item.period}</span>
                        </div>
                      </div>
                    </div>

                    {/* Role */}
                    <h4 className="text-lg font-semibold text-brand-gold mb-3">
                      {item.role}
                    </h4>

                    {/* Summary */}
                    <p className="text-gray-300 mb-4">
                      {item.summary}
                    </p>

                    {/* Achievements */}
                    <ul className="space-y-2 mb-4">
                      {item.achievements.map((achievement, achievementIndex) => (
                        <li key={achievementIndex} className="flex items-start space-x-2 text-sm text-gray-400">
                          <div className="w-1.5 h-1.5 bg-brand-gold rounded-full flex-shrink-0 mt-2"></div>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Company Link */}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-brand-gold hover:text-white transition-colors duration-200 text-sm font-medium"
                      >
                        <span>Visit {item.company}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden lg:block lg:w-5/12" />
              </li>
            ))}
          </ol>
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
