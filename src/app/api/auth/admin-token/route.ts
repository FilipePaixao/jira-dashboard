import { NextResponse } from 'next/server'
import {
  forbiddenJson,
  requireAdminSession,
  unauthorizedJson,
} from '@/modules/auth/guards'
import { generateAuthorizationToken } from '@/modules/auth/service'
import type { AuthorizationTokenPurpose } from '@/modules/auth/types'

type Body = {
  purpose?: unknown
}

function parsePurpose(value: unknown): AuthorizationTokenPurpose | null {
  if (value === 'register' || value === 'login') {
    return value
  }
  return null
}

export async function POST(request: Request) {
  const gate = await requireAdminSession()
  if (gate.kind === 'unauthenticated') {
    return unauthorizedJson()
  }
  if (gate.kind === 'forbidden') {
    return forbiddenJson('Apenas admins podem gerar token')
  }

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const purpose = parsePurpose(body.purpose)
  if (!purpose) {
    return NextResponse.json({ error: 'Purpose inválido' }, { status: 400 })
  }

  const creatorEmail = gate.session.user.email ?? ''
  try {
    const token = await generateAuthorizationToken({
      purpose,
      createdBy: creatorEmail,
    })
    return NextResponse.json({ ok: true, token, purpose }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Falha ao gerar token'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
