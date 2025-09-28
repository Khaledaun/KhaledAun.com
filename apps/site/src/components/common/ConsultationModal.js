'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, Calendar, Mail } from 'lucide-react';

export default function ConsultationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [calendlyUrl, setCalendlyUrl] = useState('');
  const t = useTranslations('Consultation');

  useEffect(() => {
    // Get Calendly URL from environment
    setCalendlyUrl(process.env.NEXT_PUBLIC_CALENDLY_URL || '');

    // Listen for modal open events
    const handleOpenModal = () => {
      setIsOpen(true);
      document.body.style.overflow = 'hidden';
    };

    window.addEventListener('openConsultationModal', handleOpenModal);
    
    return () => {
      window.removeEventListener('openConsultationModal', handleOpenModal);
      document.body.style.overflow = 'unset';
    };
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    document.body.style.overflow = 'unset';
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-brand-ink rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-gold/20">
          <h2 className="text-2xl font-heading font-semibold text-white">
            {t('title')}
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {calendlyUrl ? (
            // Calendly Integration
            <div>
              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  {t('calendlyDescription')}
                </p>
                <div className="flex items-center space-x-2 text-brand-gold">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">{t('selectTime')}</span>
                </div>
              </div>

              {/* Calendly Widget */}
              <div className="bg-white rounded-lg p-4">
                <iframe
                  src={calendlyUrl}
                  width="100%"
                  height="600"
                  frameBorder="0"
                  title="Calendly Booking Widget"
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
          ) : (
            // Fallback Contact Form
            <div>
              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  {t('fallbackDescription')}
                </p>
                <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 text-brand-gold">
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">{t('contactEmail')}</span>
                  </div>
                  <a
                    href="mailto:consultation@khaledaun.com"
                    className="text-white hover:text-brand-gold transition-colors duration-200 ml-8"
                  >
                    consultation@khaledaun.com
                  </a>
                </div>
              </div>

              {/* Contact Form */}
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      {t('name')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-3 bg-brand-navy border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                      placeholder={t('namePlaceholder')}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      {t('email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 bg-brand-navy border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                      placeholder={t('emailPlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                    {t('phone')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-3 bg-brand-navy border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                    placeholder={t('phonePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-2">
                    {t('service')}
                  </label>
                  <select
                    id="service"
                    name="service"
                    className="w-full px-4 py-3 bg-brand-navy border border-gray-600 rounded-lg text-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                  >
                    <option value="">{t('selectService')}</option>
                    <option value="litigation">{t('litigation')}</option>
                    <option value="arbitration">{t('arbitration')}</option>
                    <option value="cross-border">{t('crossBorder')}</option>
                    <option value="business-advisory">{t('businessAdvisory')}</option>
                    <option value="mentorship">{t('mentorship')}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    {t('message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    className="w-full px-4 py-3 bg-brand-navy border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                    placeholder={t('messagePlaceholder')}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary"
                >
                  {t('sendMessage')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
