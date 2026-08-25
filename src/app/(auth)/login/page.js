'use client'

import { useActionState } from 'react'
import { loginUser } from './actions'

const initialState = { status: 'idle', message: null }

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form action={formAction} className="w-full max-w-sm space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Entrar</h1>
          <p className="text-sm text-gray-600">Bem-vindo de volta ao Stashy.</p>
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
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Senha
            </label>
            <a href="/forgot-password" className="text-xs text-orange-600">
              Esqueci minha senha
            </a>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full border rounded px-3 py-2"
            placeholder="Sua senha"
          />
        </div>

        {state.status === 'unconfirmed' && (
          <p className="text-sm text-amber-600">{state.message}</p>
        )}
        {(state.status === 'invalid_credentials' || state.status === 'error') && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-orange-600 text-white rounded py-2 font-medium disabled:opacity-50"
        >
          {isPending ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="text-sm text-center text-gray-600">
          Não tem conta?{' '}
          <a href="/register" className="text-orange-600 font-medium">
            Criar conta
          </a>
        </p>
      </form>
    </div>
  )
}
