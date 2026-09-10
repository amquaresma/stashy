'use server'

import { createClient } from '@/lib/supabase/server'
import { isValidUsernameFormat } from '@/lib/validators/username'

// A2/A3: checagem de disponibilidade de username em tempo real.
// Usada tanto no cadastro quanto na edição de perfil.
// Consulta a view public_profiles (não a tabela profiles direto)
// porque o RLS de profiles só libera a própria linha do usuário.
//
// excludeUserId: passe o id do usuário atual ao checar durante uma
// edição de perfil, para não acusar "já em uso" quando o username
// não mudou (é o próprio usuário dono dele).
export async function checkUsernameAvailability(username, excludeUserId = null) {
  if (!isValidUsernameFormat(username)) {
    return { available: false, reason: 'invalid_format' }
  }

  const supabase = await createClient()

  let query = supabase.from('public_profiles').select('id').eq('username', username)

  if (excludeUserId) {
    query = query.neq('id', excludeUserId)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error('[checkUsernameAvailability] erro Supabase:', error)
    return { available: false, reason: 'error', message: error.message }
  }

  return { available: !data }
}
