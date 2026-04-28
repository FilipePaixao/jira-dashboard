import bcrypt from 'bcryptjs'
import { createUser, findUserByEmail } from './repository'
import type { PublicUser } from './types'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function registerUser(input: {
  email: string
  name: string
  password: string
}): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase()
  const name = input.name.trim()
  const password = input.password
  if (!email || !name || !password) {
    throw new Error('Campos obrigatórios: email, nome e senha')
  }
  if (password.length < 8) {
    throw new Error('Senha deve ter no mínimo 8 caracteres')
  }
  const exists = await findUserByEmail(email)
  if (exists) {
    throw new Error('Email já cadastrado')
  }
  const passwordHash = await hashPassword(password)
  const created = await createUser({ email, name, passwordHash, role: 'user' })
  return {
    id: created.email,
    email: created.email,
    name: created.name,
    role: created.role,
    active: created.active,
  }
}

export async function authenticateByCredentials(input: {
  email: string
  password: string
}): Promise<PublicUser | null> {
  const email = input.email.trim().toLowerCase()
  const password = input.password
  if (!email || !password) {
    return null
  }
  const user = await findUserByEmail(email)
  if (!user || !user.active) {
    return null
  }
  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) {
    return null
  }
  return {
    id: user.email,
    email: user.email,
    name: user.name,
    role: user.role,
    active: user.active,
  }
}
