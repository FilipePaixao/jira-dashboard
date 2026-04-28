import { NextResponse } from 'next/server'
import { forbiddenJson, requireAdminSession, unauthorizedJson } from '@/modules/auth/guards'
import { getIndividualAnalysis } from '@/modules/metrics/individual-analysis'

const DISCLAIMER =
  'Leitura individual é gerencial e contextual: use para diagnóstico de fluxo, não para ranking punitivo.'

export async function GET(request: Request) {
  const gate = await requireAdminSession()
  if (gate.kind === 'unauthenticated') {
    return unauthorizedJson()
  }
  if (gate.kind === 'forbidden') {
    return forbiddenJson('Apenas admins podem acessar análises individuais')
  }

  try {
    const url = new URL(request.url)
    const sprintId = url.searchParams.get('sprintId')?.trim() || undefined
    const daysRaw = url.searchParams.get('days')
    const days = daysRaw ? Number.parseInt(daysRaw, 10) : undefined

    const analysis = await getIndividualAnalysis({ sprintId, days })
    return NextResponse.json({
      analysis,
      disclaimer: DISCLAIMER,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao gerar análise individual'
    const status = msg.includes('não encontrada') ? 404 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
