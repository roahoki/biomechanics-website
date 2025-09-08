'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDownIcon, MagnifyingGlassIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface CategorySelectorProps {
  availableCategories: string[]
  selectedCategories: string[]
  onChange: (categories: string[]) => void
  onCreateCategory?: (categoryName: string) => void
  label?: string
  placeholder?: string
}

export default function CategorySelector({
  availableCategories = [],
  selectedCategories = [],
  onChange,
  onCreateCategory,
  label = 'Categorías',
  placeholder = 'Seleccionar categorías...'
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filtrar categorías basado en el término de búsqueda
  const filteredCategories = availableCategories.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Verificar si el término de búsqueda podría ser una nueva categoría
  const canCreateNewCategory = searchTerm.trim() && 
    !availableCategories.some(cat => cat.toLowerCase() === searchTerm.toLowerCase()) &&
    onCreateCategory

  // Detectar si es móvil y manejar eventos
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Cerrar dropdown/modal con escape
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    const handleScroll = () => !isMobile && setIsOpen(false)

    document.addEventListener('keydown', handleEscape)
    if (!isMobile) {
      window.addEventListener('scroll', handleScroll, true)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen, isMobile])

  const handleCategoryToggle = (category: string) => {
    const isSelected = selectedCategories.includes(category)
    if (isSelected) {
      onChange(selectedCategories.filter(c => c !== category))
    } else {
      onChange([...selectedCategories, category])
    }
  }

  const handleCreateCategory = () => {
    if (canCreateNewCategory && onCreateCategory) {
      const newCategory = searchTerm.trim()
      onCreateCategory(newCategory)
      // Seleccionar automáticamente la nueva categoría
      onChange([...selectedCategories, newCategory])
      setSearchTerm('')
    }
  }

  const handleRemoveCategory = (category: string) => {
    onChange(selectedCategories.filter(c => c !== category))
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Estilo Pinterest: Botón principal más limpio */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-xl text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <span className="text-base text-gray-700">
          {selectedCategories.length === 0 
            ? placeholder 
            : `${selectedCategories.length} categoría${selectedCategories.length !== 1 ? 's' : ''} seleccionada${selectedCategories.length !== 1 ? 's' : ''}`
          }
        </span>
        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Preview de categorías seleccionadas estilo Pinterest */}
      {selectedCategories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <span
              key={category}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
            >
              {category}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveCategory(category)
                }}
                className="ml-2 text-blue-600 hover:text-blue-800 font-semibold"
                title={`Quitar ${category}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Modal de pantalla completa para móvil / Dropdown para desktop */}
      {isOpen && (
        <>
          {isMobile ? (
            /* Modal móvil - Pantalla completa */
            <div className="fixed inset-0 z-[9999] bg-white">
              {/* Header del modal */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <h2 className="text-lg font-semibold text-gray-900">Seleccionar Categorías</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="flex flex-col h-full">
                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar o crear categoría..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Crear nueva categoría */}
                {canCreateNewCategory && (
                  <div className="p-4 border-b border-gray-100 bg-blue-50">
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="w-full flex items-center px-4 py-3 text-left hover:bg-blue-100 rounded-xl transition-colors text-blue-700"
                    >
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full mr-3">
                        <PlusIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-base font-medium">
                        Crear "{searchTerm.trim()}"
                      </span>
                    </button>
                  </div>
                )}

                {/* Lista de categorías */}
                <div className="flex-1 overflow-y-auto">
                  {filteredCategories.length === 0 && !canCreateNewCategory ? (
                    <div className="p-8 text-center">
                      <div className="text-gray-400 mb-2">
                        <MagnifyingGlassIcon className="w-12 h-12 mx-auto" />
                      </div>
                      <p className="text-gray-500">
                        {searchTerm ? 'No se encontraron categorías' : 'No hay categorías disponibles'}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-2">
                      {filteredCategories.map((category) => {
                        const isSelected = selectedCategories.includes(category)
                        return (
                          <label
                            key={category}
                            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors rounded-xl"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCategoryToggle(category)}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="ml-4 text-base text-gray-700 font-medium">{category}</span>
                            {isSelected && (
                              <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Footer con botón de cerrar */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-full px-4 py-3 text-base text-white bg-blue-500 rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
                  >
                    Listo ({selectedCategories.length} seleccionada{selectedCategories.length !== 1 ? 's' : ''})
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Dropdown desktop */
            <>
              <div
                className="fixed inset-0 z-[9998] bg-black bg-opacity-10"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute top-full mt-2 left-0 right-0 z-[9999] bg-white border border-gray-200 rounded-xl shadow-2xl max-h-[70vh] overflow-hidden">
                {/* Search con diseño Pinterest */}
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar o crear categoría..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Opción para crear nueva categoría */}
                {canCreateNewCategory && (
                  <div className="p-2 border-b border-gray-100 bg-blue-50">
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="w-full flex items-center px-3 py-2.5 text-left hover:bg-blue-100 rounded-lg transition-colors text-blue-700"
                    >
                      <div className="flex items-center justify-center w-5 h-5 bg-blue-500 rounded-full mr-3">
                        <PlusIcon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-base font-medium">
                        Crear "{searchTerm.trim()}"
                      </span>
                    </button>
                  </div>
                )}

                {/* Categories List estilo Pinterest */}
                <div className="max-h-60 overflow-y-auto">
                  {filteredCategories.length === 0 && !canCreateNewCategory ? (
                    <div className="p-4 text-sm text-gray-500 text-center">
                      {searchTerm ? 'No se encontraron categorías' : 'No hay categorías disponibles'}
                    </div>
                  ) : (
                    filteredCategories.map((category) => {
                      const isSelected = selectedCategories.includes(category)
                      return (
                        <label
                          key={category}
                          className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCategoryToggle(category)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="ml-3 text-base text-gray-700 font-medium">{category}</span>
                        </label>
                      )
                    })
                  )}
                </div>

                {/* Close Button estilo Pinterest */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-full px-4 py-2.5 text-base text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
