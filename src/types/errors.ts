export enum ErrorType {
  VALIDATION = 'validation',
  UPLOAD = 'upload',
  DATABASE = 'database',
  NETWORK = 'network',
  PERMISSION = 'permission',
  FILE_SIZE = 'file_size',
  FILE_TYPE = 'file_type'
}

export enum ErrorStep {
  VALIDATION = 'validación',
  PROFILE_IMAGE_UPLOAD = 'subida de imagen de perfil',
  BACKGROUND_IMAGE_UPLOAD = 'subida de imagen de fondo',
  PRODUCT_IMAGES_UPLOAD = 'subida de imágenes de productos',
  ITEM_IMAGES_UPLOAD = 'subida de imágenes de items',
  DATABASE_SAVE = 'guardado en base de datos',
  FILE_PROCESSING = 'procesamiento de archivo'
}

export interface DetailedError {
  type: ErrorType
  step: ErrorStep
  itemId?: number
  itemName?: string
  fileName?: string
  originalError: string
  userMessage: string
  suggestedAction?: string
}

export interface OperationResult<T = any> {
  success: boolean
  data?: T
  error?: DetailedError
  message?: string
}

// Utility functions para crear errores específicos
export const createValidationError = (
  step: ErrorStep,
  message: string,
  itemName?: string,
  itemId?: number
): DetailedError => ({
  type: ErrorType.VALIDATION,
  step,
  itemId,
  itemName,
  originalError: message,
  userMessage: `Error de validación: ${message}`,
  suggestedAction: 'Revisa los campos requeridos y vuelve a intentar.'
})

export const createUploadError = (
  step: ErrorStep,
  fileName: string,
  originalError: string,
  itemName?: string
): DetailedError => ({
  type: ErrorType.UPLOAD,
  step,
  fileName,
  itemName,
  originalError,
  userMessage: `Error al subir "${fileName}": ${originalError}`,
  suggestedAction: 'Verifica el tamaño y formato del archivo, luego intenta nuevamente.'
})

export const createDatabaseError = (
  originalError: string,
  itemName?: string
): DetailedError => ({
  type: ErrorType.DATABASE,
  step: ErrorStep.DATABASE_SAVE,
  itemName,
  originalError,
  userMessage: `Error al guardar en la base de datos: ${originalError}`,
  suggestedAction: 'Intenta guardar nuevamente. Si el problema persiste, contacta soporte.'
})

export const createNetworkError = (
  step: ErrorStep,
  originalError: string
): DetailedError => ({
  type: ErrorType.NETWORK,
  step,
  originalError,
  userMessage: `Error de conexión durante ${step}: ${originalError}`,
  suggestedAction: 'Verifica tu conexión a internet e intenta nuevamente.'
})

export const createPermissionError = (
  step: ErrorStep
): DetailedError => ({
  type: ErrorType.PERMISSION,
  step,
  originalError: 'No tienes autorización para esta acción',
  userMessage: 'No tienes permisos suficientes para realizar esta acción.',
  suggestedAction: 'Contacta al administrador para obtener los permisos necesarios.'
})