'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getCurrentUser(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// C1: criar coleção.
export async function createCollection(prevState, formData) {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)
  if (!user) return { status: 'error', message: 'Sessão expirada.' }

  const name = formData.get('name')?.toString().trim()
  const description = formData.get('description')?.toString().trim() || null
  const color = formData.get('color')?.toString().trim() || null

  if (!name) {
    return { status: 'error', message: 'Informe um nome para a coleção.' }
  }

  const { error } = await supabase.from('collections').insert({
    owner_id: user.id,
    name,
    description,
    color,
  })

  if (error) {
    console.error('[createCollection] erro Supabase:', error)
    return { status: 'error', message: 'Não foi possível criar a coleção.' }
  }

  revalidatePath('/collections')
  redirect('/collections')
}

// Edição de coleção (nome, descrição, cor).
export async function updateCollection(collectionId, prevState, formData) {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)
  if (!user) return { status: 'error', message: 'Sessão expirada.' }

  const name = formData.get('name')?.toString().trim()
  const description = formData.get('description')?.toString().trim() || null
  const color = formData.get('color')?.toString().trim() || null

  if (!name) {
    return { status: 'error', message: 'Informe um nome para a coleção.' }
  }

  const { error } = await supabase
    .from('collections')
    .update({ name, description, color })
    .eq('id', collectionId)
    .eq('owner_id', user.id)

  if (error) {
    console.error('[updateCollection] erro Supabase:', error)
    return { status: 'error', message: 'Não foi possível salvar as alterações.' }
  }

  revalidatePath('/collections')
  redirect('/collections')
}

// Exclusão de coleção. Diferente dos itens, coleções não têm
// soft delete no escopo — a exclusão aqui é definitiva. Os itens
// que estavam nela continuam existindo (só a relação some, via
// ON DELETE CASCADE em collection_items).
export async function deleteCollection(collectionId) {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)
  if (!user) return

  await supabase.from('collections').delete().eq('id', collectionId).eq('owner_id', user.id)

  revalidatePath('/collections')
}

// C8: marcar coleção como concluída — ela some da área principal
// e vai para o Histórico de Conquistas.
export async function completeCollection(collectionId) {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)
  if (!user) return
  await supabase
    .from('collections')
    .update({ is_completed: true, completed_at: new Date().toISOString() })
    .eq('id', collectionId)
    .eq('owner_id', user.id)
  revalidatePath('/collections')
  revalidatePath(`/collections/${collectionId}`)
}

// C3: upload de capa para o bucket "collection-covers" do Storage.
const MAX_COVER_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function uploadCollectionCover(collectionId, formData) {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)
  if (!user) return { status: 'error', message: 'Sessão expirada.' }

  const file = formData.get('cover')

  if (!file || typeof file === 'string' || file.size === 0) {
    return { status: 'error', message: 'Selecione uma imagem.' }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { status: 'error', message: 'Formato inválido. Use JPG, PNG, WEBP ou GIF.' }
  }

  if (file.size > MAX_COVER_SIZE) {
    return { status: 'error', message: 'Imagem muito grande (máximo 5MB).' }
  }

  const extension = file.type.split('/')[1]
  const path = `${user.id}/${collectionId}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from('collection-covers')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    console.error('[uploadCollectionCover] erro ao subir arquivo:', uploadError)
    return { status: 'error', message: 'Não foi possível enviar a imagem.' }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('collection-covers').getPublicUrl(path)

  const coverUrl = `${publicUrl}?v=${Date.now()}`

  const { error: updateError } = await supabase
    .from('collections')
    .update({ cover_url: coverUrl })
    .eq('id', collectionId)
    .eq('owner_id', user.id)

  if (updateError) {
    console.error('[uploadCollectionCover] erro ao salvar cover_url:', updateError)
    return { status: 'error', message: 'Imagem enviada, mas não foi possível salvar.' }
  }

  return { status: 'success', coverUrl }
}

// ------------------------------------------------------------
// E: Lixeira
// ------------------------------------------------------------

// E3: restaurar item da lixeira. As alocações em coleções
// (collection_items) nunca foram removidas no soft delete, então
// o item volta automaticamente pras coleções que já tinha.
export async function restoreItem(itemId) {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)
  if (!user) return

  await supabase
    .from('items')
    .update({ status: 'ACTIVE', deleted_at: null })
    .eq('id', itemId)
    .eq('owner_id', user.id)

  revalidatePath('/trash')
  revalidatePath('/stash')
}

// E4: exclusão permanente, a pedido do usuário (antes dos 60 dias
// da limpeza automática).
export async function permanentlyDeleteItem(itemId) {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)
  if (!user) return

  await supabase.from('items').delete().eq('id', itemId).eq('owner_id', user.id)

  revalidatePath('/trash')
}