'use client'

import Link from 'next/link'
import { deleteCollection } from './actions'

export default function CollectionCard({ collection }) {
  return (
    <div className="border rounded p-4 flex items-center gap-3">
      <div
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: collection.color ?? '#71717A' }}
      />

      <div className="flex-1 min-w-0">
        <Link href={`/collections/${collection.id}`} className="font-medium hover:underline">
          {collection.name}
        </Link>
        {collection.description && (
          <p className="text-sm text-gray-500 truncate">{collection.description}</p>
        )}
      </div>

      <Link href={`/collections/${collection.id}/edit`} className="text-sm text-orange-600">
        Editar
      </Link>
      <button
        type="button"
        onClick={() => deleteCollection(collection.id)}
        className="text-sm text-red-600"
      >
        Excluir
      </button>
    </div>
  )
}
