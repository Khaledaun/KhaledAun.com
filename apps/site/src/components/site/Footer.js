'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Linkedin, Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations('Footer');

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

  const socialLinks = [
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/in/khaledaun',
      icon: Linkedin
    },
    {
      name: 'Email',
      href: 'mailto:consultation@khaledaun.com',
      icon: Mail
    }
  ];

  return (
    <footer data-testid="footer" className="bg-brand-ink border-t border-brand-gold/20">
      <div className="container">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link href={`/${locale}`} className="flex items-center space-x-2 mb-6">
                <span className="text-2xl font-heading font-bold text-brand-gold">
                  Khaled Aun
                </span>
              </Link>
              
              <p className="text-gray-300 mb-6 max-w-md">
                {t('description')}
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="w-4 h-4 text-brand-gold" />
                  <a 
                    href="mailto:consultation@khaledaun.com"
                    className="hover:text-brand-gold transition-colors duration-200"
                  >
                    consultation@khaledaun.com
                  </a>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-300">
                  <Phone className="w-4 h-4 text-brand-gold" />
                  <span>+1 (555) 123-4567</span>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPin className="w-4 h-4 text-brand-gold" />
                  <span>{t('location')}</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-lg font-heading font-semibold text-white mb-6">
                {t('navigation')}
              </h3>
              <ul className="space-y-3">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-gray-300 hover:text-brand-gold transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-heading font-semibold text-white mb-6">
                {t('services')}
              </h3>
              <ul className="space-y-3">
                <li>
                  <span className="text-gray-300">{t('litigation')}</span>
                </li>
                <li>
                  <span className="text-gray-300">{t('arbitration')}</span>
                </li>
                <li>
                  <span className="text-gray-300">{t('crossBorder')}</span>
                </li>
                <li>
                  <span className="text-gray-300">{t('businessAdvisory')}</span>
                </li>
                <li>
                  <span className="text-gray-300">{t('mentorship')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-brand-gold/20">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Khaled Aun. {t('allRightsReserved')}
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-brand-navy rounded-lg flex items-center justify-center text-gray-300 hover:text-brand-gold hover:bg-brand-navy/80 transition-all duration-200"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Language Switch */}
            <button
              onClick={switchLocale}
              className="flex items-center space-x-2 text-gray-400 hover:text-brand-gold transition-colors duration-200 text-sm"
            >
              <Globe className="w-4 h-4" />
              <span>{locale === 'en' ? 'العربية' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
