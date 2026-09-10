'use client'

import { useRef, useState, useTransition } from 'react'
import Avatar from '@/components/avatar'
import { uploadAvatar } from './actions'

export default function AvatarUploader({ initialAvatarUrl, displayName }) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [status, setStatus] = useState('idle') // idle | uploading | error
  const [message, setMessage] = useState(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.set('avatar', file)

    setStatus('uploading')
    setMessage(null)

    startTransition(async () => {
      const result = await uploadAvatar(formData)

      if (result.status === 'error') {
        setStatus('error')
        setMessage(result.message)
      } else {
        setStatus('idle')
        setAvatarUrl(result.avatarUrl)
      }
    })
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar avatarUrl={avatarUrl} displayName={displayName} size={96} />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="text-sm text-orange-600 font-medium disabled:opacity-50"
      >
        {isPending || status === 'uploading' ? 'Enviando...' : 'Trocar foto'}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {status === 'error' && <p className="text-sm text-red-600">{message}</p>}
    </div>
  )
}
