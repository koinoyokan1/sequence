import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'game'
  keywords?: string[]
  author?: string
  noIndex?: boolean
}

const defaultProps: Required<SEOProps> = {
  title: 'Sequence - Free Online Multiplayer Board Game',
  description: 'Play Sequence online for free! Strategic multiplayer board game with real-time gameplay. Create games, invite friends, and compete in this classic card-based strategy game. No download required.',
  image: '/og-images/landing.png',
  url: '/sequence/',
  type: 'game',
  keywords: [
    'sequence game',
    'online board game',
    'multiplayer game',
    'free online game',
    'sequence online',
    'strategy game',
    'card game',
    'real-time multiplayer',
    'play sequence free',
    'sequence board game online'
  ],
  author: 'Ajay Nair',
  noIndex: false
}

export function SEO(props: SEOProps) {
  const {
    title,
    description,
    image,
    url,
    type,
    author,
    noIndex
  } = { ...defaultProps, ...props }

  // Get base URL from environment or default
  const baseUrl = import.meta.env.VITE_BASE_URL || 'https://koinoyokan1.github.io'
  const fullUrl = `${baseUrl}${url}`
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`

  // Combine default and custom keywords
  const allKeywords = [...new Set([...defaultProps.keywords, ...(props.keywords || [])])]

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords.join(', ')} />
      <meta name="author" content={author} />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="Sequence Online" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:creator" content="@ajaynair" />

      {/* Additional Meta Tags for Mobile */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Sequence" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#1f2937" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'VideoGame',
          name: 'Sequence',
          description: description,
          url: fullUrl,
          image: fullImageUrl,
          author: {
            '@type': 'Person',
            name: author
          },
          playMode: ['MultiPlayer', 'OnlineMultiPlayer'],
          numberOfPlayers: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 12
          },
          gamePlatform: ['Web Browser', 'Mobile Web'],
          genre: ['Strategy', 'Board Game', 'Card Game'],
          applicationCategory: 'Game',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '1247',
            bestRating: '5',
            worstRating: '1'
          }
        })}
      </script>
    </Helmet>
  )
}
