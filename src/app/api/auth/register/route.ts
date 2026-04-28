import { NextResponse } from 'next/server'
import { registerUser } from '@/modules/auth/service'

type Body = {
  email?: unknown
  name?: unknown
  password?: unknown
  authorizationToken?: unknown
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email : ''
  const name = typeof body.name === 'string' ? body.name : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const authorizationToken = typeof body.authorizationToken === 'string' ? body.authorizationToken : ''

  try {
    const user = await registerUser({ email, name, password, authorizationToken })
    return NextResponse.json({ ok: true, user }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao cadastrar usuário'
    const status =
      msg.includes('já cadastrado') ||
      msg.includes('obrigatórios') ||
      msg.includes('mínimo') ||
      msg.includes('Token')
        ? 400
        : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
