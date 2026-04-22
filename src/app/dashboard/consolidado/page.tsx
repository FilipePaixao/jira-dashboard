import { SPRINTS_OVERVIEW_DISCLAIMER } from '@/modules/sprints/overview-disclaimer'
import { listSprintsPaginated, parseSprintListQuery } from '@/modules/sprints/sprint-list-query'
import { ConsolidadoClient } from './ConsolidadoClient'

export const dynamic = 'force-dynamic'

export default async function ConsolidadoPage() {
  const parsed = parseSprintListQuery(
    new URLSearchParams({
      page: '1',
      limit: '15',
      includeChartSeries: 'true',
    }),
  )
  const r = await listSprintsPaginated(parsed)
  const totalPages = Math.max(1, Math.ceil(r.total / r.limit))

  return (
    <ConsolidadoClient
      initialSprints={r.items}
      initialChartSeries={r.chartSeries ?? []}
      initialPagination={{
        page: r.page,
        limit: r.limit,
        total: r.total,
        totalPages,
        hasNextPage: r.page < totalPages,
        hasPrevPage: r.page > 1,
      }}
      disclaimer={SPRINTS_OVERVIEW_DISCLAIMER}
    />
  )
}
