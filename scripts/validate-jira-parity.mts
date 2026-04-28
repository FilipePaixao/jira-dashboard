/**
 * Compara **diretamente** o Jira (board Agile + JQL) com o pipeline do dash.
 *
 *   set -a && source .env.local && set +a && npm run validate:jira -- 104
 */
import { runSprintJiraParityCheck } from '../src/modules/jira-sync/sprint-jira-parity'

const id = (process.argv[2] ?? '104').trim()

const r = await runSprintJiraParityCheck(id)
console.log(JSON.stringify(r, null, 2))
if (!r.ok) {
  console.error('\n[validate:jira] FALHOU: ver "messages" e "setParity" no JSON acima.\n')
  process.exit(1)
}
console.error('\n[validate:jira] OK — paridade com o Jira (board + JQL) e com o cálculo interno.\n')
process.exit(0)
