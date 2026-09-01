'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

// A6: recuperação de senha, passo 1 — envia o e-mail com o link.
export async function requestPasswordReset(prevState, formData) {
  const email = formData.get('email')?.toString().trim()

  if (!email) {
    return { status: 'error', message: 'Informe seu e-mail.' }
  }

  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin')

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  })

  if (error) {
    // LOG temporário de debug — vai aparecer no terminal do npm run dev.
    console.error('[requestPasswordReset] erro Supabase:', error)
    return { status: 'error', message: 'Não foi possível enviar o e-mail. Tente novamente.' }
  }

  return { status: 'success' }
}
