export default function sitemap() {
  const baseUrl = 'https://khaledaun.com';
  const locales = ['en', 'ar'];
  const pages = ['', '/about', '/ventures', '/contact'];
  
  const urls = [];
  
  locales.forEach(locale => {
    pages.forEach(page => {
      urls.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: page === '' ? 1 : 0.8,
        alternates: {
          languages: {
            en: `${baseUrl}/en${page}`,
            ar: `${baseUrl}/ar${page}`,
          }
        }
      });
    });
  });
  
  return urls;
}
