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

function parsePrice(raw) {
  if (!raw) return null
  const normalized = raw.toString().replace(',', '.')
  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

// B1/B2: cadastro de item — manual ou via Quick Save (nesse caso
// sourceUrl vem preenchido e vira o primeiro link do item).
export async function createItem(prevState, formData) {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)
  if (!user) return { status: 'error', message: 'Sessão expirada.' }

  const name = formData.get('name')?.toString().trim()
  const price = parsePrice(formData.get('price'))
  const imageUrl = formData.get('imageUrl')?.toString().trim() || null
  const description = formData.get('description')?.toString().trim() || null
  const sourceUrl = formData.get('sourceUrl')?.toString().trim() || null

  if (!name) {
    return { status: 'error', message: 'Informe um nome para o item.' }
  }

  const { data: created, error } = await supabase
    .from('items')
    .insert({
      owner_id: user.id,
      name,
      price,
      image_url: imageUrl,
      description,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[createItem] erro Supabase:', error)
    return { status: 'error', message: 'Não foi possível criar o item.' }
  }

  if (sourceUrl && created) {
    const { error: linkError } = await supabase
      .from('item_links')
      .insert({ item_id: created.id, url: sourceUrl })

    if (linkError) {
      console.error('[createItem] erro ao salvar link de origem:', linkError)
    }
  }

  revalidatePath('/stash')
  redirect('/stash')
}

// B3: edição de item.
export async function updateItem(itemId, prevState, formData) {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)
  if (!user) return { status: 'error', message: 'Sessão expirada.' }

  const name = formData.get('name')?.toString().trim()
  const price = parsePrice(formData.get('price'))
  const imageUrl = formData.get('imageUrl')?.toString().trim() || null
  const description = formData.get('description')?.toString().trim() || null

  if (!name) {
    return { status: 'error', message: 'Informe um nome para o item.' }
  }

  const { error } = await supabase
    .from('items')
    .update({ name, price, image_url: imageUrl, description })
    .eq('id', itemId)
    .eq('owner_id', user.id)

  if (error) {
    console.error('[updateItem] erro Supabase:', error)
    return { status: 'error', message: 'Não foi possível salvar as alterações.' }
  }

  revalidatePath('/stash')
  redirect('/stash')
}

// E1: exclusão via soft delete — o item vai para a Lixeira
// (status = DELETED), não é removido fisicamente.
export async function softDeleteItem(itemId) {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)
  if (!user) return

  await supabase
    .from('items')
    .update({ status: 'DELETED', deleted_at: new Date().toISOString() })
    .eq('id', itemId)
    .eq('owner_id', user.id)

  revalidatePath('/stash')
}

// B9: marcar item como comprado.
export async function markPurchased(itemId) {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)
  if (!user) return

  await supabase
    .from('items')
    .update({ status: 'PURCHASED', purchased_at: new Date().toISOString() })
    .eq('id', itemId)
    .eq('owner_id', user.id)

  revalidatePath('/stash')
}

// B7: termômetro de desejo (👍/👎). Clicar de novo no mesmo estado
// volta pro neutro.
export async function setInterest(itemId, newInterest) {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)
  if (!user) return

  const { data: current } = await supabase
    .from('items')
    .select('interest')
    .eq('id', itemId)
    .single()

  const value = current?.interest === newInterest ? null : newInterest

  await supabase
    .from('items')
    .update({ interest: value })
    .eq('id', itemId)
    .eq('owner_id', user.id)

  revalidatePath('/stash')
}

// ------------------------------------------------------------
// B4: múltiplos links por item
// ------------------------------------------------------------

export async function addItemLink(itemId, formData) {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)
  if (!user) return { status: 'error', message: 'Sessão expirada.' }

  const url = formData.get('url')?.toString().trim()
  if (!url) return { status: 'error', message: 'Informe uma URL.' }

  const { error } = await supabase.from('item_links').insert({ item_id: itemId, url })

  if (error) {
    console.error('[addItemLink] erro Supabase:', error)
    return { status: 'error', message: 'Não foi possível adicionar o link.' }
  }

  revalidatePath(`/stash/${itemId}/edit`)
  return { status: 'success' }
}

export async function removeItemLink(itemId, linkId) {
  const supabase = await createClient()
  await supabase.from('item_links').delete().eq('id', linkId)
  revalidatePath(`/stash/${itemId}/edit`)
}

// ------------------------------------------------------------
// B6: tags (públicas ou exclusivas do usuário)
// ------------------------------------------------------------

async function findOrCreateTag(supabase, userId, name, isPublic) {
  let query = supabase.from('tags').select('id').eq('name', name).eq('is_public', isPublic)
  if (!isPublic) {
    query = query.eq('owner_id', userId)
  }

  const { data: existing } = await query.maybeSingle()
  if (existing) return existing.id

  const { data: created, error } = await supabase
    .from('tags')
    .insert({ name, is_public: isPublic, owner_id: userId })
    .select('id')
    .single()

  if (error) throw error
  return created.id
}

export async function addItemTag(itemId, formData) {
  const supabase = await createClient()
  const user = await getCurrentUser(supabase)
  if (!user) return { status: 'error', message: 'Sessão expirada.' }

  const rawName = formData
    .get('tagName')
    ?.toString()
    .trim()
    .toLowerCase()
    .replace(/^#/, '')
  const isPublic = formData.get('isPublic') === 'on'

  if (!rawName) return { status: 'error', message: 'Informe um nome de tag.' }

  try {
    const tagId = await findOrCreateTag(supabase, user.id, rawName, isPublic)

    const { error } = await supabase.from('item_tags').insert({ item_id: itemId, tag_id: tagId })

    // Código 23505 = já estava tagueado com essa tag; ignoramos.
    if (error && error.code !== '23505') {
      throw error
    }
  } catch (error) {
    console.error('[addItemTag] erro Supabase:', error)
    return { status: 'error', message: 'Não foi possível adicionar a tag.' }
  }

  revalidatePath(`/stash/${itemId}/edit`)
  return { status: 'success' }
}

export async function removeItemTag(itemId, tagId) {
  const supabase = await createClient()
  await supabase.from('item_tags').delete().eq('item_id', itemId).eq('tag_id', tagId)
  revalidatePath(`/stash/${itemId}/edit`)
}
