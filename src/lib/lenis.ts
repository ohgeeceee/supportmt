import type Lenis from 'lenis'

let lenis: Lenis | null = null

export function setLenis(instance: Lenis | null) {
  lenis = instance
}

export function scrollToId(id: string) {
  const target = document.getElementById(id)
  if (!target) return
  if (lenis) {
    lenis.scrollTo(target, { offset: -76, duration: 1.5 })
  } else {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}

export function scrollToTop() {
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.5 })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
