'use client'

import { useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { updateCategoriesInSupabase } from '@/utils/links'

interface CategoryManagerCompactProps {
  categories: string[]
  onCategoriesChange: () => void
}

export default function CategoryManagerCompact({ categories, onCategoriesChange }: CategoryManagerCompactProps) {
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const addCategory = async () => {
    if (!newCategoryName.trim() || newCategoryName.length > 20) return
    
    setIsLoading(true)
    try {
      const updatedCategories = [...categories, newCategoryName.trim()]
      await updateCategoriesInSupabase(updatedCategories)
      setNewCategoryName('')
      onCategoriesChange()
    } catch (error) {
      console.error('Error agregando categoría:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCategory = async (index: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    
    setIsLoading(true)
    try {
      const updatedCategories = categories.filter((_, i) => i !== index)
      await updateCategoriesInSupabase(updatedCategories)
      onCategoriesChange()
    } catch (error) {
      console.error('Error eliminando categoría:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveEdit = async () => {
    if (!editingName.trim() || editingName.length > 20 || editingIndex === null) return
    
    setIsLoading(true)
    try {
      const updatedCategories = [...categories]
      updatedCategories[editingIndex] = editingName.trim()
      await updateCategoriesInSupabase(updatedCategories)
      setEditingIndex(null)
      setEditingName('')
      onCategoriesChange()
    } catch (error) {
      console.error('Error editando categoría:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditingName('')
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
          onKeyPress={(e) => e.key === 'Enter' && addCategory()}
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
                  onKeyPress={(e) => {
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
    </div>
  )
}
