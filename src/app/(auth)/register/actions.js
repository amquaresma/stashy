'use server'

import { createClient } from '@/lib/supabase/server'
import { isValidUsernameFormat } from '@/lib/validators/username'
import { checkUsernameAvailability } from '@/lib/actions/username'
import { headers } from 'next/headers'

export { checkUsernameAvailability }

// A1: cadastro. Cria o usuário no auth.users — o trigger
// handle_new_user cuida de criar a linha em profiles.
export async function registerUser(prevState, formData) {
  const displayName = formData.get('displayName')?.toString().trim()
  const username = formData.get('username')?.toString().trim().toLowerCase()
  const email = formData.get('email')?.toString().trim()
  const password = formData.get('password')?.toString()

  if (!displayName) {
    return { status: 'error', message: 'Informe um nome de exibição.' }
  }

  if (!isValidUsernameFormat(username)) {
    return {
      status: 'error',
      message: 'Username inválido. Use apenas letras minúsculas, números, "_" e ".".',
    }
  }

  if (!email || !password) {
    return { status: 'error', message: 'Preencha e-mail e senha.' }
  }

  if (password.length < 8) {
    return { status: 'error', message: 'A senha precisa ter pelo menos 8 caracteres.' }
  }

  const supabase = await createClient()

  const { available, reason, message } = await checkUsernameAvailability(username)
  if (!available) {
    if (reason === 'error') {
      return { status: 'error', message: `Erro ao checar username: ${message}` }
    }
    return { status: 'error', message: 'Esse username já está em uso.' }
  }

  const headersList = await headers()
  const origin = headersList.get('origin')

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: displayName,
      },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  })

  if (error) {
    console.error('[registerUser] erro Supabase signUp:', error)
    if (error.message.toLowerCase().includes('already registered')) {
      return { status: 'error', message: 'Já existe uma conta com esse e-mail.' }
    }
    return { status: 'error', message: error.message }
  }

  return { status: 'success' }
}
