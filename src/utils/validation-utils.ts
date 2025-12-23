import { LinkItem, Product, Item, Link } from '@/types/product'
import { DetailedError, ErrorStep, createValidationError } from '@/types/errors'

export interface ValidationResult {
  isValid: boolean
  errors: DetailedError[]
  warnings: string[]
}

// Obtener el nombre/título de un item
function getItemDisplayName(item: LinkItem): string {
  if (item.type === 'link') {
    return (item as Link).label || `Link ${item.id}`
  }
  return (item as Product | Item).title || `${item.type} ${item.id}`
}

// Obtener el texto principal del item (título o label)
function getItemMainText(item: LinkItem): string {
  if (item.type === 'link') {
    return (item as Link).label
  }
  return (item as Product | Item).title
}

// Validar si un item está completo para ser mostrado públicamente
export function validateItemForPublic(item: LinkItem): ValidationResult {
  const errors: DetailedError[] = []
  const warnings: string[] = []

  // Validaciones básicas para todos los tipos
  const mainText = getItemMainText(item)
  if (!mainText?.trim()) {
    errors.push(createValidationError(
      ErrorStep.VALIDATION,
      item.type === 'link' ? 'El texto del enlace es obligatorio' : 'El título es obligatorio',
      getItemDisplayName(item),
      item.id
    ))
  }

  // Validaciones específicas por tipo
  switch (item.type) {
    case 'product':
      return validateProduct(item as Product, errors, warnings)
    case 'item':
      return validateItem(item as Item, errors, warnings)
    case 'link':
      return validateLink(item as Link, errors, warnings)
    default:
      errors.push(createValidationError(
        ErrorStep.VALIDATION,
        'Tipo de item no válido',
        `${item.type} ${item.id}`,
        item.id
      ))
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

function validateProduct(product: Product, errors: DetailedError[], warnings: string[]): ValidationResult {
  const displayName = product.title || `Producto ${product.id}`
  
  // Precio obligatorio para productos
  if (product.price === undefined || product.price === null || product.price < 0) {
    errors.push(createValidationError(
      ErrorStep.VALIDATION,
      'El precio es obligatorio y debe ser mayor o igual a 0',
      displayName,
      product.id
    ))
  }

  // Link de pago obligatorio para productos
  if (!product.paymentLink?.trim()) {
    errors.push(createValidationError(
      ErrorStep.VALIDATION,
      'El enlace de pago es obligatorio para productos',
      displayName,
      product.id
    ))
  }

  // Al menos una imagen para productos
  if (!product.images || product.images.length === 0) {
    errors.push(createValidationError(
      ErrorStep.VALIDATION,
      'Los productos deben tener al menos una imagen',
      displayName,
      product.id
    ))
  }

  // Descripción recomendada
  if (!product.description?.trim()) {
    warnings.push(`Producto "${product.title}": Se recomienda agregar una descripción`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

function validateItem(item: Item, errors: DetailedError[], warnings: string[]): ValidationResult {
  const displayName = item.title || `Item ${item.id}`

  // Al menos una imagen para items
  if (!item.images || item.images.length === 0) {
    errors.push(createValidationError(
      ErrorStep.VALIDATION,
      'Los items deben tener al menos una imagen',
      displayName,
      item.id
    ))
  }

  // Descripción recomendada
  if (!item.description?.trim()) {
      errors.push(createValidationError(
          ErrorStep.VALIDATION,
          'Los items deben tener descripción',
          displayName,
          item.id
      ))
  }

  // Validar precio si está visible
  if (item.priceVisible && (item.price === undefined || item.price === null || item.price < 0)) {
    errors.push(createValidationError(
      ErrorStep.VALIDATION,
      'Si el precio es visible, debe ser mayor o igual a 0',
      displayName,
      item.id
    ))
  }

  // Link obligatorio para items
    if (!item.paymentLink?.trim()) {
        errors.push(createValidationError(
            ErrorStep.VALIDATION,
            'El enlace de es obligatorio para items',
            displayName,
            item.id
        ))
    }

  // 🆕 Validar fecha de publicación (obligatoria)
  if (!item.publicationDate) {
    errors.push(createValidationError(
      ErrorStep.VALIDATION,
      'La fecha de publicación es obligatoria',
      displayName,
      item.id
    ))
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(item.publicationDate)) {
    errors.push(createValidationError(
      ErrorStep.VALIDATION,
      'La fecha de publicación tiene un formato inválido (debe ser YYYY-MM-DD)',
      displayName,
      item.id
    ))
  }

  // 🆕 Validar fecha de actividad (opcional, solo si existe)
  if (item.activityDate && !/^\d{4}-\d{2}-\d{2}$/.test(item.activityDate)) {
    errors.push(createValidationError(
      ErrorStep.VALIDATION,
      'La fecha de actividad tiene un formato inválido (debe ser YYYY-MM-DD)',
      displayName,
      item.id
    ))
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

function validateLink(link: Link, errors: DetailedError[], warnings: string[]): ValidationResult {
  const displayName = link.label || `Link ${link.id}`

  // URL obligatoria para links
  if (!link.url?.trim()) {
    errors.push(createValidationError(
      ErrorStep.VALIDATION,
      'La URL es obligatoria para enlaces',
      displayName,
      link.id
    ))
  }

  // Validar formato de URL
  if (link.url?.trim()) {
    try {
      new URL(link.url)
    } catch {
      errors.push(createValidationError(
        ErrorStep.VALIDATION,
        'La URL no tiene un formato válido',
        displayName,
        link.id
      ))
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Validar múltiples items
export function validateItemsForPublic(items: LinkItem[]): ValidationResult {
  const allErrors: DetailedError[] = []
  const allWarnings: string[] = []

  items.forEach(item => {
    // Validar TODOS los items antes de guardar, visibles o no
    // Esto evita que se guarden items incompletos que luego puedan hacerse visibles
    const validation = validateItemForPublic(item)
    allErrors.push(...validation.errors)
    allWarnings.push(...validation.warnings)
  })

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  }
}

// Validar solo items visibles (para mostrar públicamente)
export function validateVisibleItemsForPublic(items: LinkItem[]): ValidationResult {
  const allErrors: DetailedError[] = []
  const allWarnings: string[] = []

  items.forEach(item => {
    // Solo validar items visibles
    if (item.visible) {
      const validation = validateItemForPublic(item)
      allErrors.push(...validation.errors)
      allWarnings.push(...validation.warnings)
    }
  })

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  }
}

// Filtrar items válidos para mostrar públicamente
export function filterValidItemsForPublic(items: LinkItem[]): LinkItem[] {
  return items.filter(item => {
    if (!item.visible) return false
    
    const validation = validateItemForPublic(item)
    return validation.isValid
  })
}

// Verificar si un item está en estado de borrador (incompleto)
export function isItemDraft(item: LinkItem): boolean {
  const validation = validateItemForPublic(item)
  return !validation.isValid
}