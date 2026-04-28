import { getMongoDb } from '@/infra/mongodb/client'
import type { UserDocument, UserRole } from './types'

const USERS_COLLECTION = 'users'

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

async function usersCollection() {
  const db = await getMongoDb()
  const coll = db.collection<UserDocument>(USERS_COLLECTION)
  await coll.createIndex({ email: 1 }, { unique: true })
  return coll
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  const coll = await usersCollection()
  return coll.findOne({ email: normalizeEmail(email) })
}

export async function createUser(input: {
  email: string
  name: string
  passwordHash: string
  role?: UserRole
}): Promise<UserDocument> {
  const coll = await usersCollection()
  const now = new Date().toISOString()
  const doc: UserDocument = {
    email: normalizeEmail(input.email),
    name: input.name.trim(),
    passwordHash: input.passwordHash,
    role: input.role ?? 'user',
    active: true,
    createdAt: now,
    updatedAt: now,
  }
  await coll.insertOne(doc)
  return doc
}
