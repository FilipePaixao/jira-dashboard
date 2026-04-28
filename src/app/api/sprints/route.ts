import { NextResponse } from 'next/server'
import { requireAuthSession, unauthorizedJson } from '@/modules/auth/guards'
import { SPRINTS_OVERVIEW_DISCLAIMER } from '@/modules/sprints/overview-disclaimer'
import { listSprintsPaginated, parseSprintListQuery } from '@/modules/sprints/sprint-list-query'

export async function GET(request: Request) {
  const session = await requireAuthSession()
  if (!session) {
    return unauthorizedJson()
  }

  try {
    const url = new URL(request.url)
    const parsed = parseSprintListQuery(url.searchParams)
    const result = await listSprintsPaginated(parsed)
    const totalPages = Math.max(1, Math.ceil(result.total / result.limit))

    return NextResponse.json({
      sprints: result.items,
      chartSeries: result.chartSeries,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages,
        hasNextPage: result.page < totalPages,
        hasPrevPage: result.page > 1,
      },
      disclaimer: SPRINTS_OVERVIEW_DISCLAIMER,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao listar sprints'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
