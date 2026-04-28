import { NextResponse } from 'next/server'
import { requireAuthSession, unauthorizedJson } from '@/modules/auth/guards'
import { SPRINTS_OVERVIEW_DISCLAIMER } from '@/modules/sprints/overview-disclaimer'
import { listSprintsPaginated, parseSprintListQuery } from '@/modules/sprints/sprint-list-query'

/** Compat: lista ampla sem paginação explícita no cliente (até 200 itens). Preferir `GET /api/sprints`. */
export async function GET() {
  const session = await requireAuthSession()
  if (!session) {
    return unauthorizedJson()
  }

  try {
    const parsed = parseSprintListQuery(
      new URLSearchParams({ page: '1', limit: '200', includeChartSeries: 'false' }),
    )
    const { items } = await listSprintsPaginated(parsed)
    return NextResponse.json({ sprints: items, disclaimer: SPRINTS_OVERVIEW_DISCLAIMER })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao listar sprints'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
