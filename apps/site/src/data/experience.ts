// TODO: In Phase 6 (CMS), this data should move to database with RBAC
// This is local-only data for Phase 5

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  logo: string;
  url?: string;
  summary: string;
  achievements: string[];
}

export const experienceData: ExperienceItem[] = [
  {
    id: 'facebook',
    company: 'Facebook',
    role: 'Senior Legal Counsel',
    period: '2019 - 2023',
    logo: '/images/experience/facebook.png',
    url: 'https://facebook.com',
    summary: 'Led complex international legal matters and strategic business initiatives for one of the world\'s largest technology companies.',
    achievements: [
      'Managed cross-border regulatory compliance across 50+ countries',
      'Led arbitration proceedings resulting in $2.5M+ in favorable settlements',
      'Developed legal frameworks for emerging technology products',
      'Mentored junior legal team members and established best practices'
    ]
  },
  {
    id: 'google',
    company: 'Google',
    role: 'Legal Strategy Advisor',
    period: '2016 - 2019',
    logo: '/images/experience/google.png',
    url: 'https://google.com',
    summary: 'Provided strategic legal guidance for global business expansion and technology innovation initiatives.',
    achievements: [
      'Advised on international business structuring and tax optimization',
      'Negotiated complex commercial agreements worth $500M+',
      'Led legal due diligence for major acquisitions',
      'Established compliance programs for new market entries'
    ]
  },
  {
    id: 'lenovo',
    company: 'Lenovo',
    role: 'International Legal Counsel',
    period: '2013 - 2016',
    logo: '/images/experience/lenovo.png',
    url: 'https://lenovo.com',
    summary: 'Specialized in international commercial law and cross-border dispute resolution for global technology operations.',
    achievements: [
      'Resolved complex international commercial disputes',
      'Managed legal operations across Asia-Pacific and EMEA regions',
      'Developed risk mitigation strategies for global supply chains',
      'Led contract negotiations with major technology partners'
    ]
  },
  {
    id: 'circleci',
    company: 'CircleCI',
    role: 'Legal Advisory',
    period: '2011 - 2013',
    logo: '/images/experience/circleci.png',
    url: 'https://circleci.com',
    summary: 'Provided comprehensive legal support for a fast-growing technology startup, focusing on business formation and growth strategies.',
    achievements: [
      'Established legal foundation for rapid business scaling',
      'Developed intellectual property protection strategies',
      'Managed employment law compliance during rapid hiring',
      'Advised on venture capital and funding negotiations'
    ]
  }
];
