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

    return {
        uploadFileToSupabase,
        handleFileSelect,
        handleBackgroundFileSelect,
        uploadingImage,
        setUploadingImage
    }
}
