'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getCurrentUser(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// C5: modal de alocação — define exatamente em quais coleções um
// item está (substitui o conjunto atual pelo novo).
export async function setItemCollections(itemId, collectionIds) {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)
  if (!user) return { status: 'error', message: 'Sessão expirada.' }

  await supabase.from('collection_items').delete().eq('item_id', itemId)

  if (collectionIds.length > 0) {
    const rows = collectionIds.map((collectionId) => ({
      item_id: itemId,
      collection_id: collectionId,
    }))
    const { error } = await supabase.from('collection_items').insert(rows)

    if (error) {
      console.error('[setItemCollections] erro Supabase:', error)
      return { status: 'error', message: 'Não foi possível salvar.' }
    }
  }

  revalidatePath('/stash')
  revalidatePath('/collections')
  return { status: 'success' }
}

// C6: bulk action — move vários itens de uma vez para uma coleção
// (adiciona, não remove das outras coleções que já estavam).
export async function bulkMoveItemsToCollection(itemIds, collectionId) {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)
  if (!user) return { status: 'error', message: 'Sessão expirada.' }

  const rows = itemIds.map((itemId) => ({ item_id: itemId, collection_id: collectionId }))

  const { error } = await supabase
    .from('collection_items')
    .upsert(rows, { onConflict: 'collection_id,item_id', ignoreDuplicates: true })

  if (error) {
    console.error('[bulkMoveItemsToCollection] erro Supabase:', error)
    return { status: 'error', message: 'Não foi possível mover os itens.' }
  }

  revalidatePath('/stash')
  revalidatePath('/collections')
  return { status: 'success' }
}
