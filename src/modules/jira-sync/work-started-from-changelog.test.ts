import { describe, expect, it } from 'vitest'
import { extractWorkStartedAtFromChangelog } from './work-started-from-changelog'

describe('extractWorkStartedAtFromChangelog', () => {
  it('retorna a data da primeira entrada com mudança de status', () => {
    const t = extractWorkStartedAtFromChangelog({
      histories: [
        {
          created: '2026-04-10T10:00:00.000Z',
          items: [{ field: 'description' }],
        },
        {
          created: '2026-04-12T14:00:00.000Z',
          items: [{ field: 'status', fromString: 'A', toString: 'B' }],
        },
      ],
    })
    expect(t).toBe('2026-04-12T14:00:00.000Z')
  })

  it('retorna null sem histories de status', () => {
    expect(extractWorkStartedAtFromChangelog({ histories: [] })).toBeNull()
    expect(extractWorkStartedAtFromChangelog(null)).toBeNull()
  })
})
