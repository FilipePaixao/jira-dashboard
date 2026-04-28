import { DashboardClient } from './DashboardClient'
import { getServerAuthSession } from '@/auth'
import { listVelocitySeries } from '@/modules/metrics/velocity-series'
import { listSprintsPaginated, parseSprintListQuery, toSprintListFilters } from '@/modules/sprints/sprint-list-query'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerAuthSession()
  if (!session?.user) {
    redirect('/login')
  }
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
