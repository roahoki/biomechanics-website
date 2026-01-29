/**
 * Genera un slug único desde un título
 * Ej: "Early bird $8.000" -> "early-bird-8000"
 */
export function generateSlug(title: string, id: number): string {
  return `${title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Remover guiones múltiples
    .trim()}-${id}`
}

/**
 * Extrae el ID del slug
 * Ej: "early-bird-8000" -> 8000
 */
export function extractIdFromSlug(slug: string): number | null {
  const parts = slug.split('-')
  const id = parseInt(parts[parts.length - 1], 10)
  return isNaN(id) ? null : id
}
