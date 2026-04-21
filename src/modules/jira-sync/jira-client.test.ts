import { Buffer } from 'node:buffer'
import { describe, expect, it, vi } from 'vitest'
import { createJiraAuthorizationHeader, JiraClient } from './jira-client'

const sampleConfig = {
  baseUrl: 'https://acme.atlassian.net',
  email: 'user@acme.com',
  apiToken: 'token123',
} as const

describe('createJiraAuthorizationHeader', () => {
  it('gera Basic auth em Base64', () => {
    const h = createJiraAuthorizationHeader(sampleConfig)
    expect(h.startsWith('Basic ')).toBe(true)
    const payload = Buffer.from(h.slice(6), 'base64').toString('utf8')
    expect(payload).toBe('user@acme.com:token123')
  })
})

describe('JiraClient', () => {
  it('chama fetch com URL absoluta e cabeçalhos', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
    const client = new JiraClient(sampleConfig, fetchMock)
    await client.jiraFetch('/rest/api/3/search')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://acme.atlassian.net/rest/api/3/search')
    const headers = init.headers as Headers
    expect(headers.get('Authorization')).toBe(createJiraAuthorizationHeader(sampleConfig))
    expect(headers.get('Accept')).toBe('application/json')
  })

  it('normaliza base URL sem barra final', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
    const client = new JiraClient(
      { ...sampleConfig, baseUrl: 'https://acme.atlassian.net/' },
      fetchMock,
    )
    await client.jiraFetch('rest/api/3/issue/1')
    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toBe('https://acme.atlassian.net/rest/api/3/issue/1')
  })
})
