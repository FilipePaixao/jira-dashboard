import { Buffer } from 'node:buffer'

export type JiraClientConfig = {
  baseUrl: string
  email: string
  apiToken: string
}

export function createJiraAuthorizationHeader(config: JiraClientConfig): string {
  const token = Buffer.from(`${config.email}:${config.apiToken}`, 'utf8').toString('base64')
  return `Basic ${token}`
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, '')
}

export class JiraClient {
  constructor(
    private readonly config: JiraClientConfig,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async jiraFetch(path: string, init?: RequestInit): Promise<Response> {
    const base = normalizeBaseUrl(this.config.baseUrl)
    const suffix = path.startsWith('/') ? path : `/${path}`
    const url = `${base}${suffix}`
    const headers = new Headers(init?.headers)
    if (!headers.has('Authorization')) {
      headers.set('Authorization', createJiraAuthorizationHeader(this.config))
    }
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json')
    }
    return this.fetchImpl(url, { ...init, headers })
  }
}
