/** Estatísticos para tempos (dias) e arrays parciais. */

export function medianOf(values: number[]): number | null {
  if (values.length === 0) {
    return null
  }
  const s = [...values].sort((a, b) => a - b)
  const m = s.length
  if (m % 2) {
    return s[(m - 1) >> 1]!
  }
  return (s[m / 2 - 1]! + s[m / 2]!) / 2
}

/**
 * Percentil (definição de vizinho mais próximo), p em [0,100].
 */
export function percentileNearest(values: number[], p: number): number | null {
  if (values.length === 0 || !Number.isFinite(p)) {
    return null
  }
  const s = [...values].sort((a, b) => a - b)
  const n = s.length
  if (n === 1) {
    return s[0]!
  }
  const clampP = Math.min(100, Math.max(0, p))
  const r = (clampP / 100) * (n - 1)
  const lo = Math.floor(r)
  const hi = Math.ceil(r)
  if (lo === hi) {
    return s[lo]!
  }
  return s[lo]! + (s[hi]! - s[lo]!) * (r - lo)
}

export function p85Of(values: number[]): number | null {
  return percentileNearest(values, 85)
}
