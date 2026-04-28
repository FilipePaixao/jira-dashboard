import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireAdminSession, requireAuthSession } from './guards'

vi.mock('@/auth', () => ({
  getServerAuthSession: vi.fn(),
}))

const authMod = await import('@/auth')

describe('auth guards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requireAuthSession retorna null sem sessão', async () => {
    vi.mocked(authMod.getServerAuthSession).mockResolvedValue(null)
    await expect(requireAuthSession()).resolves.toBeNull()
  })

  it('requireAdminSession valida role admin', async () => {
    vi.mocked(authMod.getServerAuthSession).mockResolvedValue({
      user: { email: 'a@a.com', name: 'Admin', role: 'admin' },
      expires: '2099-01-01T00:00:00.000Z',
    })
    await expect(requireAdminSession()).resolves.toMatchObject({ kind: 'ok' })
  })

  it('requireAdminSession bloqueia usuário comum', async () => {
    vi.mocked(authMod.getServerAuthSession).mockResolvedValue({
      user: { email: 'u@u.com', name: 'User', role: 'user' },
      expires: '2099-01-01T00:00:00.000Z',
    })
    await expect(requireAdminSession()).resolves.toMatchObject({ kind: 'forbidden' })
  })
})
