'use client'

import { useActionState } from 'react'

const initialState = { status: 'idle', message: null }

export default function ItemForm({ action, initialItem, submitLabel }) {
  const [state, formAction, isPending] = useActionState(action, initialState)

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
          defaultValue={initialItem?.name ?? ''}
          className="w-full border rounded px-3 py-2"
          placeholder="Ex: Mouse Logitech G Pro"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="price" className="text-sm font-medium">
          Preço
        </label>
        <input
          id="price"
          name="price"
          type="text"
          inputMode="decimal"
          defaultValue={initialItem?.price ?? ''}
          className="w-full border rounded px-3 py-2"
          placeholder="Ex: 350,00"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="imageUrl" className="text-sm font-medium">
          Imagem (URL)
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          defaultValue={initialItem?.image_url ?? ''}
          className="w-full border rounded px-3 py-2"
          placeholder="https://..."
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initialItem?.description ?? ''}
          className="w-full border rounded px-3 py-2 resize-none"
          placeholder="Observações sobre o item..."
        />
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
