import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/motion'
import { setLenis } from '@/lib/lenis'
import Nav from '@/sections/Nav'
import Hero from '@/sections/Hero'
import Mission from '@/sections/Mission'
import Donate from '@/sections/Donate'
import Impact from '@/sections/Impact'
import Programs from '@/sections/Programs'
import Story from '@/sections/Story'
import Transparency from '@/sections/Transparency'
import Footer from '@/sections/Footer'

export default function Home() {
  useEffect(() => {
    // Lenis smooth scroll driven by the GSAP ticker
    const lenis = new Lenis({ lerp: 0.1 })
    setLenis(lenis)

    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    const raf = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.off('scroll', onScroll)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  return (
    <div className="bg-paper text-ink">
      <Nav />
      <main>
        <Hero />
        <Mission />
        <Donate />
        <Impact />
        <Programs />
        <Story />
        <Transparency />
      </main>
      <Footer />
    </div>
  )
}
