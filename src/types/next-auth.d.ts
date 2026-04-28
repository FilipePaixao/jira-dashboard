import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      role: 'admin' | 'user'
    }
  }

  interface User {
    id: string
    role: 'admin' | 'user'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'admin' | 'user'
  }
}
