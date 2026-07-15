import { PaperTexture } from '@/design/textures'
import { LandingHero } from './LandingHero'
import { LandingFeatures } from './LandingFeatures'
import { LandingSocialProof } from './LandingSocialProof'
import { LandingFooter } from './LandingFooter'

function LandingPage() {
  return (
    <div className="min-h-screen bg-paper relative">
      <PaperTexture />
      <LandingHero />
      <LandingFeatures />
      <LandingSocialProof />
      <LandingFooter />
    </div>
  )
}

export { LandingPage }
