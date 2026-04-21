import { describe, expect, it, vi } from 'vitest'
import { getMongoConnectionString, getMongoDbName } from './env'

describe('mongo env', () => {
  it('lança quando MONGODB_URI está ausente', () => {
    vi.stubEnv('MONGODB_URI', undefined)
    expect(() => getMongoConnectionString()).toThrow(/MONGODB_URI/)
  })

  it('retorna URI aparada quando definida', () => {
    vi.stubEnv('MONGODB_URI', ' mongodb://localhost:27017 ')
    expect(getMongoConnectionString()).toBe('mongodb://localhost:27017')
  })

  it('usa nome de BD padrão quando MONGODB_DB não está definido', () => {
    vi.stubEnv('MONGODB_DB', undefined)
    expect(getMongoDbName()).toBe('dash_jira')
  })

  it('respeita MONGODB_DB quando definido', () => {
    vi.stubEnv('MONGODB_DB', ' test_db ')
    expect(getMongoDbName()).toBe('test_db')
  })
})
