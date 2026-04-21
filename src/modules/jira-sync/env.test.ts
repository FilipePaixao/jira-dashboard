import { describe, expect, it, vi } from 'vitest'
import { getJiraClientConfigFromEnv } from './env'

describe('Jira env', () => {
  it('lança quando variáveis obrigatórias faltam', () => {
    vi.stubEnv('JIRA_BASE_URL', undefined)
    vi.stubEnv('JIRA_EMAIL', undefined)
    vi.stubEnv('JIRA_API_TOKEN', undefined)
    expect(() => getJiraClientConfigFromEnv()).toThrow(/JIRA_BASE_URL/)
  })

  it('retorna config quando todas definidas', () => {
    vi.stubEnv('JIRA_BASE_URL', ' https://x.atlassian.net ')
    vi.stubEnv('JIRA_EMAIL', ' dev@co.com ')
    vi.stubEnv('JIRA_API_TOKEN', ' secret ')
    expect(getJiraClientConfigFromEnv()).toEqual({
      baseUrl: 'https://x.atlassian.net',
      email: 'dev@co.com',
      apiToken: 'secret',
    })
  })
})
