import { getServerSession, type NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authenticateByCredentials } from '@/modules/auth/service'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret:
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    'dash-jira-dev-secret-change-in-production',
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? '')
        const password = String(credentials?.password ?? '')
        return authenticateByCredentials({ email, password })
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role?: 'admin' | 'user' }).role ?? 'user'
      }
      return token
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.role = (token.role as 'admin' | 'user' | undefined) ?? 'user'
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}

export function getServerAuthSession() {
  return getServerSession(authOptions)
}
