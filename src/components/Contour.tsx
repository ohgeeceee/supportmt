import { useMemo } from 'react'

type Pt = [number, number]

/** Catmull-Rom spline through a closed point loop, emitted as cubic beziers. */
function smoothClosed(pts: Pt[]): string {
  const n = pts.length
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return `${d} Z`
}

/** One nested topographic ring: an elongated wobbly closed contour. */
function contourPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  wobble: number,
  phase: number,
  seed: number,
): string {
  const N = 56
  const pts: Pt[] = []
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2
    const w =
      1 +
      wobble *
        (Math.sin(3 * t + phase) * 0.55 +
          Math.sin(5 * t + phase * 1.7 + seed) * 0.3 +
          Math.sin(8 * t + seed * 2.3) * 0.15)
    pts.push([cx + rx * w * Math.cos(t), cy + ry * w * Math.sin(t)])
  }
  return smoothClosed(pts)
}

type ContourProps = {
  className?: string
  rings?: number
  animated?: boolean
  drift?: boolean
  seed?: number
}

/**
 * Code-drawn topographic contour map: nested wavy closed paths with thin
 * 1px strokes, drawn in via stroke-dashoffset, optional slow drift.
 */
export default function Contour({
  className = '',
  rings = 6,
  animated = true,
  drift = false,
  seed = 1,
}: ContourProps) {
  const paths = useMemo(() => {
    const out: string[] = []
    for (let i = 0; i < rings; i++) {
      const f = i / Math.max(rings - 1, 1)
      out.push(
        contourPath(
          600 + seed * 7,
          640,
          150 + f * 520,
          62 + f * 268,
          0.15 + f * 0.05,
          seed * 1.3 + i * 0.55,
          seed + i,
        ),
      )
    }
    return out
  }, [rings, seed])

  return (
    <svg
      className={className}
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
    >
      <g className={drift ? 'contour-drift' : undefined} stroke="currentColor" strokeWidth="1">
        {paths.map((d, i) =>
          animated ? (
            <path
              key={i}
              d={d}
              pathLength={1}
              className="contour-anim"
              style={{ animationDelay: `${0.25 + i * 0.14}s` }}
            />
          ) : (
            <path key={i} d={d} />
          ),
        )}
      </g>
    </svg>
  )
}
