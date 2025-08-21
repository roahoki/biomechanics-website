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
    <div className={`relative py-2 z-10`}>
      {/* Contenedor scrolleable - ahora con fondo semi-transparente más suave */}
      <div
        id="category-filter-container"
        className="flex justify-start lg:justify-center space-x-4 lg:space-x-6 overflow-x-auto overflow-y-visible scrollbar-hide px-2 mx-auto lg:max-w-3xl lg:bg-black/30 lg:backdrop-blur-sm lg:rounded-full lg:px-4 lg:py-1"
        style={{
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* Internet Explorer 10+ */
          transition: 'all 0.3s ease' /* Transición suave */
        }}
      >
        {allCategories.map((category) => {
          const isSelected = selectedCategory === category
          
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                flex-shrink-0 px-2.5 py-2 text-xs lg:text-sm font-medium transition-all duration-300 ease-in-out
                min-w-fit whitespace-nowrap relative border-b-2
                ${isSelected
                  ? 'text-white border-white font-semibold'
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
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r pointer-events-none" />
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
