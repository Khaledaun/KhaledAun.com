import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KhaledAun.com - Personal Website',
  description: 'Personal website and blog of Khaled Aun',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-white">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  KhaledAun.com
                </h1>
                <nav className="flex space-x-6">
                  <a
                    href="/"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Home
                  </a>
                  <a
                    href="/blog"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Blog
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main>{children}</main>
          <footer className="bg-gray-50 border-t">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-gray-500 text-sm">
                © 2024 KhaledAun.com. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}