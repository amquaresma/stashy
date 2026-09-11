import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CollectionForm from '../../collection-form'
import { updateCollection } from '../../actions'
import CoverUploader from './cover-uploader'

export default async function EditCollectionPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: collection } = await supabase
    .from('collections')
    .select('id, name, description, color, cover_url')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!collection) {
    notFound()
  }

  const updateCollectionWithId = updateCollection.bind(null, collection.id)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold">Editar coleção</h1>
        <CoverUploader collectionId={collection.id} initialCoverUrl={collection.cover_url} />
        <CollectionForm
          action={updateCollectionWithId}
          initialCollection={collection}
          submitLabel="Salvar alterações"
        />
      </div>
    </div>
  )
}
