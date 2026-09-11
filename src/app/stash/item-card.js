'use client'

import Link from 'next/link'
import { markPurchased, setInterest, softDeleteItem } from './actions'

function formatPrice(price) {
  if (price == null) return null
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
}

export default function ItemCard({ item }) {
  const isPurchased = item.status === 'PURCHASED'
  // B7: item com 👎 fica com opacidade reduzida, pra desencorajar
  // compra por impulso.
  const isDisliked = item.interest === 'down'

  return (
    <div
      className={`border rounded p-4 flex gap-4 ${isDisliked ? 'opacity-50' : ''}`}
    >
      {item.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt={item.name}
          className="w-20 h-20 object-cover rounded bg-gray-100 shrink-0"
        />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium truncate">
            {item.name}
            {isPurchased && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                ✓ Comprado
              </span>
            )}
          </h3>
        </div>

        {item.price != null && (
          <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
        )}

        {item.description && (
          <p className="text-sm text-gray-500 truncate">{item.description}</p>
        )}

        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={() => setInterest(item.id, 'up')}
            className={item.interest === 'up' ? 'opacity-100' : 'opacity-40'}
            aria-label="Gostei"
          >
            👍
          </button>
          <button
            type="button"
            onClick={() => setInterest(item.id, 'down')}
            className={item.interest === 'down' ? 'opacity-100' : 'opacity-40'}
            aria-label="Não gostei"
          >
            👎
          </button>

          <Link href={`/stash/${item.id}/edit`} className="text-sm text-orange-600 ml-2">
            Editar
          </Link>

          {!isPurchased && (
            <button
              type="button"
              onClick={() => markPurchased(item.id)}
              className="text-sm text-green-600"
            >
              Marcar comprado
            </button>
          )}

          <button
            type="button"
            onClick={() => softDeleteItem(item.id)}
            className="text-sm text-red-600"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}
