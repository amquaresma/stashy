'use client'

import { useActionState } from 'react'
import { updatePassword } from './actions'

const initialState = { status: 'idle', message: null }

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(updatePassword, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form action={formAction} className="w-full max-w-sm space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Nova senha</h1>
          <p className="text-sm text-gray-600">Escolha uma nova senha para sua conta.</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            Nova senha
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

        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirmar nova senha
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className="w-full border rounded px-3 py-2"
            placeholder="Repita a senha"
          />
        </div>

        {state.status === 'error' && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-orange-600 text-white rounded py-2 font-medium disabled:opacity-50"
        >
          {isPending ? 'Salvando...' : 'Salvar nova senha'}
        </button>
      </form>
    </div>
  )
}
