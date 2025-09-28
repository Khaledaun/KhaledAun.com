'use client';

import { useTranslations } from 'next-intl';
import { Linkedin, ExternalLink, Calendar, MessageSquare } from 'lucide-react';

export default function LinkedInSection() {
  const t = useTranslations('LinkedIn');

  // Check if LinkedIn wall embed is enabled
  const isWallEnabled = process.env.NEXT_PUBLIC_FF_SOCIAL_WALL === 'true';
  const wallEmbedHtml = process.env.NEXT_PUBLIC_LINKEDIN_WALL_EMBED_HTML;
  const linkedinProfileUrl = process.env.NEXT_PUBLIC_LINKEDIN_PROFILE_URL || 'https://linkedin.com/in/khaledaun';

  // Sample LinkedIn posts (in real implementation, these would come from an API)
  const samplePosts = [
    {
      id: 1,
      title: t('post1Title'),
      excerpt: t('post1Excerpt'),
      date: '2024-09-15',
      url: `${linkedinProfileUrl}/posts/1`
    },
    {
      id: 2,
      title: t('post2Title'),
      excerpt: t('post2Excerpt'),
      date: '2024-09-10',
      url: `${linkedinProfileUrl}/posts/2`
    },
    {
      id: 3,
      title: t('post3Title'),
      excerpt: t('post3Excerpt'),
      date: '2024-09-05',
      url: `${linkedinProfileUrl}/posts/3`
    }
  ];

  return (
    <section id="linkedin" data-testid="linkedin" className="section-padding bg-brand-ink">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-brand-gold">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {isWallEnabled && wallEmbedHtml ? (
          // LinkedIn Wall Embed
          <div className="max-w-4xl mx-auto">
            <div 
              className="bg-white rounded-lg p-6"
              dangerouslySetInnerHTML={{ __html: wallEmbedHtml }}
            />
            
            {/* Follow Button */}
            <div className="text-center mt-8">
              <a
                href={linkedinProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center space-x-2"
              >
                <Linkedin className="w-5 h-5" />
                <span>{t('followLinkedIn')}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          // Curated LinkedIn Posts
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {samplePosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-brand-navy/50 backdrop-blur-sm rounded-lg p-6 hover:bg-brand-navy/70 transition-all duration-300 hover:shadow-xl hover:shadow-brand-gold/10 group"
                >
                  {/* Post Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-brand-gold rounded-full flex items-center justify-center">
                      <Linkedin className="w-5 h-5 text-brand-navy" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Khaled Aun</div>
                      <div className="text-sm text-gray-400 flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <h3 className="font-semibold text-white mb-3 group-hover:text-brand-gold transition-colors duration-200">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Read More Link */}
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-brand-gold hover:text-white transition-colors duration-200 text-sm font-medium"
                  >
                    <span>{t('readMore')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>

            {/* Follow LinkedIn CTA */}
            <div className="text-center">
              <div className="bg-brand-navy/30 backdrop-blur-sm rounded-lg p-8 max-w-2xl mx-auto">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Linkedin className="w-8 h-8 text-brand-gold" />
                  <h3 className="text-2xl font-heading font-semibold text-white">
                    {t('followTitle')}
                  </h3>
                </div>
                
                <p className="text-gray-300 mb-6">
                  {t('followDescription')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href={linkedinProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <Linkedin className="w-5 h-5" />
                    <span>{t('followLinkedIn')}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  
                  <button
                    onClick={() => {
                      const event = new CustomEvent('openConsultationModal');
                      window.dispatchEvent(event);
                    }}
                    className="btn-secondary inline-flex items-center space-x-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>{t('connectDirectly')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
