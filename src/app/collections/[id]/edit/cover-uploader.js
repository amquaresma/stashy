'use client'

import { useRef, useState, useTransition } from 'react'
import { uploadCollectionCover } from '../../actions'

export default function CoverUploader({ collectionId, initialCoverUrl }) {
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl)
  const [message, setMessage] = useState(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.set('cover', file)

    setMessage(null)

    startTransition(async () => {
      const result = await uploadCollectionCover(collectionId, formData)
      if (result.status === 'error') {
        setMessage(result.message)
      } else {
        setCoverUrl(result.coverUrl)
      }
    })
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">Capa</span>

      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl} alt="" className="w-full h-32 object-cover rounded bg-gray-100" />
      ) : (
        <div className="w-full h-32 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
          Sem capa
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="text-sm text-orange-600 font-medium disabled:opacity-50"
      >
        {isPending ? 'Enviando...' : 'Trocar capa'}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {message && <p className="text-sm text-red-600">{message}</p>}
    </div>
  )
}
