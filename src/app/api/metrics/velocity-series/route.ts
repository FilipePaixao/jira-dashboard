import { NextResponse } from 'next/server'
import { requireAuthSession, unauthorizedJson } from '@/modules/auth/guards'
import { listVelocitySeries } from '@/modules/metrics/velocity-series'
import { parseSprintListQuery, toSprintListFilters } from '@/modules/sprints/sprint-list-query'

export async function GET(request: Request) {
  const session = await requireAuthSession()
  if (!session) {
    return unauthorizedJson()
  }

  try {
    const url = new URL(request.url)
    const parsed = parseSprintListQuery(url.searchParams)
    const filters = toSprintListFilters(parsed)
    const maxRaw = url.searchParams.get('max')
    const max = maxRaw ? Math.min(200, Math.max(5, Number.parseInt(maxRaw, 10) || 120)) : 120
    const series = await listVelocitySeries(filters, max)
    return NextResponse.json({ series })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao carregar série de velocidade'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
