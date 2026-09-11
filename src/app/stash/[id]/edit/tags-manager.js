'use client'

import { useState, useTransition } from 'react'
import { addItemTag, removeItemTag } from '../../actions'

export default function TagsManager({ itemId, initialTags }) {
  const [tags, setTags] = useState(initialTags)
  const [tagName, setTagName] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [message, setMessage] = useState(null)
  const [isPending, startTransition] = useTransition()

  function handleAdd(e) {
    e.preventDefault()
    const cleaned = tagName.trim().toLowerCase().replace(/^#/, '')
    if (!cleaned) return

    const formData = new FormData()
    formData.set('tagName', cleaned)
    if (isPublic) formData.set('isPublic', 'on')

    startTransition(async () => {
      const result = await addItemTag(itemId, formData)
      if (result.status === 'error') {
        setMessage(result.message)
      } else {
        setTags((prev) => [
          ...prev,
          { tag_id: crypto.randomUUID(), name: cleaned, is_public: isPublic },
        ])
        setTagName('')
        setMessage(null)
      }
    })
  }

  function handleRemove(tagId) {
    setTags((prev) => prev.filter((t) => t.tag_id !== tagId))
    startTransition(() => removeItemTag(itemId, tagId))
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium">Tags</h2>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.tag_id}
            className="text-sm bg-gray-100 rounded-full px-3 py-1 flex items-center gap-1"
          >
            #{tag.name}
            {tag.is_public && <span className="text-xs text-gray-400">(pública)</span>}
            <button
              type="button"
              onClick={() => handleRemove(tag.tag_id)}
              className="text-red-600 ml-1"
              aria-label={`Remover tag ${tag.name}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          type="text"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
          placeholder="setup"
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-1 text-xs text-gray-600 shrink-0">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          pública
        </label>
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
