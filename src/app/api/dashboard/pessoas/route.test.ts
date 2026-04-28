import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './route'

vi.mock('@/modules/auth/guards', () => ({
  requireAdminSession: vi.fn(),
  unauthorizedJson: vi.fn(() => new Response(JSON.stringify({ error: 'unauth' }), { status: 401 })),
  forbiddenJson: vi.fn(() => new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 })),
}))

vi.mock('@/modules/metrics/individual-analysis', () => ({
  getIndividualAnalysis: vi.fn(),
}))

const guards = await import('@/modules/auth/guards')
const analysis = await import('@/modules/metrics/individual-analysis')

describe('GET /api/dashboard/pessoas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('bloqueia não autenticado', async () => {
    vi.mocked(guards.requireAdminSession).mockResolvedValue({ kind: 'unauthenticated', session: null })
    const req = new Request('http://localhost:3000/api/dashboard/pessoas')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('bloqueia usuário comum', async () => {
    vi.mocked(guards.requireAdminSession).mockResolvedValue({
      kind: 'forbidden',
      session: { user: { role: 'user' }, expires: '' },
    } as never)
    const req = new Request('http://localhost:3000/api/dashboard/pessoas')
    const res = await GET(req)
    expect(res.status).toBe(403)
  })

  it('retorna 200 para admin', async () => {
    vi.mocked(guards.requireAdminSession).mockResolvedValue({
      kind: 'ok',
      session: { user: { role: 'admin' }, expires: '' },
    } as never)
    vi.mocked(analysis.getIndividualAnalysis).mockResolvedValue({
      mode: 'consolidated',
      days: 30,
      summary: { people: 0, storyPointsDelivered: 0, issuesDelivered: 0, leadSampleCount: 0, cycleSampleCount: 0 },
      byAssignee: [],
      sprintComparison: null,
    })
    const req = new Request('http://localhost:3000/api/dashboard/pessoas')
    const res = await GET(req)
    expect(res.status).toBe(200)
  })
})
