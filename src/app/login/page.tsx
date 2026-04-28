import { LoginClient } from './LoginClient'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const raw = sp.callbackUrl
  const callbackUrl = typeof raw === 'string' ? raw : '/dashboard'
  return <LoginClient callbackUrl={callbackUrl} />
}
