'use client'

import { useState, useEffect } from 'react'

interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  className?: string
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  className = ""
}: CategoryFilterProps) {
  const [isScrollable, setIsScrollable] = useState(false)

  // Agregar "Todo" al final de la lista
  const allCategories = [...categories, 'Todo']

  // Verificar si el contenedor es scrolleable
  useEffect(() => {
    const container = document.getElementById('category-filter-container')
    if (container) {
      setIsScrollable(container.scrollWidth > container.clientWidth)
    }
  }, [categories])

  return (
    <div className={`relative py-4 ${className}`}>
      {/* Contenedor scrolleable */}
      <div
        id="category-filter-container"
        className="flex justify-start lg:justify-center space-x-6 lg:space-x-8 overflow-x-auto overflow-y-visible scrollbar-hide px-4 lg:px-0"
        style={{
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* Internet Explorer 10+ */
        }}
      >
        {allCategories.map((category) => {
          const isSelected = selectedCategory === category
          
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                flex-shrink-0 px-3 py-3 text-sm lg:text-base font-medium transition-colors duration-200
                min-w-fit whitespace-nowrap relative border-b-2
                ${isSelected
                  ? 'text-white border-white'
                  : 'text-white/70 border-transparent hover:text-white hover:border-white/30'
                }
              `}
            >
              {category}
            </button>
          )
        })}
      </div>

      {/* Gradientes para indicar scroll (opcional) */}
      {isScrollable && (
        <>
          {/* Gradiente izquierdo */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
          {/* Gradiente derecho */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
        </>
      )}

      {/* Estilos para ocultar scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
