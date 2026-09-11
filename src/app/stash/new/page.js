import ItemForm from '../item-form'
import { createItem } from '../actions'

export default function NewItemPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Novo item</h1>
        <ItemForm action={createItem} submitLabel="Salvar item" />
      </div>
    </div>
  )
}
