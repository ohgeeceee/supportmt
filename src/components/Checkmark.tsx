type CheckmarkProps = {
  className?: string
}

/**
 * Code-drawn self-drawing checkmark: circle traces itself first, then the
 * gold tick draws in (staggered via animation delay). Uses the site's
 * `draw-anim` keyframes from index.css.
 */
export default function Checkmark({ className = 'h-16 w-16' }: CheckmarkProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <circle
        cx="32"
        cy="32"
        r="28"
        stroke="#1D6151"
        strokeWidth="2"
        pathLength={1}
        className="draw-anim"
      />
      <path
        d="M20 33 L28.5 41.5 L44.5 24"
        stroke="#FDE460"
        strokeWidth="3.5"
        pathLength={1}
        className="draw-anim"
        style={{ animationDelay: '0.5s' }}
      />
    </svg>
  )
}
