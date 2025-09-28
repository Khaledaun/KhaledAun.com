import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, Playfair_Display } from 'next/font/google';
import { ModalProvider } from '../../context/ModalContext.js';
import '../globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body'
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-heading'
});

const locales = ['en', 'ar'];

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export const metadata = {
  title: 'Khaled Aun - Legal Strategy & Business Growth',
  description: 'Expert legal counsel for complex business challenges and growth opportunities.',
  openGraph: {
    title: 'Khaled Aun - Legal Strategy & Business Growth',
    description: 'Expert legal counsel for complex business challenges and growth opportunities.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Khaled Aun - Legal Strategy & Business Growth',
    description: 'Expert legal counsel for complex business challenges and growth opportunities.',
  },
};

export default async function LocaleLayout({children, params: {locale}}) {
  if (!locales.includes(locale)) notFound();

  const messages = await getMessages();

  return (
    <html 
      dir={locale === 'ar' ? 'rtl' : 'ltr'} 
      lang={locale}
      className="dark"
    >
      <body className={`${inter.variable} ${playfair.variable} font-body bg-brand-navy text-white`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand-gold text-brand-navy px-4 py-2 rounded z-50"
        >
          Skip to main content
        </a>
        <NextIntlClientProvider messages={messages}>
          <ModalProvider>
            {children}
          </ModalProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
