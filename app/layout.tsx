import type { Metadata } from 'next'
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  preload: true,
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
  preload: true,
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'Student Mentor - UPSC Exam Preparation Platform',
    template: '%s | Student Mentor'
  },
  description: 'Comprehensive UPSC exam preparation platform with mock tests, study materials, progress tracking, and personalized guidance for civil service aspirants.',
  keywords: ['UPSC', 'Civil Services', 'Exam Preparation', 'Mock Tests', 'Study Materials', 'Progress Tracking', 'Student Mentor'],
  authors: [{ name: 'Student Mentor Team' }],
  creator: 'Student Mentor',
  publisher: 'Student Mentor',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://student-mentor.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    title: 'Student Mentor - UPSC Exam Preparation Platform',
    description: 'Comprehensive UPSC exam preparation platform with mock tests, study materials, progress tracking, and personalized guidance for civil service aspirants.',
    siteName: 'Student Mentor',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Student Mentor - UPSC Exam Preparation Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Student Mentor - UPSC Exam Preparation Platform',
    description: 'Comprehensive UPSC exam preparation platform with mock tests, study materials, progress tracking, and personalized guidance for civil service aspirants.',
    images: ['/og-image.jpg'],
    creator: '@studentmentor',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
<body
        className={`
          ${playfair.variable}
          ${inter.variable}
          ${jetbrains.variable}
          bg-ink-800 text-ink-100 font-body antialiased
        `}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#241d16', color: '#e8e3d8', border: '1px solid #3d3124' },
            success: { iconTheme: { primary: '#12b97a', secondary: '#032b20' } },
            error: { iconTheme: { primary: '#ff7c0a', secondary: '#451400' } }
          }}
        />
        {children}
      </body>
    </html>
  )
}
