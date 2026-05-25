import { Hero } from '@/components/home/Hero'
import { MarqueeBanner } from '@/components/home/MarqueeBanner'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { AboutSnippet } from '@/components/home/AboutSnippet'

export default function HomePage() {
  return (
    <>
      <Hero />
      <MarqueeBanner />
      <FeaturedProducts />
      <AboutSnippet />
    </>
  )
}
