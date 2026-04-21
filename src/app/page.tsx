import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Dash Jira</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Dashboard gerencial — dados de sprint Jira via backend e MongoDB.
      </p>
      <p className="mt-4">
        <Link
          className="text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          href="/dashboard"
        >
          Abrir dashboard de sprint
        </Link>
      </p>
    </>
  )
}
