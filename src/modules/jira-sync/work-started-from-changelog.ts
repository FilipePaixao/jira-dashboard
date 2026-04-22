/**
 * Primeira transição de `status` no changelog (ordem cronológica) ≈ início do trabalho ativo
 * para fins de cycle time. Se não houver changelog/expansão, retorna null.
 */
export function extractWorkStartedAtFromChangelog(changelog: unknown): string | null {
  if (!changelog || typeof changelog !== 'object') {
    return null
  }
  const c = changelog as {
    histories?: Array<{ created: string; items?: Array<{ field?: string }> }>
  }
  const histories = [...(c.histories ?? [])].sort(
    (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime(),
  )
  for (const h of histories) {
    const hasStatus = h.items?.some((i) => i.field === 'status')
    if (hasStatus) {
      return h.created
    }
  }
  return null
}
