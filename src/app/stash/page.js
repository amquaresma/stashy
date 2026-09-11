import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import QuickSave from './quick-save'
import SearchFilterBar from './search-filter-bar'
import ItemList from './item-list'

const SORT_MAP = {
  recent: { column: 'created_at', ascending: false },
  oldest: { column: 'created_at', ascending: true },
  price_desc: { column: 'price', ascending: false },
  price_asc: { column: 'price', ascending: true },
}

export default async function StashPage({ searchParams }) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let query = supabase
    .from('items')
    .select('id, name, price, image_url, description, interest, status')
    .eq('owner_id', user.id)
    .neq('status', 'DELETED')

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,description.ilike.%${params.q}%`)
  }
  if (params.status) {
    query = query.eq('status', params.status)
  }
  if (params.interest) {
    query = query.eq('interest', params.interest)
  }

  const sort = SORT_MAP[params.sort] ?? SORT_MAP.recent
  query = query.order(sort.column, { ascending: sort.ascending })

  const { data: items, error } = await query

  if (error) {
    console.error('[StashPage] erro ao buscar items:', error)
  }

  // Coleções do usuário, para o modal de alocação e bulk actions.
  const { data: allCollections } = await supabase
    .from('collections')
    .select('id, name, color')
    .eq('owner_id', user.id)
    .eq('is_completed', false)
    .order('name')

  // Em quais coleções cada item já está.
  const { data: allocations } = await supabase
    .from('collection_items')
    .select('item_id, collection_id')

  const collectionsByItem = {}
  for (const row of allocations ?? []) {
    if (!collectionsByItem[row.item_id]) collectionsByItem[row.item_id] = []
    collectionsByItem[row.item_id].push(row.collection_id)
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Meu Stash</h1>
        <Link
          href="/stash/new"
          className="bg-orange-600 text-white rounded px-4 py-2 text-sm font-medium"
        >
          + Novo item
        </Link>
      </div>

      <QuickSave />

      <SearchFilterBar />

      {(!items || items.length === 0) && (
        <p className="text-gray-500 text-sm">Nenhum item encontrado.</p>
      )}

      <ItemList
        items={items ?? []}
        allCollections={allCollections ?? []}
        collectionsByItem={collectionsByItem}
      />
    </div>
  )
}
