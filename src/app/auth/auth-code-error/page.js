export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm text-center space-y-2">
        <h1 className="text-2xl font-semibold">Link inválido ou expirado</h1>
        <p className="text-gray-600">
          Esse link de confirmação não é mais válido. Tente se cadastrar novamente ou
          entre em contato caso o problema persista.
        </p>
        <a href="/register" className="text-orange-600 font-medium inline-block mt-2">
          Voltar para o cadastro
        </a>
      </div>
    </div>
  )
}
