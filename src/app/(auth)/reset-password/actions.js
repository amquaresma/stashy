'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// A6: recuperação de senha, passo 2 — usuário já chegou aqui
// autenticado via o link de recovery (a rota /auth/confirm já
// trocou o token por uma sessão válida). Só falta definir a
// nova senha.
export async function updatePassword(prevState, formData) {
  const password = formData.get('password')?.toString()
  const confirmPassword = formData.get('confirmPassword')?.toString()

  if (!password || password.length < 8) {
    return { status: 'error', message: 'A senha precisa ter pelo menos 8 caracteres.' }
  }

  if (password !== confirmPassword) {
    return { status: 'error', message: 'As senhas não coincidem.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { status: 'error', message: 'Não foi possível redefinir a senha. Tente o link novamente.' }
  }

  redirect('/login')
}
