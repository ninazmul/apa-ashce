import type { Metadata, Viewport } from 'next';
import './globals.css';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://ninazmul.github.io/apa-ashce';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'আপা আসছে! | Apa Ashche — বাংলা পলিটিক্যাল স্যাটায়ার আর্কেড গেম',
    template: '%s | আপা আসছে!',
  },
  description:
    'বাংলা ও ইংরেজিতে—একটি হাস্যরসাত্মক বাংলাদেশি পলিটিক্যাল স্যাটায়ার আর্কেড গেম। সীমান্ত বাধা পার করে এগিয়ে চলুন—আর্কেড অ্যাকশন, মিম ডায়ালগ এবং চারটি যাত্রা।',
  applicationName: 'আপা আসছে! / Apa Ashche',
  keywords: [
    'আপা আসছে',
    'Apa Ashche',
    'বাংলা গেম',
    'Bangla game',
    'Bangladesh arcade game',
    'political satire game',
    'পলিটিক্যাল স্যাটায়ার',
    'browser game',
  ],
  authors: [{ name: 'Rizmec' }],
  creator: 'Rizmec',
  publisher: 'Rizmec',
  category: 'games',
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: '/',
    languages: {
      'bn-BD': '/',
      'en-US': '/',
      'x-default': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    alternateLocale: ['en_US'],
    url: '/',
    siteName: 'আপা আসছে! / Apa Ashche',
    title: 'আপা আসছে! | Apa Ashche',
    description:
      'A Bengali political satire arcade game. Play across Bangladesh borders, overcome obstacles, and chase a high score.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Apa Ashche — a Bengali political satire arcade game',
        type: 'image/svg+xml',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'আপা আসছে! | Apa Ashche',
    description:
      'একটি হাস্যরসাত্মক বাংলা পলিটিক্যাল স্যাটায়ার আর্কেড গেম।',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
    ],
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn-BD" className="dark" suppressHydrationWarning>
      <head>
        <meta httpEquiv="content-language" content="bn-BD, en-US" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'VideoGame',
              name: 'আপা আসছে! / Apa Ashche',
              alternateName: ['Apa Ashche', 'আপা আসছে'],
              description:
                'A Bengali and English political satire side-scrolling arcade browser game set across fictional Bangladesh border challenges.',
              inLanguage: ['bn-BD', 'en-US'],
              applicationCategory: 'Game',
              operatingSystem: 'Any',
              gamePlatform: 'Web browser',
              playMode: 'SinglePlayer',
              genre: ['Arcade', 'Satire', 'Side-scroller'],
              isAccessibleForFree: true,
              url: siteUrl,
              image: `${siteUrl}/og-image.svg`,
              publisher: {
                '@type': 'Organization',
                name: 'Rizmec',
                url: 'https://rizmec.com',
              },
            }),
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@400;600;800&family=Hind+Siliguri:wght@400;600;700&family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="font-bn bg-[#0b0f19] text-gray-100 antialiased overflow-hidden select-none"
      >
        {children}
      </body>
    </html>
  );
}
