'use client'

import { useState, useTransition } from 'react'
import ItemCard from './item-card'
import { bulkMoveItemsToCollection } from '@/lib/actions/item-collections'

export default function ItemList({ items, allCollections, collectionsByItem }) {
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [bulkTarget, setBulkTarget] = useState('')
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState(null)

  function toggleSelect(itemId) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  function handleBulkMove() {
    if (!bulkTarget || selectedIds.size === 0) return

    startTransition(async () => {
      const result = await bulkMoveItemsToCollection(Array.from(selectedIds), bulkTarget)
      if (result.status === 'error') {
        setMessage(result.message)
      } else {
        setSelectedIds(new Set())
        setBulkTarget('')
        setMessage(null)
      }
    })
  }

  return (
    <div className="space-y-3">
      {selectedIds.size > 0 && (
        <div className="border rounded p-3 flex items-center gap-2 text-sm bg-gray-50">
          <span>{selectedIds.size} selecionado(s)</span>
          <select
            value={bulkTarget}
            onChange={(e) => setBulkTarget(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">Mover para coleção...</option>
            {allCollections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleBulkMove}
            disabled={isPending || !bulkTarget}
            className="bg-gray-800 text-white rounded px-3 py-1 disabled:opacity-50"
          >
            {isPending ? 'Movendo...' : 'Mover'}
          </button>
        </div>
      )}

      {message && <p className="text-sm text-red-600">{message}</p>}

      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          allCollections={allCollections}
          initialCollectionIds={collectionsByItem[item.id] ?? []}
          selected={selectedIds.has(item.id)}
          onToggleSelect={toggleSelect}
        />
      ))}
    </div>
  )
}
