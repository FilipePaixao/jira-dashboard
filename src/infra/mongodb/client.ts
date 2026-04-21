import { MongoClient, type Db } from 'mongodb'
import { getMongoConnectionString, getMongoDbName } from './env'

type GlobalMongo = typeof globalThis & {
  _mongoClient?: MongoClient
}

const g = globalThis as GlobalMongo

export async function getMongoClient(): Promise<MongoClient> {
  if (g._mongoClient) {
    return g._mongoClient
  }
  const uri = getMongoConnectionString()
  const client = new MongoClient(uri)
  await client.connect()
  g._mongoClient = client
  return client
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient()
  return client.db(getMongoDbName())
}
