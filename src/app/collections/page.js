import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CollectionCard from './collection-card'

export default async function CollectionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: collections, error } = await supabase
    .from('collections')
    .select('id, name, description, color')
    .eq('owner_id', user.id)
    .eq('is_completed', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[CollectionsPage] erro ao buscar collections:', error)
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Coleções</h1>
        <div className="flex items-center gap-3">
          <Link href="/collections/history" className="text-sm text-gray-600">
            Histórico
          </Link>
          <Link
            href="/collections/new"
            className="bg-orange-600 text-white rounded px-4 py-2 text-sm font-medium"
          >
            + Nova coleção
          </Link>
        </div>
      </div>

      {(!collections || collections.length === 0) && (
        <p className="text-gray-500 text-sm">
          Nenhuma coleção ainda. Clique em &quot;+ Nova coleção&quot; para começar.
        </p>
      )}

      <div className="space-y-3">
        {collections?.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  )
}