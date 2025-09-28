import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body'
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-heading'
});

export const metadata = {
  title: 'Khaled Aun - Legal Strategy & Business Growth',
  description: 'Expert legal counsel for complex business challenges and growth opportunities.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-body antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand-navy text-white px-4 py-2 rounded z-50">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
