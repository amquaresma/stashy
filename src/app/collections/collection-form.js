'use client'

import { useActionState, useState } from 'react'
import { COLLECTION_COLORS } from '@/lib/constants/collection-colors'

const initialState = { status: 'idle', message: null }

export default function CollectionForm({ action, initialCollection, submitLabel }) {
  const [state, formAction, isPending] = useActionState(action, initialState)
  const [color, setColor] = useState(initialCollection?.color ?? COLLECTION_COLORS[0].value)

  return (
    <form action={formAction} className="w-full max-w-sm space-y-4">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nome
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={initialCollection?.name ?? ''}
          className="w-full border rounded px-3 py-2"
          placeholder="Ex: Setup Gamer"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={initialCollection?.description ?? ''}
          className="w-full border rounded px-3 py-2 resize-none"
        />
      </div>

      <div className="space-y-1">
        <span className="text-sm font-medium">Cor</span>
        <input type="hidden" name="color" value={color} />
        <div className="flex gap-2 flex-wrap">
          {COLLECTION_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              title={c.name}
              style={{ backgroundColor: c.value }}
              className={`w-8 h-8 rounded-full ${
                color === c.value ? 'ring-2 ring-offset-2 ring-gray-800' : ''
              }`}
            />
          ))}
        </div>
      </div>

      {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-orange-600 text-white rounded py-2 font-medium disabled:opacity-50"
      >
        {isPending ? 'Salvando...' : submitLabel}
      </button>
    </form>
  )
}
