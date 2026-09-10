// A5: se não existir avatar, gera as iniciais automaticamente
// a partir do nome de exibição (ex: "Matheus Quaresma" -> "MQ").
export function getInitials(displayName) {
  if (!displayName) return '?'

  const parts = displayName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function Avatar({ avatarUrl, displayName, size = 96 }) {
  const dimension = `${size}px`

  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatarUrl}
        alt={displayName ?? 'Avatar'}
        width={size}
        height={size}
        style={{ width: dimension, height: dimension }}
        className="rounded-full object-cover bg-gray-200"
      />
    )
  }

  return (
    <div
      style={{ width: dimension, height: dimension }}
      className="rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold text-lg"
    >
      {getInitials(displayName)}
    </div>
  )
}
