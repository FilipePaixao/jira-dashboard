import { PessoasClient } from './PessoasClient'
import { getIndividualAnalysis } from '@/modules/metrics/individual-analysis'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function firstString(v: string | string[] | undefined): string {
  if (typeof v === 'string') {
    return v.trim()
  }
  if (Array.isArray(v) && v[0] !== undefined) {
    return String(v[0]).trim()
  }
  return ''
}

export default async function DashboardPessoasPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const sprintId = firstString(sp.sprintId)
  const daysRaw = firstString(sp.days)
  const daysParsed = daysRaw ? Number.parseInt(daysRaw, 10) : Number.NaN
  const days =
    Number.isFinite(daysParsed) && daysParsed > 0
      ? Math.min(365 * 5, Math.max(1, daysParsed))
      : 30

  let loadNote: string | null = null
  let initial: Awaited<ReturnType<typeof getIndividualAnalysis>>
  let initialSprintId = ''

  if (sprintId) {
    try {
      initial = await getIndividualAnalysis({ sprintId })
      initialSprintId = sprintId
    } catch {
      loadNote = `Não foi possível carregar a sprint "${sprintId}". A mostrar análise consolidada.`
      initial = await getIndividualAnalysis({ days: 30 })
    }
  } else {
    initial = await getIndividualAnalysis({ days })
  }

  const initialDays = String(initial.days ?? 30)

  return (
    <PessoasClient
      initialData={initial}
      initialSprintId={initialSprintId}
      initialDays={initialDays}
      loadNote={loadNote}
    />
  )
}
