import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ItemForm from '../../item-form'
import { updateItem } from '../../actions'
import LinksManager from './links-manager'
import TagsManager from './tags-manager'

export default async function EditItemPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: item } = await supabase
    .from('items')
    .select('id, name, price, image_url, description')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!item) {
    notFound()
  }

  const { data: links } = await supabase
    .from('item_links')
    .select('id, url')
    .eq('item_id', item.id)

  const { data: itemTags } = await supabase
    .from('item_tags')
    .select('tag_id, tags(name, is_public)')
    .eq('item_id', item.id)

  const tags = (itemTags ?? []).map((it) => ({
    tag_id: it.tag_id,
    name: it.tags.name,
    is_public: it.tags.is_public,
  }))

  const updateItemWithId = updateItem.bind(null, item.id)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold">Editar item</h1>
        <ItemForm action={updateItemWithId} initialItem={item} submitLabel="Salvar alterações" />
        <LinksManager itemId={item.id} initialLinks={links ?? []} />
        <TagsManager itemId={item.id} initialTags={tags} />
      </div>
    </div>
  )
}
