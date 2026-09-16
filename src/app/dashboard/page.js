import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ProgressBar from '@/components/progress-bar'
import { logoutUser } from '@/lib/actions/auth'

function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0)
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('id', user.id)
    .single()

  // D1-D6: itens não deletados, para todas as estatísticas.
  const { data: items } = await supabase
    .from('items')
    .select('id, name, price, status')
    .eq('owner_id', user.id)
    .neq('status', 'DELETED')

  const allItems = items ?? []
  const totalItems = allItems.length
  const purchasedItems = allItems.filter((i) => i.status === 'PURCHASED')
  const pendingItems = allItems.filter((i) => i.status === 'ACTIVE')

  const metaAtual = allItems.reduce((sum, i) => sum + (i.price ?? 0), 0)
  const totalConquistado = purchasedItems.reduce((sum, i) => sum + (i.price ?? 0), 0)
  const valorRestante = metaAtual - totalConquistado
  const percentGeral = metaAtual > 0 ? (totalConquistado / metaAtual) * 100 : 0

  const maiorItem = allItems.reduce(
    (max, i) => ((i.price ?? 0) > (max?.price ?? 0) ? i : max),
    null
  )

  // D5: progresso por coleção.
  const { data: collections } = await supabase
    .from('collections')
    .select('id, name, color')
    .eq('owner_id', user.id)
    .eq('is_completed', false)
    .order('name')

  const { data: collectionItemRows } = await supabase
    .from('collection_items')
    .select('collection_id, items(price, status)')

  const statsByCollection = {}
  for (const row of collectionItemRows ?? []) {
    if (!row.items || row.items.status === 'DELETED') continue
    if (!statsByCollection[row.collection_id]) {
      statsByCollection[row.collection_id] = { total: 0, purchased: 0, totalValue: 0, purchasedValue: 0 }
    }
    const stats = statsByCollection[row.collection_id]
    stats.total += 1
    stats.totalValue += row.items.price ?? 0
    if (row.items.status === 'PURCHASED') {
      stats.purchased += 1
      stats.purchasedValue += row.items.price ?? 0
    }
  }

  const collectionsWithStats = (collections ?? []).map((c) => {
    const stats = statsByCollection[c.id] ?? { total: 0, purchased: 0, totalValue: 0, purchasedValue: 0 }
    const percent = stats.totalValue > 0 ? (stats.purchasedValue / stats.totalValue) * 100 : 0
    return { ...c, ...stats, percent }
  })

  // D6: coleção mais avançada (maior percentual, com pelo menos 1 item).
  const collectionMaisAvancada = collectionsWithStats
    .filter((c) => c.total > 0)
    .sort((a, b) => b.percent - a.percent)[0]

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Olá, {profile?.display_name ?? user.email}
          </h1>
          <p className="text-gray-500 text-sm">@{profile?.username}</p>
        </div>
        <form action={logoutUser}>
          <button type="submit" className="text-sm text-red-600 underline">
            Sair
          </button>
        </form>
      </div>

      <nav className="flex gap-4 text-sm">
        <Link href="/stash" className="text-orange-600">
          Stash
        </Link>
        <Link href="/collections" className="text-orange-600">
          Coleções
        </Link>
        <Link href="/profile" className="text-orange-600">
          Perfil
        </Link>
      </nav>

      {/* D1-D4: resumo financeiro geral */}
      <div className="border rounded p-4 space-y-2">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-500">Meta Atual</p>
            <p className="font-semibold">{formatPrice(metaAtual)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Conquistado</p>
            <p className="font-semibold text-green-600">{formatPrice(totalConquistado)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Restante</p>
            <p className="font-semibold">{formatPrice(valorRestante)}</p>
          </div>
        </div>

        <div className="space-y-1 pt-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {formatPrice(totalConquistado)} / {formatPrice(metaAtual)}
            </span>
            <span>{percentGeral.toFixed(1)}%</span>
          </div>
          <ProgressBar percent={percentGeral} />
        </div>
      </div>

      {/* D6: estatísticas */}
      <div className="border rounded p-4 space-y-1 text-sm">
        <h2 className="font-medium mb-2">Estatísticas</h2>
        <p>Total de itens: {totalItems}</p>
        <p>Itens comprados: {purchasedItems.length}</p>
        <p>Itens pendentes: {pendingItems.length}</p>
        {maiorItem && (
          <p>
            Maior item: {maiorItem.name} ({formatPrice(maiorItem.price)})
          </p>
        )}
        {collectionMaisAvancada && (
          <p>
            Coleção mais avançada: {collectionMaisAvancada.name} (
            {collectionMaisAvancada.percent.toFixed(0)}%)
          </p>
        )}
      </div>

      {/* D5: progresso por coleção */}
      <div className="space-y-2">
        <h2 className="font-medium text-sm">Progresso por coleção</h2>
        {collectionsWithStats.length === 0 && (
          <p className="text-gray-500 text-sm">Nenhuma coleção ativa ainda.</p>
        )}
        {collectionsWithStats.map((c) => (
          <Link
            key={c.id}
            href={`/collections/${c.id}`}
            className="block border rounded p-3 space-y-1 hover:bg-gray-50"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: c.color ?? '#71717A' }}
                />
                {c.name}
              </span>
              <span className="text-gray-500">
                {c.purchased}/{c.total} · {c.percent.toFixed(0)}%
              </span>
            </div>
            <ProgressBar percent={c.percent} />
          </Link>
        ))}
      </div>
    </div>
  )
}
