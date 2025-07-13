import { useState } from 'react'
import { useSupabaseClient } from '@/lib/supabase-auth'
import { useUser } from '@clerk/nextjs'
import { getFileType, isValidAvatarFile, type ProfileImageType } from '@/utils/file-utils'

interface UseFileUploadProps {
    onStatusChange: (status: { message?: string; error?: string } | null) => void
}

export function useFileUpload({ onStatusChange }: UseFileUploadProps) {
    const { user } = useUser()
    const supabase = useSupabaseClient()
    const [uploadingImage, setUploadingImage] = useState(false)

    const uploadFileToSupabase = async (file: File): Promise<string | null> => {
        try {
            if (!user) {
                throw new Error('Usuario no autenticado')
            }

            const fileExt = file.name.split('.').pop()
            const fileType = getFileType(file)
            const fileName = `${fileType}-${Date.now()}.${fileExt}`
            
            console.log(`🔄 Subiendo ${fileType}:`, fileName)
            
            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: file.type
                })

            if (error) {
                console.error(`❌ Error subiendo ${fileType}:`, error)
                throw error
            }

            // Obtener URL pública
            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            console.log(`✅ ${fileType} subido exitosamente:`, publicUrlData.publicUrl)
            return publicUrlData.publicUrl

        } catch (error) {
            console.error('💥 Error en uploadFileToSupabase:', error)
            throw error
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

        // Validar tamaño (máximo 10MB para fondo)
        if (file.size > 10 * 1024 * 1024) {
            onStatusChange({ error: 'La imagen de fondo debe ser menor a 10MB.' })
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

    return {
        uploadFileToSupabase,
        uploadMultipleProductImages,
        handleFileSelect,
        handleBackgroundFileSelect,
        uploadingImage,
        setUploadingImage
    }
}
