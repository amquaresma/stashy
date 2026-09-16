import { createClient } from '@/lib/supabase/server'
import TrashItemCard from './trash-item-card'

export default async function TrashPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: items, error } = await supabase
    .from('items')
    .select('id, name, image_url, deleted_at')
    .eq('owner_id', user.id)
    .eq('status', 'DELETED')
    .order('deleted_at', { ascending: true })

  if (error) {
    console.error('[TrashPage] erro Supabase:', error)
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Lixeira</h1>

      {(!items || items.length === 0) && (
        <p className="text-gray-500 text-sm">A lixeira está vazia.</p>
      )}

      <div className="space-y-3">
        {items?.map((item) => (
          <TrashItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
