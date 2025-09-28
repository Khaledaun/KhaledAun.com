
import './globals.css';

export const metadata = {
  title: 'KhaledAun.com Admin',
  description: 'Admin dashboard for KhaledAun.com',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

