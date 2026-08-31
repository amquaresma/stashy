'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { registerUser, checkUsernameAvailability } from './actions'

const initialState = { status: 'idle', message: null }

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, initialState)

  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState('idle') // idle | checking | available | taken | invalid | error
  const [isChecking, startChecking] = useTransition()

  useEffect(() => {
    if (!username) {
      setUsernameStatus('idle')
      return
    }

    const timeout = setTimeout(() => {
      startChecking(async () => {
        setUsernameStatus('checking')
        const result = await checkUsernameAvailability(username)

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
    }, 400) // debounce

    return () => clearTimeout(timeout)
  }, [username])

  if (state.status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm text-center space-y-2">
          <h1 className="text-2xl font-semibold">Quase lá!</h1>
          <p className="text-gray-600">
            Enviamos um e-mail de confirmação. Clique no link para ativar sua conta e
            começar a usar o Stashy.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form action={formAction} className="w-full max-w-sm space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Criar conta</h1>
          <p className="text-sm text-gray-600">Organize. Planeje. Conquiste.</p>
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
            className="w-full border rounded px-3 py-2"
            placeholder="Matheus Quaresma"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              @
            </span>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="w-full border rounded pl-7 pr-3 py-2"
              placeholder="matheus"
              autoComplete="off"
            />
          </div>
          <UsernameHint status={usernameStatus} />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full border rounded px-3 py-2"
            placeholder="voce@email.com"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full border rounded px-3 py-2"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        {state.status === 'error' && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={isPending || usernameStatus === 'taken' || usernameStatus === 'invalid'}
          className="w-full bg-orange-600 text-white rounded py-2 font-medium disabled:opacity-50"
        >
          {isPending ? 'Criando conta...' : 'Criar conta'}
        </button>

        <p className="text-sm text-center text-gray-600">
          Já tem conta?{' '}
          <a href="/login" className="text-orange-600 font-medium">
            Entrar
          </a>
        </p>
      </form>
    </div>
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
      text: '⚠ Erro ao verificar (veja o terminal do servidor)',
      className: 'text-amber-600',
    },
  }

  const hint = map[status]
  if (!hint) return null

  return <p className={`text-sm ${hint.className}`}>{hint.text}</p>
}
