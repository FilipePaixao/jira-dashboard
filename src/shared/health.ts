export type HealthPayload = {
  ok: true
  service: string
  version: string
}

export function getHealthPayload(): HealthPayload {
  return { ok: true, service: 'dash-jira', version: '0.0.0' }
}
