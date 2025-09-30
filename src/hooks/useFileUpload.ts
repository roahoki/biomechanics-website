import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { getFileType, isValidAvatarFile, type ProfileImageType } from '@/utils/file-utils'
import { 
    DetailedError, 
    OperationResult, 
    ErrorStep, 
    createUploadError, 
    createValidationError, 
    createNetworkError,
    createPermissionError 
} from '@/types/errors'

interface UseFileUploadProps {
    onStatusChange: (status: { message?: string; error?: string } | null) => void
}

export function useFileUpload({ onStatusChange }: UseFileUploadProps) {
    const { user } = useUser()
    const [uploadingImage, setUploadingImage] = useState(false)

    const uploadFileToSupabase = async (file: File): Promise<OperationResult<string>> => {
        try {
            if (!user) {
                return {
                    success: false,
                    error: createPermissionError(ErrorStep.PROFILE_IMAGE_UPLOAD)
                }
            }

            console.log('🔄 Subiendo archivo de perfil:', file.name)
            
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/upload-avatar', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error('❌ Error de la API:', errorData)
                
                return {
                    success: false,
                    error: createUploadError(
                        ErrorStep.PROFILE_IMAGE_UPLOAD,
                        file.name,
                        errorData.error || `Error HTTP: ${response.status}`
                    )
                }
            }

            const result = await response.json()
            
            if (result.success) {
                console.log('✅ Archivo de perfil subido exitosamente:', result.url)
                return {
                    success: true,
                    data: result.url
                }
            } else {
                return {
                    success: false,
                    error: createUploadError(
                        ErrorStep.PROFILE_IMAGE_UPLOAD,
                        file.name,
                        result.error || 'Error desconocido de la API'
                    )
                }
            }

        } catch (error) {
            console.error('💥 Error en uploadFileToSupabase:', error)
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            
            return {
                success: false,
                error: createNetworkError(ErrorStep.PROFILE_IMAGE_UPLOAD, errorMessage)
            }
        }
    }

    const handleFileSelect = (
        file: File,
        setSelectedFile: (file: File | null) => void,
        setPreviewUrl: (url: string) => void,
        setPreviewType: (type: ProfileImageType) => void
    ): OperationResult<void> => {
        // Validar archivo
        if (!isValidAvatarFile(file)) {
            const error = createValidationError(
                ErrorStep.FILE_PROCESSING,
                `Archivo "${file.name}" no válido. Formatos soportados: JPG, PNG, WebP, GIF, MP4, WebM. Máximo 1GB.`,
                file.name
            )
            onStatusChange({ error: error.userMessage })
            return { success: false, error }
        }

        try {
            setSelectedFile(file)
            const fileType = getFileType(file)
            setPreviewType(fileType)
            
            // Crear preview del archivo
            const reader = new FileReader()
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string)
            }
            reader.readAsDataURL(file)
            
            onStatusChange(null) // Limpiar errores previos
            return { success: true }
        } catch (error) {
            const detailedError = createValidationError(
                ErrorStep.FILE_PROCESSING,
                `Error procesando archivo "${file.name}": ${error instanceof Error ? error.message : 'Error desconocido'}`,
                file.name
            )
            onStatusChange({ error: detailedError.userMessage })
            return { success: false, error: detailedError }
        }
    }

    const handleBackgroundFileSelect = (
        file: File,
        setSelectedBackgroundFile: (file: File | null) => void,
        setBackgroundPreviewUrl: (url: string) => void
    ) => {
        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            onStatusChange({ error: 'Solo se permiten archivos de imagen para el fondo.' })
            return
        }

        // Validar tamaño (máximo 1GB para fondo)
        if (file.size > 1024 * 1024 * 1024) {
            onStatusChange({ error: 'La imagen de fondo debe ser menor a 1GB.' })
            return
        }

        setSelectedBackgroundFile(file)
        
        // Crear preview del archivo
        const reader = new FileReader()
        reader.onload = (e) => {
            setBackgroundPreviewUrl(e.target?.result as string)
        }
        reader.readAsDataURL(file)
        
        onStatusChange(null) // Limpiar errores previos
    }

    const uploadMultipleProductImages = async (dataUrls: string[], productId?: number, productName?: string): Promise<OperationResult<string[]>> => {
        try {
            // Convertir data URLs a archivos
            const files = await Promise.all(
                dataUrls.map(async (dataUrl, index) => {
                    try {
                        const response = await fetch(dataUrl)
                        if (!response.ok) {
                            throw new Error(`Error al procesar imagen ${index + 1}: ${response.statusText}`)
                        }
                        
                        const blob = await response.blob()
                        return new File([blob], `product-image-${Date.now()}-${index}.jpg`, { 
                            type: 'image/jpeg' 
                        })
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
                        console.error(`Error procesando imagen ${index + 1}:`, errorMessage)
                        throw error
                    }
                })
            )

            // Crear FormData para enviar a la API
            const formData = new FormData()
            files.forEach((file) => {
                formData.append('images', file)
            })
            if (productId) {
                formData.append('productId', productId.toString())
            }

            console.log(`🔄 Enviando ${files.length} imágenes a la API de subida...`)

            // Llamar a la API de subida
            const response = await fetch('/api/upload-product-images', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                return {
                    success: false,
                    error: createUploadError(
                        ErrorStep.PRODUCT_IMAGES_UPLOAD,
                        `${files.length} imágenes de producto`,
                        result.error || 'Error en la API de subida',
                        productName
                    )
                }
            }

            console.log(`✅ ${result.urls.length} imágenes subidas exitosamente`)
            return {
                success: true,
                data: result.urls
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            console.error('Error uploading multiple product images:', errorMessage)
            
            return {
                success: false,
                error: createNetworkError(ErrorStep.PRODUCT_IMAGES_UPLOAD, errorMessage)
            }
        }
    }

    // Nueva función para subir blobs croppeados directamente
    const uploadCroppedItemImages = async (blobs: Blob[], itemId?: number): Promise<string[]> => {
        try {
            // Crear FormData para enviar a la API
            const formData = new FormData()
            blobs.forEach((blob, index) => {
                const file = new File([blob], `item-cropped-${Date.now()}-${index}.jpg`, { 
                    type: 'image/jpeg' 
                })
                formData.append('images', file)
            })
            if (itemId) {
                formData.append('itemId', itemId.toString())
            }

            console.log(`🔄 Enviando ${blobs.length} imágenes croppeadas de item a la API de subida...`)

            // Llamar a la API de subida
            const response = await fetch('/api/upload-item-images', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Error en la API de subida')
            }

            console.log(`✅ ${result.urls.length} imágenes croppeadas de item subidas exitosamente`)
            return result.urls

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            console.error('Error uploading cropped item images:', errorMessage)
            throw error
        }
    }

    const uploadMultipleItemImages = async (dataUrls: string[], itemId?: number, itemName?: string): Promise<OperationResult<string[]>> => {
        try {
            // Convertir data URLs a archivos
            const files = await Promise.all(
                dataUrls.map(async (dataUrl, index) => {
                    try {
                        const response = await fetch(dataUrl)
                        if (!response.ok) {
                            throw new Error(`Error al procesar imagen ${index + 1}: ${response.statusText}`)
                        }
                        
                        const blob = await response.blob()
                        return new File([blob], `item-image-${Date.now()}-${index}.jpg`, { 
                            type: 'image/jpeg' 
                        })
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
                        console.error(`Error procesando imagen ${index + 1}:`, errorMessage)
                        throw error
                    }
                })
            )

            // Crear FormData para enviar a la API
            const formData = new FormData()
            files.forEach((file) => {
                formData.append('images', file)
            })
            if (itemId) {
                formData.append('itemId', itemId.toString())
            }

            console.log(`🔄 Enviando ${files.length} imágenes de item a la API de subida...`)

            // Llamar a la API de subida
            const response = await fetch('/api/upload-item-images', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                return {
                    success: false,
                    error: createUploadError(
                        ErrorStep.ITEM_IMAGES_UPLOAD,
                        `${files.length} imágenes de item`,
                        result.error || 'Error en la API de subida',
                        itemName
                    )
                }
            }

            console.log(`✅ ${result.urls.length} imágenes de item subidas exitosamente`)
            return {
                success: true,
                data: result.urls
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            console.error('Error uploading multiple item images:', errorMessage)
            
            return {
                success: false,
                error: createNetworkError(ErrorStep.ITEM_IMAGES_UPLOAD, errorMessage)
            }
        }
    }

    const uploadBackgroundImage = async (file: File): Promise<OperationResult<string>> => {
        try {
            console.log(`🔄 Subiendo imagen de fondo...`)

            // Crear FormData para enviar a la API
            const formData = new FormData()
            formData.append('image', file)

            // Llamar a la API de subida
            const response = await fetch('/api/upload-background', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                return {
                    success: false,
                    error: createUploadError(
                        ErrorStep.BACKGROUND_IMAGE_UPLOAD,
                        file.name,
                        result.error || 'Error en la API de subida de fondo'
                    )
                }
            }

            console.log(`✅ Imagen de fondo subida exitosamente`)
            return {
                success: true,
                data: result.url
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            console.error('Error uploading background image:', errorMessage)
            
            return {
                success: false,
                error: createNetworkError(ErrorStep.BACKGROUND_IMAGE_UPLOAD, errorMessage)
            }
        }
    }

    return {
        uploadFileToSupabase,
        uploadMultipleProductImages,
        uploadMultipleItemImages,
        uploadCroppedItemImages,
        uploadBackgroundImage,
        handleFileSelect,
        handleBackgroundFileSelect,
        uploadingImage,
        setUploadingImage
    }
}
