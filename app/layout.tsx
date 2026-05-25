import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { CartProvider } from '@/components/providers/CartProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { EasterEggs } from '@/components/ui/EasterEggs'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { CursorGrid } from '@/components/ui/CursorGrid'

export const metadata: Metadata = {
  title: 'riaz.art — bold digital art',
  description: 'Stickers, posters, and prints by riaz. Bold. Graphic. Yours.',
  openGraph: {
    title: 'riaz.art',
    description: 'Bold digital art — stickers & posters',
    url: 'https://riaz.art',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-body bg-chalk text-ink dark:bg-ink dark:text-chalk antialiased transition-colors duration-300 min-h-screen flex flex-col">
        <ThemeProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <EasterEggs />
            <CursorGrid />
            <CustomCursor />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
