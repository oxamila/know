import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import 'katex/dist/katex.min.css'
import './globals.css'
import { siteName, siteUrl } from '@/lib/site'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Explore knowledge by category`,
    template: `%s | ${siteName}`,
  },
  description:
    'Know — categorized articles with interactive math visualizations and compile-time KaTeX rendering.',
  applicationName: siteName,
  openGraph: {
    siteName,
    type: 'website',
    url: siteUrl,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-extrabold text-transparent"
            >
              Know
            </Link>
            <nav className="flex gap-4 text-sm font-medium text-gray-600">
              <Link href="/" className="hover:text-blue-600">
                Home
              </Link>
              <Link href="/docs" className="hover:text-blue-600">
                Docs
              </Link>
              <Link href="/sitemap.xml" className="hover:text-blue-600">
                Sitemap
              </Link>
              <a
                href="https://github.com/oxamila/know"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-16 border-t border-gray-200">
          <div className="mx-auto flex max-w-6xl justify-between px-6 py-6 text-sm text-gray-500">
            <span>© {new Date().getFullYear()} Know</span>
            <span>Built with Next.js, MDX &amp; KaTeX</span>
          </div>
        </footer>
      </body>
    </html>
  )
}
