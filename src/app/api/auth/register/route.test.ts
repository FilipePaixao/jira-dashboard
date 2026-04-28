import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route'

vi.mock('@/modules/auth/service', () => ({
  registerUser: vi.fn(),
}))

const service = await import('@/modules/auth/service')

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna 201 em cadastro válido', async () => {
    vi.mocked(service.registerUser).mockResolvedValue({
      id: 'user@example.com',
      email: 'user@example.com',
      name: 'User',
      role: 'user',
      active: true,
    })
    const req = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        name: 'User',
        password: '12345678',
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })

  it('retorna 400 em payload inválido', async () => {
    const req = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: 'x',
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
