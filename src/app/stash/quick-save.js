'use client'

import { useActionState, useState, useTransition } from 'react'
import { fetchLinkPreview } from './quick-save-actions'
import { createItem } from './actions'

const initialCreateState = { status: 'idle', message: null }

export default function QuickSave() {
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState(null)
  const [fetchError, setFetchError] = useState(null)
  const [isFetching, startFetching] = useTransition()

  const [createState, createAction, isCreating] = useActionState(
    createItem,
    initialCreateState
  )

  function handleFetchPreview(e) {
    e.preventDefault()
    if (!url.trim()) return

    setFetchError(null)

    startFetching(async () => {
      const result = await fetchLinkPreview(url.trim())

      if (result.status === 'error') {
        setFetchError(result.message)
        // Mesmo sem extrair nada, deixa seguir pro cadastro manual
        // com a URL já preenchida como link de origem.
        setPreview({ url: url.trim(), title: null, image: null, price: null, domain: null })
      } else {
        setPreview(result)
      }
    })
  }

  function handleCancel() {
    setPreview(null)
    setUrl('')
    setFetchError(null)
  }

  if (preview) {
    return (
      <div className="border rounded p-4 space-y-3">
        <p className="text-sm text-gray-500">
          {preview.domain ? `De ${preview.domain} — confirme os dados:` : 'Confirme os dados:'}
        </p>

        {fetchError && (
          <p className="text-sm text-amber-600">
            Não conseguimos extrair tudo automaticamente. Preencha o que faltar.
          </p>
        )}

        <form action={createAction} className="space-y-3">
          <input type="hidden" name="sourceUrl" value={preview.url} />

          {preview.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.image}
              alt=""
              className="w-24 h-24 object-cover rounded bg-gray-100"
            />
          )}

          <input
            name="name"
            type="text"
            required
            defaultValue={preview.title ?? ''}
            placeholder="Nome do item"
            className="w-full border rounded px-3 py-2 text-sm"
          />

          <input
            name="price"
            type="text"
            inputMode="decimal"
            defaultValue={preview.price ?? ''}
            placeholder="Preço (opcional)"
            className="w-full border rounded px-3 py-2 text-sm"
          />

          <input type="hidden" name="imageUrl" value={preview.image ?? ''} />

          {createState.status === 'error' && (
            <p className="text-sm text-red-600">{createState.message}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 bg-orange-600 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
            >
              {isCreating ? 'Salvando...' : 'Salvar item'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="text-sm text-gray-500 px-3"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <form onSubmit={handleFetchPreview} className="flex gap-2">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Cole o link de um produto..."
        className="flex-1 border rounded px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={isFetching}
        className="bg-gray-800 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {isFetching ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
  )
}
