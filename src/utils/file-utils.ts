// Utilidades para manejo de archivos de avatar en el cliente
export type ProfileImageType = 'image' | 'video' | 'gif'

// Utilidad para detectar tipo de archivo
export function getFileType(file: File): ProfileImageType {
  const type = file.type.toLowerCase()
  
  if (type.startsWith('video/')) {
    return 'video'
  } else if (type === 'image/gif') {
    return 'gif'
  } else if (type.startsWith('image/')) {
    return 'image'
  }
  
  // Fallback basado en extensión
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (['mp4', 'webm', 'mov', 'avi'].includes(extension || '')) {
    return 'video'
  } else if (extension === 'gif') {
    return 'gif'
  }
  
  return 'image'
}

// Validar si el archivo es soportado
export function isValidAvatarFile(file: File): boolean {
  const maxSize = 1024 * 1024 * 1024 // 1GB
  const supportedTypes = [
    // Imágenes
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    // Videos
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
  ]
  
  return file.size <= maxSize && supportedTypes.includes(file.type.toLowerCase())
}

// Función para obtener el texto del tipo de archivo
export function getFileTypeText(type: ProfileImageType): string {
  switch (type) {
    case 'video': return 'Video'
    case 'gif': return 'GIF'
    case 'image': return 'Imagen'
    default: return 'Archivo'
  }
}
