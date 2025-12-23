'use client'

import { useState, useMemo } from 'react'
import { LinkItem } from '@/types/product'

export function useCategoryFilter(items: LinkItem[], categories: string[]) {
  const [selectedCategory, setSelectedCategory] = useState('Destacados')

  // Filtrar items basado en la categoría seleccionada
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'Todo') {
      // "Todo" muestra todos los elementos visibles
      return items.filter(item => item.visible !== false)
    }

    // Para "Destacados" y todas las demás categorías, mostrar solo los elementos de esa categoría
    return items.filter(item => {
      // Verificar si el item tiene categorías y si incluye la categoría seleccionada
      return item.categories && item.categories.includes(selectedCategory)
    })
  }, [items, selectedCategory])

  // Obtener categorías que realmente tienen items
  const categoriesWithItems = useMemo(() => {
    const categoriesInUse = new Set<string>()
    
    items.forEach(item => {
      if (item.categories) {
        item.categories.forEach(category => {
          if (categories.includes(category)) {
            categoriesInUse.add(category)
          }
        })
      }
    })

    // Filtrar solo las categorías que tienen items
    const filteredCategories = categories.filter(category => categoriesInUse.has(category))
    
    // Crear un nuevo array con el orden deseado: "Destacados" primero, el resto en orden original
    let orderedCategories = []
    
    // Si "Destacados" está en las categorías disponibles, asegurarnos que vaya primero
    if (filteredCategories.includes('Destacados')) {
      orderedCategories.push('Destacados')
      // Agregar el resto de categorías (excepto "Destacados")
      filteredCategories.forEach(category => {
        if (category !== 'Destacados') {
          orderedCategories.push(category)
        }
      })
    } else {
      // Si no existe "Destacados", mantener el orden original
      orderedCategories = [...filteredCategories]
    }
    
    // Agregar "Todo" al final
    orderedCategories.push('Todo')
    
    return orderedCategories
  }, [items, categories])

  return {
    selectedCategory,
    setSelectedCategory,
    filteredItems,
    categoriesWithItems
  }
}
