import { DashboardClient } from './DashboardClient'
import { listVelocitySeries } from '@/modules/metrics/velocity-series'
import { listSprintsPaginated, parseSprintListQuery, toSprintListFilters } from '@/modules/sprints/sprint-list-query'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const parsed = parseSprintListQuery(new URLSearchParams({ page: '1', limit: '12' }))
  const [r, velocitySeries] = await Promise.all([
    listSprintsPaginated(parsed),
    listVelocitySeries(toSprintListFilters(parsed), 120),
  ])
  const totalPages = Math.max(1, Math.ceil(r.total / r.limit))

  return (
    <DashboardClient
      initialVelocitySeries={velocitySeries}
      initialSprints={r.items}
      initialPagination={{
        page: r.page,
        limit: r.limit,
        total: r.total,
        totalPages,
        hasNextPage: r.page < totalPages,
        hasPrevPage: r.page > 1,
      }}
    />
  )
}
