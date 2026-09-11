'use client'

import { useState, useTransition } from 'react'
import { setItemCollections } from '@/lib/actions/item-collections'

export default function AllocationModal({ itemId, allCollections, initialCollectionIds, onClose }) {
  const [selected, setSelected] = useState(new Set(initialCollectionIds))
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState(null)

  function toggle(collectionId) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(collectionId)) {
        next.delete(collectionId)
      } else {
        next.add(collectionId)
      }
      return next
    })
  }

  function handleSave() {
    startTransition(async () => {
      const result = await setItemCollections(itemId, Array.from(selected))
      if (result.status === 'error') {
        setMessage(result.message)
      } else {
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded p-4 w-full max-w-xs space-y-3">
        <h2 className="font-medium">Salvar em...</h2>

        {allCollections.length === 0 && (
          <p className="text-sm text-gray-500">
            Você ainda não tem coleções. Crie uma em /collections primeiro.
          </p>
        )}

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {allCollections.map((collection) => (
            <label key={collection.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.has(collection.id)}
                onChange={() => toggle(collection.id)}
              />
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: collection.color ?? '#71717A' }}
              />
              {collection.name}
            </label>
          ))}
        </div>

        {message && <p className="text-sm text-red-600">{message}</p>}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 bg-orange-600 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
          >
            {isPending ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" onClick={onClose} className="text-sm text-gray-500 px-3">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
