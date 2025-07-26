import { LinkItem } from '@/types/product'

// Función helper para limpiar categorías eliminadas de los items
export function cleanupItemCategories(items: LinkItem[], validCategories: string[]): LinkItem[] {
  return items.map(item => {
    if (!item.categories) return item

    const cleanedCategories = item.categories.filter(category => 
      validCategories.includes(category)
    )

    return {
      ...item,
      categories: cleanedCategories.length > 0 ? cleanedCategories : undefined
    }
  })
}
