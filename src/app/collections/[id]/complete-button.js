'use client'

import { useTransition } from 'react'
import { completeCollection } from '../../actions'

export default function CompleteButton({ collectionId }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      onClick={() => startTransition(() => completeCollection(collectionId))}
      disabled={isPending}
      className="text-sm text-green-700 border border-green-700 rounded px-3 py-1 disabled:opacity-50"
    >
      {isPending ? 'Concluindo...' : 'Marcar como concluída'}
    </button>
  )
}
