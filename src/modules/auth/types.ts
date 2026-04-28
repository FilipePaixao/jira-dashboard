export type UserRole = 'admin' | 'user'
export type AuthorizationTokenPurpose = 'register' | 'login'

export type UserDocument = {
  email: string
  name: string
  passwordHash: string
  role: UserRole
  active: boolean
  createdAt: string
  updatedAt: string
}

export type PublicUser = {
  id: string
  email: string
  name: string
  role: UserRole
  active: boolean
}

export type AuthorizationTokenDocument = {
  code: string
  purpose: AuthorizationTokenPurpose
  createdBy: string
  active: boolean
  createdAt: string
  usedAt?: string
}
