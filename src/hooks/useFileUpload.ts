import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { getFileType, isValidAvatarFile, type ProfileImageType } from '@/utils/file-utils'

interface UseFileUploadProps {
    onStatusChange: (status: { message?: string; error?: string } | null) => void
}

export function useFileUpload({ onStatusChange }: UseFileUploadProps) {
    const { user } = useUser()
    const [uploadingImage, setUploadingImage] = useState(false)

    const uploadFileToSupabase = async (file: File): Promise<string | null> => {
        try {
            if (!user) {
                throw new Error('Usuario no autenticado')
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
                throw new Error(errorData.error || `Error HTTP: ${response.status}`)
            }

            const result = await response.json()
            
            if (result.success) {
                console.log('✅ Archivo de perfil subido exitosamente:', result.url)
                return result.url
            } else {
                throw new Error(result.error || 'Error desconocido de la API')
            }

        } catch (error) {
            console.error('💥 Error en uploadFileToSupabase:', error)
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            throw new Error(errorMessage)
        }
    }

    const handleFileSelect = (
        file: File,
        setSelectedFile: (file: File | null) => void,
        setPreviewUrl: (url: string) => void,
        setPreviewType: (type: ProfileImageType) => void
    ) => {
        // Validar archivo
        if (!isValidAvatarFile(file)) {
            onStatusChange({ error: 'Archivo no válido. Formatos soportados: JPG, PNG, WebP, GIF, MP4, WebM. Máximo 50MB.' })
            return
        }

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

    const uploadMultipleProductImages = async (dataUrls: string[], productId?: number): Promise<string[]> => {
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
                throw new Error(result.error || 'Error en la API de subida')
            }

            console.log(`✅ ${result.urls.length} imágenes subidas exitosamente`)
            return result.urls

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            console.error('Error uploading multiple product images:', errorMessage)
            throw error
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

    const uploadMultipleItemImages = async (dataUrls: string[], itemId?: number): Promise<string[]> => {
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
                throw new Error(result.error || 'Error en la API de subida')
            }

            console.log(`✅ ${result.urls.length} imágenes de item subidas exitosamente`)
            return result.urls

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            console.error('Error uploading multiple item images:', errorMessage)
            throw error
        }
    }

    const uploadBackgroundImage = async (file: File): Promise<string> => {
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
                throw new Error(result.error || 'Error en la API de subida de fondo')
            }

            console.log(`✅ Imagen de fondo subida exitosamente`)
            return result.url

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            console.error('Error uploading background image:', errorMessage)
            throw error
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
