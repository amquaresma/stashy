'use client'

import { restoreItem, permanentlyDeleteItem } from '../stash/actions'

const RETENTION_DAYS = 60

function daysRemaining(deletedAt) {
  const deletedDate = new Date(deletedAt)
  const elapsedMs = Date.now() - deletedDate.getTime()
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24))
  return Math.max(0, RETENTION_DAYS - elapsedDays)
}

export default function TrashItemCard({ item }) {
  const remaining = daysRemaining(item.deleted_at)

  function handlePermanentDelete() {
    if (!confirm(`Excluir "${item.name}" definitivamente? Isso não pode ser desfeito.`)) return
    permanentlyDeleteItem(item.id)
  }

  return (
    <div className="border rounded p-4 flex gap-4 opacity-75">
      {item.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt={item.name}
          className="w-16 h-16 object-cover rounded bg-gray-100 shrink-0"
        />
      )}

      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{item.name}</h3>
        <p className="text-xs text-gray-500">Será excluído em {remaining} dias</p>

        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={() => restoreItem(item.id)}
            className="text-sm text-green-600"
          >
            Restaurar
          </button>
          <button type="button" onClick={handlePermanentDelete} className="text-sm text-red-600">
            Excluir definitivamente
          </button>
        </div>
      </div>
    </div>
  )
}
