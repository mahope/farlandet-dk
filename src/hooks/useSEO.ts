import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
}

export function useSEO({
  title = 'Farlandet.dk - Danmarks fællesskab for fædre og ressourcer',
  description = 'Del og find værdifulde ressourcer for danske fædre. Podcasts, artikler, tips, bøger og meget mere i vores fællesskab.',
  keywords = [],
  image = 'https://farlandet.dk/og-image.jpg',
  url = 'https://farlandet.dk',
  type = 'website'
}: SEOProps = {}) {
  useEffect(() => {
    // Update document title
    document.title = title

    // Update meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords.join(', ') },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: type },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ]

    metaTags.forEach(({ name, property, content }) => {
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`
      let metaElement = document.querySelector(selector) as HTMLMetaElement
      
      if (metaElement) {
        metaElement.content = content
      } else {
        metaElement = document.createElement('meta')
        if (name) metaElement.name = name
        if (property) metaElement.setAttribute('property', property)
        metaElement.content = content
        document.head.appendChild(metaElement)
      }
    })

    // Update canonical URL
    let canonicalElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (canonicalElement) {
      canonicalElement.href = url
    } else {
      canonicalElement = document.createElement('link')
      canonicalElement.rel = 'canonical'
      canonicalElement.href = url
      document.head.appendChild(canonicalElement)
    }
  }, [title, description, keywords, image, url, type])
}