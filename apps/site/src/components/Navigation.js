'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navigation() {
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const currentLocale = pathname.split('/')[1];
    const newLocale = currentLocale === 'en' ? 'ar' : 'en';
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-heading font-bold text-brand-navy">
            Khaled Aun
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-brand-ink hover:text-brand-gold transition-colors">
              {t('home')}
            </Link>
            <Link href="/about" className="text-brand-ink hover:text-brand-gold transition-colors">
              {t('about')}
            </Link>
            <Link href="/ventures" className="text-brand-ink hover:text-brand-gold transition-colors">
              {t('ventures')}
            </Link>
            <Link href="/insights" className="text-brand-ink hover:text-brand-gold transition-colors">
              {t('insights')}
            </Link>
            <Link href="/contact" className="text-brand-ink hover:text-brand-gold transition-colors">
              {t('contact')}
            </Link>
          </div>
          
          <button
            onClick={toggleLocale}
            className="bg-brand-gold text-brand-navy px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            {pathname.includes('/ar') ? 'EN' : 'AR'}
          </button>
        </div>
      </div>
    </nav>
  );
}
