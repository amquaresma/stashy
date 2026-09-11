'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

export default function SearchFilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get('q') ?? '')

  function updateParam(key, value) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  // Debounce da busca por texto.
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateParam('q', search)
    }, 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  return (
    <div className="flex flex-wrap gap-2 items-center text-sm">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nome, descrição, tag..."
        className="flex-1 min-w-[180px] border rounded px-3 py-2"
      />

      <select
        defaultValue={searchParams.get('status') ?? ''}
        onChange={(e) => updateParam('status', e.target.value)}
        className="border rounded px-2 py-2"
      >
        <option value="">Todos os status</option>
        <option value="ACTIVE">Ativos</option>
        <option value="PURCHASED">Comprados</option>
      </select>

      <select
        defaultValue={searchParams.get('interest') ?? ''}
        onChange={(e) => updateParam('interest', e.target.value)}
        className="border rounded px-2 py-2"
      >
        <option value="">Qualquer interesse</option>
        <option value="up">👍 Gostei</option>
        <option value="down">👎 Não gostei</option>
      </select>

      <select
        defaultValue={searchParams.get('sort') ?? 'recent'}
        onChange={(e) => updateParam('sort', e.target.value)}
        className="border rounded px-2 py-2"
      >
        <option value="recent">Mais recentes</option>
        <option value="oldest">Mais antigos</option>
        <option value="price_desc">Maior valor</option>
        <option value="price_asc">Menor valor</option>
      </select>
    </div>
  )
}
