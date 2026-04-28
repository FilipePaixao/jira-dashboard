import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authenticateByCredentials, registerUser } from './service'

vi.mock('./repository', () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
}))

const repo = await import('./repository')

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registerUser valida campos e cria usuário comum', async () => {
    vi.mocked(repo.findUserByEmail).mockResolvedValue(null)
    vi.mocked(repo.createUser).mockImplementation(async (input) => ({
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      role: input.role ?? 'user',
      active: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }))

    const out = await registerUser({
      email: 'USER@EXAMPLE.COM',
      name: 'User',
      password: '12345678',
    })

    expect(out.role).toBe('user')
    expect(out.email).toBe('user@example.com')
    expect(repo.createUser).toHaveBeenCalledOnce()
  })

  it('authenticateByCredentials retorna null para senha inválida', async () => {
    vi.mocked(repo.findUserByEmail).mockResolvedValue({
      email: 'user@example.com',
      name: 'User',
      passwordHash: '$2b$10$2d57cv0jlj8drSr0v68D2uzriLtLhmlf4Q5r4nV9JOncjuRznGxVO',
      role: 'user',
      active: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    const out = await authenticateByCredentials({
      email: 'user@example.com',
      password: 'senha_errada',
    })

    expect(out).toBeNull()
  })
})
