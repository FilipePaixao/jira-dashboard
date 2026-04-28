import type { JiraChangelogItem, JiraIssueSnapshot } from '@/modules/jira-sync/types'

export type DwellSegment = {
  status: string
  startMs: number
  endMs: number
}

export function getStatusNameAtT(segs: DwellSegment[], tMs: number, fallback: string): string {
  for (const s of segs) {
    if (tMs >= s.startMs && tMs < s.endMs) {
      return s.status
    }
  }
  if (segs.length) {
    const last = segs[segs.length - 1]!
    if (tMs >= last.endMs) {
      return last.status
    }
  }
  return fallback
}

/**
 * Reconstrói segmentos [início, fim) de permanência em cada coluna, até `endAt` (sincronização / resolução).
 */
export function buildStatusDwellSegments(input: {
  createdAt: string
  endAt: string
  currentStatus: string
  statusTransitions: JiraChangelogItem[]
}): DwellSegment[] {
  const t0 = new Date(input.createdAt).getTime()
  const tEnd = new Date(input.endAt).getTime()
  if (!Number.isFinite(t0) || !Number.isFinite(tEnd) || tEnd <= t0) {
    return [
      { status: input.currentStatus, startMs: t0, endMs: t0 },
    ]
  }
  const trans = [...input.statusTransitions].filter((x) => x.field === 'status')
  if (trans.length === 0) {
    return [{ status: input.currentStatus, startMs: t0, endMs: tEnd }]
  }
  const segs: DwellSegment[] = []
  let t = t0
  const first = trans[0]!
  const beforeFirst =
    (first.from && first.from.trim() !== '' ? first.from : null) ||
    (first.to && first.to.trim() !== '' ? first.to : null) ||
    input.currentStatus
  let s = beforeFirst
  for (const tr of trans) {
    const ta = new Date(tr.at).getTime()
    if (!Number.isFinite(ta) || ta <= 0) {
      continue
    }
    if (ta > t) {
      const a = t
      const b = Math.min(ta, tEnd)
      if (b > a) {
        segs.push({ status: s, startMs: a, endMs: b })
      }
    }
    t = Math.max(t, ta)
    s = (tr.to && tr.to.trim() !== '' ? tr.to : null) || s
  }
  if (t < tEnd) {
    segs.push({ status: s, startMs: t, endMs: tEnd })
  }
  return segs
}

const DONE_RE = /(done|closed|complete|resolved|cancel|cancelled)/i
const BACKLOG_RE = /(to do|to-do|backlog|triage|new|open)(?!.*in progress)/i
const WORK_RE = /(in progress|in development|doing|development|implement|coding|code|active|wip|working)/i
const REVIEW_RE = /(review|pull request|pr|merge)/i
const QA_RE = /(\bqa\b|quality|test|testing|uat|validation|verify)/i
const BLOCKED_RE = /(block|imped|on hold|wait|stuck|pause)/i
const HOTFIX_RE = /hotfix/i
const ESCAPED_RE = /(escaped|escape|produ[cç]ao|production|field defect)/i

export function isDoneishStatus(name: string): boolean {
  return DONE_RE.test(name.trim())
}

export function isWipishStatus(name: string): boolean {
  const t = name.trim()
  if (isDoneishStatus(t)) {
    return false
  }
  if (BACKLOG_RE.test(t)) {
    return false
  }
  if (REVIEW_RE.test(t) || QA_RE.test(t) || BLOCKED_RE.test(t) || WORK_RE.test(t)) {
    return true
  }
  return t.length > 0
}

function classifyDwell(status: string): {
  isReview: boolean
  isQa: boolean
  isBlocked: boolean
  isWork: boolean
} {
  return {
    isReview: REVIEW_RE.test(status),
    isQa: QA_RE.test(status) && !REVIEW_RE.test(status),
    isBlocked: BLOCKED_RE.test(status),
    isWork: WORK_RE.test(status) || (isWipishStatus(status) && !REVIEW_RE.test(status) && !QA_RE.test(status) && !BLOCKED_RE.test(status)),
  }
}

/**
 * Soma (em dias) no recorte, por issue, para apoiar métricas de fluxo.
 */
export function sumDwellDaysInCategories(segments: DwellSegment[]): {
  allDays: number
  workDays: number
  reviewDays: number
  qaDays: number
  blockedDays: number
} {
  let allDays = 0
  let workDays = 0
  let reviewDays = 0
  let qaDays = 0
  let blockedDays = 0
  for (const s of segments) {
    if (s.endMs <= s.startMs) {
      continue
    }
    const d = (s.endMs - s.startMs) / 86_400_000
    allDays += d
    const c = classifyDwell(s.status)
    if (c.isReview) {
      reviewDays += d
    } else if (c.isQa) {
      qaDays += d
    } else if (c.isBlocked) {
      blockedDays += d
    } else if (c.isWork) {
      workDays += d
    }
  }
  return { allDays, workDays, reviewDays, qaDays, blockedDays }
}

