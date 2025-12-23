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
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Ya no es necesario agregar "Todo" aquí, se hace en el hook useCategoryFilter
  const allCategories = categories

  // Verificar si el contenedor es scrolleable y la posición del scroll
  const updateScrollState = () => {
    const container = document.getElementById('category-filter-container')
    if (container) {
      const isScrollableNow = container.scrollWidth > container.clientWidth
      const scrollLeft = container.scrollLeft
      const maxScrollLeft = container.scrollWidth - container.clientWidth
      
      setIsScrollable(isScrollableNow)
      setCanScrollLeft(scrollLeft > 5) // Un poco de margen para evitar flickering
      setCanScrollRight(scrollLeft < maxScrollLeft - 5)
    }
  }

  useEffect(() => {
    updateScrollState()
    
    const container = document.getElementById('category-filter-container')
    if (container) {
      container.addEventListener('scroll', updateScrollState)
      // También verificar cuando cambia el tamaño de la ventana
      window.addEventListener('resize', updateScrollState)
      
      return () => {
        container.removeEventListener('scroll', updateScrollState)
        window.removeEventListener('resize', updateScrollState)
      }
    }
  }, [categories])

  return (
    <div className={`relative w-full ${className}`}>
      <div
        id="category-filter-container"
        className="flex space-x-3 md:space-x-6 overflow-x-auto overflow-y-visible scrollbar-hide px-4 md:px-6 py-2 mx-auto md:max-w-3xl md:bg-black/30 md:backdrop-blur-sm md:rounded-full scroll-smooth"
        style={{
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* Internet Explorer 10+ */
          transition: 'all 0.3s ease', /* Transición suave */
          scrollSnapType: 'x mandatory' /* Snap scroll en móvil */
        }}
      >
        {allCategories.map((category, index) => {
          const isSelected = selectedCategory === category
          
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                flex-shrink-0 px-3 py-2.5 md:px-2.5 md:py-2 text-sm md:text-sm font-medium transition-all duration-300 ease-in-out
                min-w-fit whitespace-nowrap relative border-b-2 rounded-t-lg md:rounded-none
                scroll-snap-align-start
                ${isSelected
                  ? 'text-white border-white font-semibold bg-white/10 md:bg-transparent'
                  : 'text-white/70 border-transparent hover:text-white hover:border-white/30 hover:bg-white/5 md:hover:bg-transparent'
                }
              `}
              style={{
                scrollSnapAlign: index === 0 ? 'start' : index === allCategories.length - 1 ? 'end' : 'center'
              }}
            >
              {category}
            </button>
          )
        })}
      </div>

      {/* Indicadores de scroll para móvil */}
      {isScrollable && (
        <>
          {/* Gradiente izquierdo */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-6 md:w-8 bg-gradient-to-r from-black/60 to-transparent pointer-events-none z-10 md:hidden" />
          )}
          {/* Gradiente derecho */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-6 md:w-8 bg-gradient-to-l from-black/60 to-transparent pointer-events-none z-10 md:hidden" />
          )}
          
          {/* Indicador de scroll en móvil */}
          <div className="flex justify-center mt-2 md:hidden">
            <div className="flex space-x-1">
              {allCategories.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    allCategories[index] === selectedCategory ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
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
