import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// A1: fluxo de confirmação de e-mail.
// O Supabase envia um link para essa rota com token_hash e type
// na query string. Validamos o token e, se ok, a conta vira
// oficialmente confirmada (email_confirmed_at deixa de ser null).
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      redirect(next)
    }
  }

  redirect('/auth/auth-code-error')
}
