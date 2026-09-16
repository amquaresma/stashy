import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ItemList from '../../stash/item-list'
import ProgressBar from '@/components/progress-bar'
import CompleteButton from './complete-button'

function formatPrice(price) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
}

export default async function CollectionDetailPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: collection } = await supabase
    .from('collections')
    .select('id, name, description, color, cover_url, is_completed, completed_at')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!collection) {
    notFound()
  }

  const { data: rows } = await supabase
    .from('collection_items')
    .select('items(id, name, price, image_url, description, interest, status)')
    .eq('collection_id', id)

  const items = (rows ?? [])
    .map((r) => r.items)
    .filter((item) => item && item.status !== 'DELETED')

  // C7: progresso da coleção.
  const totalItems = items.length
  const purchasedItems = items.filter((i) => i.status === 'PURCHASED').length
  const totalValue = items.reduce((sum, i) => sum + (i.price ?? 0), 0)
  const purchasedValue = items
    .filter((i) => i.status === 'PURCHASED')
    .reduce((sum, i) => sum + (i.price ?? 0), 0)
  const percent = totalValue > 0 ? (purchasedValue / totalValue) * 100 : 0

  // Dados para o modal de alocação/bulk (igual ao /stash).
  const { data: allCollections } = await supabase
    .from('collections')
    .select('id, name, color')
    .eq('owner_id', user.id)
    .eq('is_completed', false)
    .order('name')

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
      {collection.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={collection.cover_url}
          alt=""
          className="w-full h-40 object-cover rounded bg-gray-100"
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: collection.color ?? '#71717A' }}
          />
          <h1 className="text-2xl font-semibold">{collection.name}</h1>
        </div>
        <Link href={`/collections/${collection.id}/edit`} className="text-sm text-orange-600">
          Editar
        </Link>
      </div>

      {collection.description && (
        <p className="text-sm text-gray-500">{collection.description}</p>
      )}

      <div className="space-y-1">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            {totalItems} {totalItems === 1 ? 'item' : 'itens'} · {purchasedItems}{' '}
            {purchasedItems === 1 ? 'comprado' : 'comprados'}
          </span>
          <span>{percent.toFixed(0)}%</span>
        </div>
        <ProgressBar percent={percent} />
        <p className="text-xs text-gray-500">
          {formatPrice(purchasedValue)} / {formatPrice(totalValue)}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">
          Nenhum item nessa coleção ainda. Vá em /stash e use o botão &quot;Coleções&quot;
          para adicionar.
        </p>
      ) : (
        <ItemList
          items={items}
          allCollections={allCollections ?? []}
          collectionsByItem={collectionsByItem}
        />
      )}
    </div>
  )
}