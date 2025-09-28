'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Scale, Users, Globe, Shield, Award, BookOpen } from 'lucide-react';

export default function About() {
  const t = useTranslations('About');

  const expertiseAreas = [
    {
      icon: Scale,
      title: t('litigation'),
      description: t('litigationDesc')
    },
    {
      icon: Users,
      title: t('arbitration'),
      description: t('arbitrationDesc')
    },
    {
      icon: Globe,
      title: t('crossBorder'),
      description: t('crossBorderDesc')
    },
    {
      icon: Shield,
      title: t('conflictPrevention'),
      description: t('conflictPreventionDesc')
    },
    {
      icon: Award,
      title: t('businessStrategy'),
      description: t('businessStrategyDesc')
    }
  ];

  return (
    <section id="about" data-testid="about" className="section-padding bg-brand-ink">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-brand-gold">
              {t('title')}
            </h2>
            
            <p className="text-lg text-gray-300 mb-6">
              {t('description')}
            </p>

            <p className="text-gray-300 mb-8">
              {t('experience')}
            </p>

            {/* Expertise Areas */}
            <div className="space-y-4">
              {expertiseAreas.map((area, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-gold/20 rounded-lg flex items-center justify-center">
                    <area.icon className="w-6 h-6 text-brand-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{area.title}</h3>
                    <p className="text-gray-400 text-sm">{area.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8">
              <a
                href="/documents/khaled-aun-profile.pdf"
                download
                className="btn-secondary inline-flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>{t('downloadProfile')}</span>
              </a>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px] rounded-lg overflow-hidden">
              <Image
                src="/images/sections/about-1-placeholder.jpg"
                alt="Legal strategy consultation and business advisory"
                fill
                className="object-cover"
              />
            </div>
            
            {/* Experience Badge */}
            <div className="absolute -bottom-6 -right-6 bg-brand-gold text-brand-navy p-6 rounded-lg shadow-xl">
              <div className="text-center">
                <div className="text-3xl font-bold">15+</div>
                <div className="text-sm font-medium">{t('yearsExperience')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
