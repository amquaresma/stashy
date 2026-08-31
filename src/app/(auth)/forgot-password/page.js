'use client'

import { useActionState } from 'react'
import { requestPasswordReset } from './actions'

const initialState = { status: 'idle', message: null }

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState)

  if (state.status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm text-center space-y-2">
          <h1 className="text-2xl font-semibold">Verifique seu e-mail</h1>
          <p className="text-gray-600">
            Se existir uma conta com esse e-mail, enviamos um link para redefinir sua
            senha.
          </p>
          <a href="/login" className="text-orange-600 font-medium inline-block mt-2">
            Voltar para o login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form action={formAction} className="w-full max-w-sm space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Esqueci minha senha</h1>
          <p className="text-sm text-gray-600">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
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

        {state.status === 'error' && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-orange-600 text-white rounded py-2 font-medium disabled:opacity-50"
        >
          {isPending ? 'Enviando...' : 'Enviar link'}
        </button>

        <p className="text-sm text-center text-gray-600">
          <a href="/login" className="text-orange-600 font-medium">
            Voltar para o login
          </a>
        </p>
      </form>
    </div>
  )
}
