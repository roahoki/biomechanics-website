'use client'

import { useState, useMemo } from 'react'
import { LinkItem } from '@/types/product'

export function useCategoryFilter(items: LinkItem[], categories: string[]) {
  const [selectedCategory, setSelectedCategory] = useState('Todo')

  // Filtrar items basado en la categoría seleccionada
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'Todo') {
      return items
    }

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

    // Mantener el orden original de las categorías pero solo mostrar las que tienen items
    return categories.filter(category => categoriesInUse.has(category))
  }, [items, categories])

  return {
    selectedCategory,
    setSelectedCategory,
    filteredItems,
    categoriesWithItems
  }
}
