'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface CategorySelectorProps {
  availableCategories: string[]
  selectedCategories: string[]
  onChange: (categories: string[]) => void
  label?: string
  placeholder?: string
}

export default function CategorySelector({
  availableCategories = [],
  selectedCategories = [],
  onChange,
  label = 'Categorías',
  placeholder = 'Seleccionar categorías...'
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState<'down' | 'up'>('down')
  const containerRef = useRef<HTMLDivElement>(null)

  // Filtrar categorías basado en el término de búsqueda
  const filteredCategories = availableCategories.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calcular posición del dropdown
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      
      // Si hay más espacio arriba que abajo y no hay suficiente espacio abajo
      if (spaceAbove > spaceBelow && spaceBelow < 350) {
        setDropdownPosition('up')
      } else {
        setDropdownPosition('down')
      }
    }
  }, [isOpen])

  const handleCategoryToggle = (category: string) => {
    const isSelected = selectedCategories.includes(category)
    if (isSelected) {
      onChange(selectedCategories.filter(c => c !== category))
    } else {
      onChange([...selectedCategories, category])
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-200 mb-2">
        {label}
      </label>
      
      {/* Botón selector principal */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-left text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="text-sm">
          {selectedCategories.length === 0 
            ? placeholder 
            : `${selectedCategories.length} categoría${selectedCategories.length !== 1 ? 's' : ''} seleccionada${selectedCategories.length !== 1 ? 's' : ''}`
          }
        </span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Preview de categorías seleccionadas */}
      {selectedCategories.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedCategories.map((category) => (
            <span
              key={category}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {category}
              <button
                type="button"
                onClick={() => handleCategoryToggle(category)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown con posicionamiento inteligente */}
      {isOpen && (
        <div 
          className={`absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-hidden ${
            dropdownPosition === 'up' 
              ? 'bottom-full mb-1' 
              : 'top-full mt-1'
          }`}
        >
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Categories List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCategories.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                No se encontraron categorías
              </div>
            ) : (
              filteredCategories.map((category) => {
                const isSelected = selectedCategories.includes(category)
                return (
                  <label
                    key={category}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCategoryToggle(category)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{category}</span>
                  </label>
                )
              })
            )}
          </div>

          {/* Close Button */}
          <div className="p-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
