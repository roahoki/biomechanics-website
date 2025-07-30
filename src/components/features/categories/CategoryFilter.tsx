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

  // Agregar "Todo" al inicio de la lista
  const allCategories = ['Todo', ...categories]

  // Verificar si el contenedor es scrolleable
  useEffect(() => {
    const container = document.getElementById('category-filter-container')
    if (container) {
      setIsScrollable(container.scrollWidth > container.clientWidth)
    }
  }, [categories])

  return (
    <div className={`relative ${className}`}>
      {/* Contenedor scrolleable */}
      <div
        id="category-filter-container"
        className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2"
        style={{
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* Internet Explorer 10+ */
        }}
      >
        {allCategories.map((category) => {
          const isSelected = selectedCategory === category
          const isEverything = category === 'Todo'
          
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                border-2 backdrop-blur-md
                ${isSelected
                  ? isEverything
                    ? 'bg-white/20 border-white text-white shadow-lg'
                    : 'bg-white/20 border-white text-white shadow-lg'
                  : 'bg-white/10 border-white/30 text-white/80 hover:bg-white/15 hover:border-white/50 hover:text-white'
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
