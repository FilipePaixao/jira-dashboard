import bcrypt from 'bcryptjs'
import {
  createAuthorizationToken,
  createUser,
  deactivateAuthorizationToken,
  findActiveAuthorizationToken,
  findUserByEmail,
} from './repository'
import type { AuthorizationTokenPurpose, PublicUser } from './types'

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
  authorizationToken: string
}): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase()
  const name = input.name.trim()
  const password = input.password
  const authorizationToken = input.authorizationToken.trim()
  if (!email || !name || !password) {
    throw new Error('Campos obrigatórios: email, nome e senha')
  }
  if (!authorizationToken) {
    throw new Error('Token de autorização é obrigatório')
  }
  if (password.length < 8) {
    throw new Error('Senha deve ter no mínimo 8 caracteres')
  }
  const exists = await findUserByEmail(email)
  if (exists) {
    throw new Error('Email já cadastrado')
  }
  await consumeAuthorizationToken(authorizationToken, 'register')
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

export async function generateAuthorizationToken(input: {
  purpose: AuthorizationTokenPurpose
  createdBy: string
}): Promise<string> {
  const normalizedBy = input.createdBy.trim().toLowerCase()
  if (!normalizedBy) {
    throw new Error('Usuário gerador inválido')
  }
  for (let i = 0; i < 5; i += 1) {
    const code = createRandomCode(6)
    try {
      await createAuthorizationToken({ code, purpose: input.purpose, createdBy: normalizedBy })
      return code
    } catch {
      /* tenta outro código em caso de colisão */
    }
  }
  throw new Error('Não foi possível gerar token único')
}

export async function consumeAuthorizationToken(
  code: string,
  purpose: AuthorizationTokenPurpose,
): Promise<void> {
  const token = await findActiveAuthorizationToken(code, purpose)
  if (!token) {
    throw new Error('Token de autorização inválido')
  }
  await deactivateAuthorizationToken(token.code)
}

function createRandomCode(length: number): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}
