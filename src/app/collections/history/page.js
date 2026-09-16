import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CollectionHistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: collections, error } = await supabase
    .from('collections')
    .select('id, name, color, cover_url, completed_at')
    .eq('owner_id', user.id)
    .eq('is_completed', true)
    .order('completed_at', { ascending: false })

  if (error) {
    console.error('[CollectionHistoryPage] erro Supabase:', error)
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Histórico de Conquistas</h1>
        <Link href="/collections" className="text-sm text-orange-600">
          Voltar
        </Link>
      </div>

      {(!collections || collections.length === 0) && (
        <p className="text-gray-500 text-sm">Nenhuma coleção concluída ainda.</p>
      )}

      <div className="space-y-3">
        {collections?.map((c) => (
          <Link
            key={c.id}
            href={`/collections/${c.id}`}
            className="border rounded p-4 flex items-center gap-3 hover:bg-gray-50"
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: c.color ?? '#71717A' }}
            />
            <div className="flex-1">
              <p className="font-medium">✓ {c.name}</p>
              <p className="text-sm text-gray-500">
                Concluído em {new Date(c.completed_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
