import { getMongoDb } from '@/infra/mongodb/client'
import type {
  AuthorizationTokenDocument,
  AuthorizationTokenPurpose,
  UserDocument,
  UserRole,
} from './types'

const USERS_COLLECTION = 'users'
const AUTH_TOKENS_COLLECTION = 'auth_tokens'

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

async function usersCollection() {
  const db = await getMongoDb()
  const coll = db.collection<UserDocument>(USERS_COLLECTION)
  await coll.createIndex({ email: 1 }, { unique: true })
  return coll
}

async function authTokensCollection() {
  const db = await getMongoDb()
  const coll = db.collection<AuthorizationTokenDocument>(AUTH_TOKENS_COLLECTION)
  await coll.createIndex({ code: 1 }, { unique: true })
  await coll.createIndex({ purpose: 1, active: 1 })
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

export async function createAuthorizationToken(input: {
  code: string
  purpose: AuthorizationTokenPurpose
  createdBy: string
}): Promise<AuthorizationTokenDocument> {
  const coll = await authTokensCollection()
  const doc: AuthorizationTokenDocument = {
    code: input.code.trim().toUpperCase(),
    purpose: input.purpose,
    createdBy: input.createdBy.trim().toLowerCase(),
    active: true,
    createdAt: new Date().toISOString(),
  }
  await coll.insertOne(doc)
  return doc
}

export async function findActiveAuthorizationToken(
  code: string,
  purpose: AuthorizationTokenPurpose,
): Promise<AuthorizationTokenDocument | null> {
  const coll = await authTokensCollection()
  return coll.findOne({
    code: code.trim().toUpperCase(),
    purpose,
    active: true,
  })
}

export async function deactivateAuthorizationToken(code: string): Promise<void> {
  const coll = await authTokensCollection()
  await coll.updateOne(
    { code: code.trim().toUpperCase(), active: true },
    { $set: { active: false, usedAt: new Date().toISOString() } },
  )
}
