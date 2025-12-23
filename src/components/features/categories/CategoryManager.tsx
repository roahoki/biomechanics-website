'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  Bars3Icon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface CategoryManagerProps {
  categories: string[]
  onCategoriesChange: (categories: string[]) => void
}

export default function CategoryManager({ categories, onCategoriesChange }: CategoryManagerProps) {
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateCategoryName = (name: string, excludeCategory?: string): string | null => {
    if (!name.trim()) {
      return 'El nombre de la categoría no puede estar vacío'
    }
    
    if (name.length > 65) {
      return 'El nombre de la categoría no puede exceder 65 caracteres'
    }
    
    const trimmedName = name.trim()
    const isDuplicate = categories.some(cat => 
      cat.toLowerCase() === trimmedName.toLowerCase() && 
      cat !== excludeCategory
    )
    
    if (isDuplicate) {
      return 'Ya existe una categoría con este nombre'
    }
    
    return null
  }

  const handleAddCategory = () => {
    const validationError = validateCategoryName(newCategoryName)
    if (validationError) {
      setError(validationError)
      return
    }

    const trimmedName = newCategoryName.trim()
    onCategoriesChange([...categories, trimmedName])
    setNewCategoryName('')
    setIsAddingCategory(false)
    setError(null)
  }

  const handleEditCategory = (oldName: string) => {
    const validationError = validateCategoryName(editingName, oldName)
    if (validationError) {
      setError(validationError)
      return
    }

    const trimmedName = editingName.trim()
    const newCategories = categories.map(cat => cat === oldName ? trimmedName : cat)
    onCategoriesChange(newCategories)
    setEditingCategory(null)
    setEditingName('')
    setError(null)
  }

  const handleDeleteCategory = (categoryName: string) => {
    const newCategories = categories.filter(cat => cat !== categoryName)
    onCategoriesChange(newCategories)
    setCategoryToDelete(null)
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(categories)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onCategoriesChange(items)
  }

  const startEdit = (category: string) => {
    setEditingCategory(category)
    setEditingName(category)
    setError(null)
  }

  const cancelEdit = () => {
    setEditingCategory(null)
    setEditingName('')
    setError(null)
  }

  const cancelAdd = () => {
    setIsAddingCategory(false)
    setNewCategoryName('')
    setError(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Gestionar Categorías</h3>
        <button
          onClick={() => setIsAddingCategory(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          Agregar Categoría
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add New Category */}
      {isAddingCategory && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la categoría
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ingresa el nombre de la categoría..."
                maxLength={65}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <p className="mt-1 text-xs text-gray-500">
                {newCategoryName.length}/65 caracteres
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleAddCategory}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Agregar
              </button>
              <button
                onClick={cancelAdd}
                className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Arrastra las categorías para reordenarlas. La categoría "Todo" aparecerá automáticamente en el filtro.
        </p>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {categories.map((category, index) => (
                  <Draggable key={category} draggableId={category} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-3 bg-white border border-gray-200 rounded-lg ${
                          snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                        }`}
                      >
                        {editingCategory === category ? (
                          // Edit Mode
                          <div className="space-y-3">
                            <div>
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                maxLength={65}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                onKeyPress={(e) => e.key === 'Enter' && handleEditCategory(category)}
                              />
                              <p className="mt-1 text-xs text-gray-500">
                                {editingName.length}/65 caracteres
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing"
                              >
                                <Bars3Icon className="w-5 h-5 text-gray-400" />
                              </div>
                              <span className="font-medium text-gray-900">{category}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => startEdit(category)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                                title="Editar categoría"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setCategoryToDelete(category)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                title="Eliminar categoría"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay categorías creadas. ¡Agrega tu primera categoría!
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Confirmar eliminación</h3>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              ¿Estás seguro de que quieres eliminar la categoría "{categoryToDelete}"? 
              Esta acción es irreversible y todos los items que tengan esta categoría 
              la perderán automáticamente.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteCategory(categoryToDelete)}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Eliminar
              </button>
              <button
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
