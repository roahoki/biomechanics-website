'use client'

import { useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

interface CategoryManagerCompactProps {
  categories: string[]
  onCategoriesChange: (categories: string[]) => void
}

export default function CategoryManagerCompact({ categories, onCategoriesChange }: CategoryManagerCompactProps) {
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAddInput, setShowAddInput] = useState(false)

  const addCategory = () => {
    if (!newCategoryName.trim() || newCategoryName.length > 20) return
    setIsLoading(true)
    const updatedCategories = [...categories, newCategoryName.trim()]
    onCategoriesChange(updatedCategories)
    setNewCategoryName('')
    setShowAddInput(false)
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

  const cancelAdd = () => {
    setNewCategoryName('')
    setShowAddInput(false)
  }

  return (
    <div className="space-y-3">
      {/* Vista de chips/tags horizontales inspirada en Pinterest */}
      <div className="flex flex-wrap gap-2 items-center min-h-[2.5rem]">
        {categories.map((category, index) => (
          <div key={index} className="relative group">
            {editingIndex === index ? (
              /* Chip en modo edición */
              <div className="flex items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value.slice(0, 20))}
                  className="text-sm bg-transparent border-none outline-none text-gray-800 w-20 min-w-0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit()
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  autoFocus
                  onBlur={saveEdit}
                />
                <button
                  onClick={saveEdit}
                  className="ml-1 p-0.5 text-green-600 hover:text-green-700 rounded-full hover:bg-green-100 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={cancelEdit}
                  className="ml-0.5 p-0.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              /* Chip normal con controles ocultos que aparecen al hover */
              <div className="flex items-center bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1.5 transition-colors cursor-pointer">
                {/* Controles de movimiento (solo visibles en hover) */}
                <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity mr-1">
                  <button
                    onClick={() => moveCategory(index, index - 1)}
                    disabled={index === 0 || isLoading}
                    className={`p-0.5 rounded-full text-xs ${
                      index === 0 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:text-blue-600 hover:bg-blue-100'
                    } transition-colors`}
                    title="Mover izquierda"
                  >
                    <ArrowLeftIcon className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={() => moveCategory(index, index + 1)}
                    disabled={index === categories.length - 1 || isLoading}
                    className={`p-0.5 rounded-full text-xs ${
                      index === categories.length - 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:text-blue-600 hover:bg-blue-100'
                    } transition-colors`}
                    title="Mover derecha"
                  >
                    <ArrowRightIcon className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Nombre de la categoría */}
                <span className="text-sm text-gray-700 font-medium select-none truncate max-w-[120px]">
                  {category}
                </span>

                {/* Controles de acción (solo visibles en hover) */}
                <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                  <button
                    onClick={() => {
                      setEditingIndex(index)
                      setEditingName(category)
                    }}
                    className="p-0.5 text-gray-500 hover:text-amber-600 hover:bg-amber-100 rounded-full transition-colors"
                    disabled={isLoading}
                    title="Editar"
                  >
                    <PencilIcon className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={() => deleteCategory(index)}
                    className="p-0.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                    disabled={isLoading}
                    title="Eliminar"
                  >
                    <TrashIcon className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Botón/Input para agregar nueva categoría */}
        {showAddInput ? (
          <div className="flex items-center bg-blue-50 border-2 border-blue-200 border-dashed rounded-full px-3 py-1.5">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value.slice(0, 20))}
              placeholder="Nueva..."
              className="text-sm bg-transparent border-none outline-none text-gray-800 w-20 min-w-0 placeholder-gray-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') addCategory()
                if (e.key === 'Escape') cancelAdd()
              }}
              autoFocus
              onBlur={cancelAdd}
              disabled={isLoading}
            />
            <button
              onClick={addCategory}
              disabled={isLoading || !newCategoryName.trim()}
              className="ml-1 p-0.5 text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <PlusIcon className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddInput(true)}
            className="flex items-center bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-200 border-dashed rounded-full px-3 py-1.5 transition-colors group"
            disabled={isLoading}
          >
            <PlusIcon className="w-3 h-3 text-gray-400 group-hover:text-blue-500 mr-1" />
            <span className="text-sm text-gray-500 group-hover:text-blue-600 font-medium">
              Agregar
            </span>
          </button>
        )}
      </div>

      {/* Estado vacío */}
      {categories.length === 0 && !showAddInput && (
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm mb-2">📂 No hay categorías</p>
          <button
            onClick={() => setShowAddInput(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
          >
            Agrega tu primera categoría
          </button>
        </div>
      )}

      {/* Nota informativa */}
      {categories.length > 0 && (
        <p className="text-[10px] text-gray-400 text-right">
          Los cambios se guardarán al presionar "Guardar Cambios".
        </p>
      )}
    </div>
  )
}
