'use client'

import { useState, useTransition } from 'react'
import { addItemLink, removeItemLink } from '../../actions'

export default function LinksManager({ itemId, initialLinks }) {
  const [links, setLinks] = useState(initialLinks)
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState(null)
  const [isPending, startTransition] = useTransition()

  function handleAdd(e) {
    e.preventDefault()
    if (!url.trim()) return

    const formData = new FormData()
    formData.set('url', url.trim())

    startTransition(async () => {
      const result = await addItemLink(itemId, formData)
      if (result.status === 'error') {
        setMessage(result.message)
      } else {
        setLinks((prev) => [...prev, { id: crypto.randomUUID(), url: url.trim() }])
        setUrl('')
        setMessage(null)
      }
    })
  }

  function handleRemove(linkId) {
    setLinks((prev) => prev.filter((l) => l.id !== linkId))
    startTransition(() => removeItemLink(itemId, linkId))
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium">Links</h2>

      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.id} className="flex items-center justify-between text-sm gap-2">
            
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 truncate"
            >
              {link.url}
            </a>
            <button
              type="button"
              onClick={() => handleRemove(link.id)}
              className="text-red-600 shrink-0"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://loja.com/produto"
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="text-sm bg-gray-800 text-white rounded px-3 py-2 disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>

      {message && <p className="text-sm text-red-600">{message}</p>}
    </div>
  )
}
