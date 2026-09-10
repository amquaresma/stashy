'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { updateProfile } from './actions'
import { checkUsernameAvailability } from '@/lib/actions/username'

const initialState = { status: 'idle', message: null }

export default function ProfileForm({ initialProfile, userId }) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState)

  const [username, setUsername] = useState(initialProfile?.username ?? '')
  const [bio, setBio] = useState(initialProfile?.bio ?? '')
  const [usernameStatus, setUsernameStatus] = useState('idle')
  const [, startChecking] = useTransition()

  useEffect(() => {
    // Se o username não mudou em relação ao original, não precisa checar.
    if (!username || username === initialProfile?.username) {
      setUsernameStatus('idle')
      return
    }

    const timeout = setTimeout(() => {
      startChecking(async () => {
        setUsernameStatus('checking')
        const result = await checkUsernameAvailability(username, userId)

        if (result.reason === 'invalid_format') {
          setUsernameStatus('invalid')
        } else if (result.reason === 'error') {
          setUsernameStatus('error')
        } else if (result.available) {
          setUsernameStatus('available')
        } else {
          setUsernameStatus('taken')
        }
      })
    }, 400)

    return () => clearTimeout(timeout)
  }, [username, initialProfile?.username, userId])

  return (
    <form action={formAction} className="w-full max-w-sm space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Editar perfil</h1>
      </div>

      <div className="space-y-1">
        <label htmlFor="displayName" className="text-sm font-medium">
          Nome de exibição
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          defaultValue={initialProfile?.display_name ?? ''}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className="w-full border rounded pl-7 pr-3 py-2"
            autoComplete="off"
          />
        </div>
        <UsernameHint status={usernameStatus} />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="bio" className="text-sm font-medium">
            Bio
          </label>
          <span className="text-xs text-gray-500">{bio.length} / 150</span>
        </div>
        <textarea
          id="bio"
          name="bio"
          maxLength={150}
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full border rounded px-3 py-2 resize-none"
          placeholder="Conte um pouco sobre você..."
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="age" className="text-sm font-medium">
          Idade{' '}
          <span className="text-xs text-gray-500 font-normal">(privada, nunca exibida)</span>
        </label>
        <input
          id="age"
          name="age"
          type="number"
          min={0}
          max={130}
          defaultValue={initialProfile?.age ?? ''}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}
      {state.status === 'success' && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={isPending || usernameStatus === 'taken' || usernameStatus === 'invalid'}
        className="w-full bg-orange-600 text-white rounded py-2 font-medium disabled:opacity-50"
      >
        {isPending ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  )
}

function UsernameHint({ status }) {
  if (status === 'idle') return null

  const map = {
    checking: { text: 'Verificando...', className: 'text-gray-500' },
    available: { text: '✓ Disponível', className: 'text-green-600' },
    taken: { text: '✕ Username já utilizado', className: 'text-red-600' },
    invalid: {
      text: 'Use apenas letras minúsculas, números, "_" e "."',
      className: 'text-red-600',
    },
    error: {
      text: '⚠ Erro ao verificar',
      className: 'text-amber-600',
    },
  }

  const hint = map[status]
  if (!hint) return null

  return <p className={`text-sm ${hint.className}`}>{hint.text}</p>
}
