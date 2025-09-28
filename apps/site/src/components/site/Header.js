'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Menu, X, Globe, Instagram, Linkedin } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const locale = useLocale();
  const t = useTranslations('Navigation');

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const switchLocale = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    window.location.href = `/${newLocale}`;
  };

  const navItems = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/ventures`, label: t('ventures') },
    { href: `/${locale}/insights`, label: t('insights') },
    { href: `/${locale}/contact`, label: t('contact') },
  ];

  return (
    <nav 
      data-testid="header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSticky 
          ? 'bg-brand-navy/95 backdrop-blur-sm shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <span className="text-2xl font-heading font-bold text-brand-gold">
              Khaled Aun
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white hover:text-brand-gold transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Social Badges */}
            {process.env.NEXT_PUBLIC_INSTAGRAM_URL && (
              <a
                href={process.env.NEXT_PUBLIC_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-brand-navy rounded-full flex items-center justify-center text-white hover:text-brand-gold hover:bg-brand-navy/80 transition-all duration-200"
                aria-label={t('followInstagram')}
                title={t('followInstagram')}
                data-testid="instagram-badge"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}

            {process.env.NEXT_PUBLIC_LINKEDIN_URL && (
              <a
                href={process.env.NEXT_PUBLIC_LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-brand-navy rounded-full flex items-center justify-center text-white hover:text-brand-gold hover:bg-brand-navy/80 transition-all duration-200"
                aria-label={t('followLinkedIn')}
                title={t('followLinkedIn')}
                data-testid="linkedin-badge"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}

            {/* Language Switch */}
            <button
              onClick={switchLocale}
              className="flex items-center space-x-1 text-white hover:text-brand-gold transition-colors duration-200"
              aria-label="Switch language"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">
                {locale === 'en' ? 'AR' : 'EN'}
              </span>
            </button>

            {/* Consultation CTA */}
            <button
              onClick={() => {
                // This will trigger the consultation modal
                const event = new CustomEvent('openConsultationModal');
                window.dispatchEvent(event);
              }}
              className="btn-primary"
            >
              {t('bookConsultation')}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white hover:text-brand-gold transition-colors duration-200"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-brand-navy/95 backdrop-blur-sm border-t border-brand-gold/20">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="block px-3 py-2 text-white hover:text-brand-gold transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Social Badges */}
              <div className="flex items-center space-x-4 px-3 py-2">
                {process.env.NEXT_PUBLIC_INSTAGRAM_URL && (
                  <a
                    href={process.env.NEXT_PUBLIC_INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-brand-navy rounded-full flex items-center justify-center text-white hover:text-brand-gold hover:bg-brand-navy/80 transition-all duration-200"
                    aria-label={t('followInstagram')}
                    title={t('followInstagram')}
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}

                {process.env.NEXT_PUBLIC_LINKEDIN_URL && (
                  <a
                    href={process.env.NEXT_PUBLIC_LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-brand-navy rounded-full flex items-center justify-center text-white hover:text-brand-gold hover:bg-brand-navy/80 transition-all duration-200"
                    aria-label={t('followLinkedIn')}
                    title={t('followLinkedIn')}
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
              </div>

              {/* Mobile Language Switch */}
              <button
                onClick={() => {
                  switchLocale();
                  closeMenu();
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 text-white hover:text-brand-gold transition-colors duration-200"
              >
                <Globe className="w-4 h-4" />
                <span>Switch to {locale === 'en' ? 'Arabic' : 'English'}</span>
              </button>

              {/* Mobile Consultation CTA */}
              <button
                onClick={() => {
                  const event = new CustomEvent('openConsultationModal');
                  window.dispatchEvent(event);
                  closeMenu();
                }}
                className="w-full btn-primary mt-4"
              >
                {t('bookConsultation')}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
