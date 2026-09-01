import { createClient } from '@/lib/supabase/server'
import { logoutUser } from '@/lib/actions/auth'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('[DashboardPage] erro ao buscar profile:', profileError)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div>
        <h1 className="text-2xl font-semibold">
          Olá, {profile?.display_name ?? user.email}
        </h1>
        <p className="text-gray-600">@{profile?.username}</p>
      </div>

      <p className="text-sm text-gray-500">
        Sprint 1 (Auth) concluído — dashboard de verdade vem no Sprint 5.
      </p>

      <form action={logoutUser}>
        <button
          type="submit"
          className="text-sm text-red-600 font-medium underline"
        >
          Sair
        </button>
      </form>
    </div>
  )
}
