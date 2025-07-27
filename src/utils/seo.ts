// SEO utilities
export const siteConfig = {
  name: 'Farlandet.dk',
  url: 'https://farlandet.dk',
  title: 'Farlandet.dk - Danmarks fællesskab for fædre og ressourcer',
  description: 'Del og find værdifulde ressourcer for danske fædre. Podcasts, artikler, tips, bøger og meget mere i vores fællesskab.',
  keywords: [
    'danske fædre',
    'forældreskab',
    'fædres fællesskab', 
    'ressourcer til fædre',
    'dansk familieliv',
    'far tips',
    'forældreskab danmark'
  ],
  author: 'Farlandet.dk',
  locale: 'da_DK',
  type: 'website',
  image: {
    url: 'https://farlandet.dk/og-image.jpg',
    width: 1200,
    height: 630,
    alt: 'Farlandet.dk - Danmarks fællesskab for fædre'
  },
  twitter: {
    card: 'summary_large_image',
    site: '@farlandet',
    creator: '@farlandet'
  }
}

export function generatePageTitle(pageTitle?: string): string {
  if (!pageTitle) return siteConfig.title
  return `${pageTitle} - ${siteConfig.name}`
}

export function generatePageDescription(pageDescription?: string): string {
  return pageDescription || siteConfig.description
}

export function generatePageUrl(path: string = ''): string {
  return `${siteConfig.url}${path}`
}

export function generateBreadcrumbs(path: string) {
  const segments = path.split('/').filter(Boolean)
  const breadcrumbs = [
    { name: 'Hjem', url: '/' }
  ]

  let currentPath = ''
  segments.forEach(segment => {
    currentPath += `/${segment}`
    const name = segment.charAt(0).toUpperCase() + segment.slice(1)
    breadcrumbs.push({ name, url: currentPath })
  })

  return breadcrumbs
}

// Generate structured data for search engines
export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteConfig.name,
    "url": siteConfig.url,
    "description": siteConfig.description,
    "inLanguage": siteConfig.locale,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteConfig.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }
}

export function generateResourceStructuredData(resource: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": resource.title,
    "description": resource.description,
    "url": `${siteConfig.url}/resources/${resource.id}`,
    "datePublished": resource.created_at,
    "dateModified": resource.updated_at,
    "author": {
      "@type": "Organization",
      "name": siteConfig.name
    },
    "publisher": {
      "@type": "Organization", 
      "name": siteConfig.name,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteConfig.url}/logo.png`
      }
    }
  }
}