/**
 * Número de reopens: transições a partir de estado “done-like” para fora.
 */
export function countReopenTransitions(statusTransitions: JiraChangelogItem[]): number {
  const trans = statusTransitions.filter((x) => x.field === 'status')
  let n = 0
  for (const t of trans) {
    const from = (t.from && t.from.trim() !== '' ? t.from : '') || ''
    const to = (t.to && t.to.trim() !== '' ? t.to : '') || ''
    if (isDoneishStatus(from) && !isDoneishStatus(to)) {
      n += 1
    }
  }
  return n
}

/**
 * Dwell por nome de coluna, para time-in-status.
 */
export function sumDwellDaysByStatusName(
  segments: DwellSegment[],
): Map<string, { days: number; startMs: number; endMs: number }> {
  const m = new Map<string, { days: number; startMs: number; endMs: number }>()
  for (const s of segments) {
    if (s.endMs <= s.startMs) {
      continue
    }
    const d = (s.endMs - s.startMs) / 86_400_000
    const key = s.status.trim() || '—'
    const cur = m.get(key) ?? { days: 0, startMs: s.startMs, endMs: s.endMs }
    cur.days += d
    cur.startMs = Math.min(cur.startMs, s.startMs)
    cur.endMs = Math.max(cur.endMs, s.endMs)
    m.set(key, cur)
  }
  return m
}

/**
 * Média temporal do número de issues em estado WIP, e pico, na janela de observação.
 */
export function computeWipMetricsForIssues(
  allSegs: DwellSegment[][],
  issues: JiraIssueSnapshot[],
  syncedAt: string,
): { wipAverage: number; wipPeak: number; wipP85: number } {
  const tEnd = new Date(syncedAt).getTime()
  if (issues.length === 0 || allSegs.length === 0) {
    return { wipAverage: 0, wipPeak: 0, wipP85: 0 }
  }
  const t0 = Math.min(...issues.map((i) => new Date(i.createdAt).getTime()), tEnd)
  if (!Number.isFinite(t0) || tEnd <= t0) {
    return { wipAverage: 0, wipPeak: 0, wipP85: 0 }
  }
  const eventTimes = new Set<number>([t0, tEnd])
  for (const segs of allSegs) {
    for (const s of segs) {
      if (s.endMs > t0 && s.startMs < tEnd) {
        eventTimes.add(Math.max(t0, Math.min(s.startMs, tEnd)))
        eventTimes.add(Math.max(t0, Math.min(s.endMs, tEnd)))
      }
    }
  }
  const sorted = [...eventTimes].filter((t) => t >= t0 && t <= tEnd).sort((a, b) => a - b)
  let num = 0
  let den = 0
  let peak = 0
  const bins: { value: number; dur: number }[] = []
  for (let k = 0; k < sorted.length - 1; k += 1) {
    const a = sorted[k]!
    const b = sorted[k + 1]!
    if (b <= a) {
      continue
    }
    const mid = a + (b - a) / 2
    let cnt = 0
    for (let j = 0; j < issues.length; j += 1) {
      const segs = allSegs[j] ?? []
      const iss = issues[j]!
      const name = getStatusNameAtT(segs, mid, iss.status)
      if (isWipishStatus(name)) {
        cnt += 1
      }
    }
    const dur = b - a
    num += cnt * dur
    den += dur
    bins.push({ value: cnt, dur })
    if (cnt > peak) {
      peak = cnt
    }
  }
  return { wipAverage: den > 0 ? num / den : 0, wipPeak: peak, wipP85: weightedP85(bins) }
}

function weightedP85(bins: { value: number; dur: number }[]): number {
  if (bins.length === 0) {
    return 0
  }
  const valid = bins.filter((b) => b.dur > 0)
  const total = valid.reduce((acc, b) => acc + b.dur, 0)
  if (total <= 0) {
    return 0
  }
  const threshold = total * 0.85
  const sorted = [...valid].sort((a, b) => a.value - b.value)
  let acc = 0
  for (const b of sorted) {
    acc += b.dur
    if (acc >= threshold) {
      return b.value
    }
  }
  return sorted[sorted.length - 1]!.value
}

export { HOTFIX_RE, ESCAPED_RE }
