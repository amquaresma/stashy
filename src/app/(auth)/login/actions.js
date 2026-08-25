'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// A2: login. Estados possíveis de retorno:
// invalid_credentials | unconfirmed | error | (sucesso -> redirect)
export async function loginUser(prevState, formData) {
  const email = formData.get('email')?.toString().trim()
  const password = formData.get('password')?.toString()

  if (!email || !password) {
    return { status: 'error', message: 'Preencha e-mail e senha.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const message = error.message.toLowerCase()

    if (message.includes('email not confirmed')) {
      return {
        status: 'unconfirmed',
        message: 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.',
      }
    }

    if (message.includes('invalid login credentials')) {
      return { status: 'invalid_credentials', message: 'E-mail ou senha incorretos.' }
    }

    return { status: 'error', message: 'Não foi possível entrar. Tente novamente.' }
  }

  redirect('/dashboard')
}
