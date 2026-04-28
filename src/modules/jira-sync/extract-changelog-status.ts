import type { JiraChangelogItem } from './types'

/**
 * Extrai transições de `status` do changelog Jira (expand=changelog), ordenadas por data.
 * Usado no snapshot e em métricas de fluxo.
 */
export function extractChangelogStatusItems(changelog: unknown): JiraChangelogItem[] {
  if (!changelog || typeof changelog !== 'object') {
    return []
  }
  const c = changelog as { histories?: unknown[] }
  const histories = [...(c.histories ?? [])]
  const items: JiraChangelogItem[] = []

  for (const h of histories) {
    if (!h || typeof h !== 'object') {
      continue
    }
    const he = h as { created?: string; items?: unknown[] }
    const at = typeof he.created === 'string' ? he.created : ''
    if (!at) {
      continue
    }
    for (const raw of he.items ?? []) {
      if (!raw || typeof raw !== 'object') {
        continue
      }
      const it = raw as { field?: string; fromString?: string | null; toString?: string | null; from?: unknown; to?: unknown }
      if (it.field !== 'status') {
        continue
      }
      const from =
        (typeof it.fromString === 'string' ? it.fromString : null) ??
        (typeof it.from === 'string' ? it.from : null)
      const to = (typeof it.toString === 'string' ? it.toString : null) ?? (typeof it.to === 'string' ? it.to : null)
      items.push({
        field: 'status',
        from: from,
        to: to,
        at,
      })
    }
  }

  items.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
  return items
}
