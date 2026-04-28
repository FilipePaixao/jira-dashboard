import { NextResponse } from 'next/server'
import { getServerAuthSession } from '@/auth'

export async function requireAuthSession() {
  const session = await getServerAuthSession()
  if (!session?.user) {
    return null
  }
  return session
}

export async function requireAdminSession() {
  const session = await requireAuthSession()
  if (!session) {
    return { kind: 'unauthenticated' as const, session: null }
  }
  if (session.user.role !== 'admin') {
    return { kind: 'forbidden' as const, session }
  }
  return { kind: 'ok' as const, session }
}

export function unauthorizedJson(message = 'Não autenticado') {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbiddenJson(message = 'Sem permissão para este recurso') {
  return NextResponse.json({ error: message }, { status: 403 })
}
