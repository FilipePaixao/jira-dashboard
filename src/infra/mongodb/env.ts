export function getMongoConnectionString(): string {
  const uri = process.env.MONGODB_URI?.trim()
  if (!uri) {
    throw new Error('MONGODB_URI não configurada')
  }
  return uri
}

export function getMongoDbName(): string {
  return process.env.MONGODB_DB?.trim() || 'dash_jira'
}
