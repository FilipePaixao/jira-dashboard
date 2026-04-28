import { describe, expect, it } from 'vitest'
import { extractChangelogStatusItems } from './extract-changelog-status'

describe('extractChangelogStatusItems', () => {
  it('ordena e extrai from/to de status', () => {
    const items = extractChangelogStatusItems({
      histories: [
        {
          created: '2026-01-02T00:00:00.000Z',
          items: [{ field: 'status', fromString: 'In Progress', toString: 'Done' }],
        },
        {
          created: '2026-01-01T00:00:00.000Z',
          items: [{ field: 'status', fromString: 'To Do', toString: 'In Progress' }],
        },
      ],
    })
    expect(items).toHaveLength(2)
    expect(items[0]!.at).toBe('2026-01-01T00:00:00.000Z')
    expect(items[0]!.from).toBe('To Do')
    expect(items[1]!.to).toBe('Done')
  })
})
