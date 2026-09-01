import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// A1/A6: rota de confirmação de e-mail e recuperação de senha.
// Suporta os dois formatos que o Supabase pode usar no link do
// e-mail:
//   - "code" (PKCE): formato padrão do template sem customização.
//   - "token_hash" + "type": formato usado se o template de
//     e-mail for customizado manualmente (requer SMTP próprio).
// Como não exigimos SMTP customizado, o formato "code" é o que
// realmente é usado na prática.
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      redirect(next)
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      redirect(next)
    }
  }

  redirect('/auth/auth-code-error')
}
