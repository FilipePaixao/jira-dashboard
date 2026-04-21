import type { JiraClientConfig } from './jira-client'

export function getJiraClientConfigFromEnv(): JiraClientConfig {
  const baseUrl = process.env.JIRA_BASE_URL?.trim()
  const email = process.env.JIRA_EMAIL?.trim()
  const apiToken = process.env.JIRA_API_TOKEN?.trim()

  if (!baseUrl) {
    throw new Error('JIRA_BASE_URL não configurada')
  }
  if (!email) {
    throw new Error('JIRA_EMAIL não configurada')
  }
  if (!apiToken) {
    throw new Error('JIRA_API_TOKEN não configurada')
  }

  return { baseUrl, email, apiToken }
}
