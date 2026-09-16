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