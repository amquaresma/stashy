'use server'

import { createClient } from '@/lib/supabase/server'
import { isValidUsernameFormat } from '@/lib/validators/username'
import { checkUsernameAvailability } from '@/lib/actions/username'

// A4: edição de perfil (nome, username, bio, idade).
export async function updateProfile(prevState, formData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { status: 'error', message: 'Sessão expirada. Faça login novamente.' }
  }

  const displayName = formData.get('displayName')?.toString().trim()
  const username = formData.get('username')?.toString().trim().toLowerCase()
  const bio = formData.get('bio')?.toString().trim() ?? ''
  const ageRaw = formData.get('age')?.toString().trim()

  if (!displayName) {
    return { status: 'error', message: 'Informe um nome de exibição.' }
  }

  if (!isValidUsernameFormat(username)) {
    return {
      status: 'error',
      message: 'Username inválido. Use apenas letras minúsculas, números, "_" e ".".',
    }
  }

  if (bio.length > 150) {
    return { status: 'error', message: 'A bio pode ter no máximo 150 caracteres.' }
  }

  let age = null
  if (ageRaw) {
    age = Number(ageRaw)
    if (!Number.isInteger(age) || age < 0 || age > 130) {
      return { status: 'error', message: 'Idade inválida.' }
    }
  }

  // Só checa disponibilidade se o username realmente mudou.
  const { available, reason, message } = await checkUsernameAvailability(username, user.id)
  if (!available) {
    if (reason === 'error') {
      return { status: 'error', message: `Erro ao checar username: ${message}` }
    }
    return { status: 'error', message: 'Esse username já está em uso.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      username,
      bio: bio || null,
      age,
    })
    .eq('id', user.id)

  if (error) {
    console.error('[updateProfile] erro Supabase:', error)
    return { status: 'error', message: 'Não foi possível salvar. Tente novamente.' }
  }

  return { status: 'success', message: 'Perfil atualizado!' }
}

// A5: upload de avatar para o bucket "avatars" do Storage.
// Caminho segue a convenção {user_id}/arquivo, exigida pelas
// políticas de Storage que criamos.
const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function uploadAvatar(formData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { status: 'error', message: 'Sessão expirada. Faça login novamente.' }
  }

  const file = formData.get('avatar')

  if (!file || typeof file === 'string' || file.size === 0) {
    return { status: 'error', message: 'Selecione uma imagem.' }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { status: 'error', message: 'Formato inválido. Use JPG, PNG, WEBP ou GIF.' }
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return { status: 'error', message: 'Imagem muito grande (máximo 5MB).' }
  }

  const extension = file.type.split('/')[1]
  const path = `${user.id}/avatar.${extension}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    console.error('[uploadAvatar] erro ao subir arquivo:', uploadError)
    return { status: 'error', message: 'Não foi possível enviar a imagem.' }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path)

  // Cache-busting: sem isso, o navegador pode continuar mostrando a
  // imagem antiga em cache mesmo depois de trocar o arquivo.
  const avatarUrl = `${publicUrl}?v=${Date.now()}`

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)

  if (updateError) {
    console.error('[uploadAvatar] erro ao salvar avatar_url:', updateError)
    return { status: 'error', message: 'Imagem enviada, mas não foi possível salvar no perfil.' }
  }

  return { status: 'success', avatarUrl }
}
