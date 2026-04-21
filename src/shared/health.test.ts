import { describe, expect, it } from 'vitest'
import { getHealthPayload } from './health'

describe('getHealthPayload', () => {
  it('retorna status saudável', () => {
    const payload = getHealthPayload()
    expect(payload.ok).toBe(true)
    expect(payload.service).toBe('dash-jira')
    expect(payload.version).toBeDefined()
  })
})
