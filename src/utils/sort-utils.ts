import { LinkItem, SortMode, Item } from '@/types/product'

/**
 * Ordena un array de LinkItems según el modo de ordenamiento especificado
 * 
 * @param links - Array de items a ordenar
 * @param mode - Modo de ordenamiento: 'manual', 'activityDate', o 'publicationDate'
 * @returns Array ordenado de LinkItems
 */
export function sortLinks(links: LinkItem[], mode: SortMode): LinkItem[] {
  // Si el modo es manual, retornar el array sin modificar
  if (mode === 'manual') {
    return links
  }

  // Crear una copia para no mutar el array original
  const sortedLinks = [...links]

  if (mode === 'activityDate') {
    return sortByActivityDate(sortedLinks)
  }

  if (mode === 'publicationDate') {
    return sortByPublicationDate(sortedLinks)
  }

  // Fallback: retornar el array sin modificar
  return links
}

/**
 * Ordena por fecha de actividad: futuro → pasado
 * Items sin activityDate van al final
 */
function sortByActivityDate(links: LinkItem[]): LinkItem[] {
  return links.sort((a, b) => {
    const aItem = a as Item
    const bItem = b as Item

    // Verificar si son Items (tienen activityDate)
    const aHasDate = 'activityDate' in aItem && aItem.activityDate
    const bHasDate = 'activityDate' in bItem && bItem.activityDate

    // Items sin fecha van al final
    if (!aHasDate && !bHasDate) return 0
    if (!aHasDate) return 1
    if (!bHasDate) return -1

    // Comparar fechas: más reciente primero (futuro → pasado)
    const dateA = new Date(aItem.activityDate!).getTime()
    const dateB = new Date(bItem.activityDate!).getTime()

    return dateB - dateA // Orden descendente
  })
}

/**
 * Ordena por fecha de publicación: más reciente → más antiguo
 * Todos los Items deben tener publicationDate (campo obligatorio)
 */
function sortByPublicationDate(links: LinkItem[]): LinkItem[] {
  return links.sort((a, b) => {
    const aItem = a as Item
    const bItem = b as Item

    // Verificar si son Items (tienen publicationDate)
    const aHasDate = 'publicationDate' in aItem && aItem.publicationDate
    const bHasDate = 'publicationDate' in bItem && bItem.publicationDate

    // Si alguno no tiene publicationDate, mantener orden original
    if (!aHasDate && !bHasDate) return 0
    if (!aHasDate) return 1
    if (!bHasDate) return -1

    // Comparar fechas: más reciente primero
    const dateA = new Date(aItem.publicationDate).getTime()
    const dateB = new Date(bItem.publicationDate).getTime()

    return dateB - dateA // Orden descendente
  })
}

/**
 * Verifica si un LinkItem es un Item (tiene campos de Item)
 */
export function isItem(linkItem: LinkItem): linkItem is Item {
  return 'type' in linkItem && linkItem.type === 'item'
}

/**
 * Obtiene la fecha de actividad de un item de forma segura
 * Retorna null si no es un Item o no tiene activityDate
 */
export function getActivityDate(linkItem: LinkItem): string | null {
  if (isItem(linkItem)) {
    return linkItem.activityDate || null
  }
  return null
}

/**
 * Obtiene la fecha de publicación de un item de forma segura
 * Retorna null si no es un Item o no tiene publicationDate
 */
export function getPublicationDate(linkItem: LinkItem): string | null {
  if (isItem(linkItem)) {
    return linkItem.publicationDate
  }
  return null
}
