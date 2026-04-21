import { NextResponse } from 'next/server'
import { syncSprintSnapshot } from '@/modules/sprints/sync-sprint'

type Body = {
  sprintId?: unknown
  boardId?: unknown
  sprintName?: unknown
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const sprintId = typeof body.sprintId === 'string' ? body.sprintId : ''
  const boardId = typeof body.boardId === 'string' ? body.boardId : undefined
  const sprintName = typeof body.sprintName === 'string' ? body.sprintName : undefined

  try {
    const result = await syncSprintSnapshot({ sprintId, boardId, sprintName })
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    const status = message.includes('sprintId') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
