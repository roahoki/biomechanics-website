'use client'

import { useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'

interface CategoryManagerCompactProps {
  categories: string[]
  onCategoriesChange: (categories: string[]) => void
}

export default function CategoryManagerCompact({ categories, onCategoriesChange }: CategoryManagerCompactProps) {
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isLoading, setIsLoading] = useState(false) // Conservado para deshabilitar UI mientras se procesa localmente

  const addCategory = () => {
    if (!newCategoryName.trim() || newCategoryName.length > 20) return
    setIsLoading(true)
    const updatedCategories = [...categories, newCategoryName.trim()]
    onCategoriesChange(updatedCategories)
    setNewCategoryName('')
    setIsLoading(false)
  }

  const deleteCategory = (index: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    setIsLoading(true)
    const updatedCategories = categories.filter((_, i) => i !== index)
    onCategoriesChange(updatedCategories)
    setIsLoading(false)
  }

  const saveEdit = () => {
    if (!editingName.trim() || editingName.length > 20 || editingIndex === null) return
    setIsLoading(true)
    const updatedCategories = [...categories]
    updatedCategories[editingIndex] = editingName.trim()
    onCategoriesChange(updatedCategories)
    setEditingIndex(null)
    setEditingName('')
    setIsLoading(false)
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditingName('')
  }

  const moveCategory = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= categories.length || fromIndex === toIndex) return
    setIsLoading(true)
    const updatedCategories = [...categories]
    const [moved] = updatedCategories.splice(fromIndex, 1)
    updatedCategories.splice(toIndex, 0, moved)
    onCategoriesChange(updatedCategories)
    setIsLoading(false)
  }

  return (
    <div className="space-y-3">
      {/* Agregar nueva categoría */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value.slice(0, 20))}
          placeholder="Nueva categoría..."
          className="flex-1 px-2 py-1 text-sm bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onKeyDown={(e) => e.key === 'Enter' && addCategory()}
          disabled={isLoading}
        />
        <button
          onClick={addCategory}
          disabled={isLoading || !newCategoryName.trim()}
          className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Lista de categorías */}
      <div className="space-y-2">
        {categories.map((category, index) => (
          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-600 rounded">
            {editingIndex === index ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value.slice(0, 20))}
                  className="flex-1 px-2 py-1 text-sm bg-gray-700 border border-gray-500 rounded text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit()
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  autoFocus
                />
                <button
                  onClick={saveEdit}
                  className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  ✓
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                >
                  ✕
                </button>
              </>
            ) : (
              <>
                {/* Controles de orden */}
                <div className="flex flex-col items-center space-y-1">
                  <button
                    onClick={() => moveCategory(index, index - 1)}
                    disabled={index === 0 || isLoading}
                    className={`p-1 rounded text-gray-300 hover:text-white hover:bg-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
                    title="Subir"
                  >
                    <ArrowUpIcon className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveCategory(index, index + 1)}
                    disabled={index === categories.length - 1 || isLoading}
                    className={`p-1 rounded text-gray-300 hover:text-white hover:bg-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
                    title="Bajar"
                  >
                    <ArrowDownIcon className="w-3 h-3" />
                  </button>
                </div>
                <span className="flex-1 text-sm text-gray-200 truncate">{category}</span>
                <button
                  onClick={() => {
                    setEditingIndex(index)
                    setEditingName(category)
                  }}
                  className="p-1 text-gray-400 hover:text-yellow-400"
                  disabled={isLoading}
                >
                  <PencilIcon className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteCategory(index)}
                  className="p-1 text-gray-400 hover:text-red-400"
                  disabled={isLoading}
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="text-center text-gray-400 text-xs py-4">
          No hay categorías.<br />Agrega una nueva arriba.
        </p>
      )}
      <p className="text-[10px] text-gray-400 text-right">Los cambios se guardarán al presionar "Guardar Cambios".</p>
    </div>
  )
}
