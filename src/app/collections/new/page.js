import CollectionForm from '../collection-form'
import { createCollection } from '../actions'

export default function NewCollectionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Nova coleção</h1>
        <CollectionForm action={createCollection} submitLabel="Criar coleção" />
      </div>
    </div>
  )
}
