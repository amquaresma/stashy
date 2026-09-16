export default function ProgressBar({ percent }) {
  const clamped = Math.max(0, Math.min(100, percent))

  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className="bg-orange-600 h-2 rounded-full transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
