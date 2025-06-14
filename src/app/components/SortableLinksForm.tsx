'use client'

import { useEffect, useRef, useState } from 'react'
import Sortable from 'sortablejs'
import { updateAdminLinks } from '@/app/admin/_actions'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@/lib/supabase-auth'
import { useUser } from '@clerk/nextjs'
import { getFileType, isValidAvatarFile, getFileTypeText, type ProfileImageType } from '@/utils/file-utils'

export function SortableLinksForm({
    links,
    description,
    profileImage,
    profileImageType,
}: {
    links: { id: number; url: string; label: string }[]
    description: string
    profileImage: string
    profileImageType: ProfileImageType
}) {
    const listRef = useRef<HTMLUListElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const { user } = useUser()
    const supabase = useSupabaseClient()
    
    const [status, setStatus] = useState<{ message?: string; error?: string } | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>(profileImage)
    const [previewType, setPreviewType] = useState<ProfileImageType>(profileImageType)
    const [uploadingImage, setUploadingImage] = useState(false)

    useEffect(() => {
        if (listRef.current) {
            Sortable.create(listRef.current, {
                animation: 150,
                ghostClass: 'bg-gray-200',
            })
        }
    }, [])

    // Manejar selección de archivo
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            // Validar archivo
            if (!isValidAvatarFile(file)) {
                setStatus({ error: 'Archivo no válido. Formatos soportados: JPG, PNG, WebP, GIF, MP4, WebM. Máximo 50MB.' })
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
            
            setStatus(null) // Limpiar errores previos
        }
    }

    // Subir archivo a Supabase
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

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        setStatus(null)
        
        try {
            // Si hay un nuevo archivo seleccionado, subirlo primero
            let newFileUrl = null
            let newFileType = previewType
            
            if (selectedFile) {
                setUploadingImage(true)
                setStatus({ message: `Subiendo ${previewType}...` })
                
                newFileUrl = await uploadFileToSupabase(selectedFile)
                if (newFileUrl) {
                    formData.append('newProfileImage', newFileUrl)
                    formData.append('newProfileImageType', newFileType)
                }
                
                setUploadingImage(false)
            }
            
            setStatus({ message: 'Guardando cambios...' })
            
            const result = await updateAdminLinks(formData)
            if (result.success) {
                setStatus({ message: result.message || 'Cambios guardados con éxito' })
                setSelectedFile(null) // Limpiar archivo seleccionado
                router.refresh()
            } else {
                setStatus({ error: result.error || 'Error al guardar los cambios' })
            }
        } catch (error) {
            console.error('Error en handleSubmit:', error)
            setStatus({ error: 'Error al procesar la solicitud' })
        } finally {
            setIsSubmitting(false)
            setUploadingImage(false)
        }
    }

    // Componente para renderizar el avatar según su tipo
    const renderAvatar = () => {
        const commonClasses = "w-32 h-32 rounded-full border-4 border-[var(--color-accent-organic)] mb-4 shadow-lg object-cover"
        
        if (previewType === 'video') {
            return (
                <video 
                    src={previewUrl}
                    className={commonClasses}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
            )
        } else {
            // Para 'image' y 'gif'
            return (
                <img
                    src={previewUrl}
                    alt="Avatar"
                    className={commonClasses}
                />
            )
        }
    }

    return (
        <form
            action={handleSubmit}
            method="POST"
            className="flex flex-col items-center min-h-screen px-4 py-10 space-y-6 text-[var(--color-neutral-light)] font-body"
            style={{
                backgroundImage: "url('/bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "var(--color-neutral-base)",
            }}
        >
            {/* Avatar con funcionalidad de cambio */}
            <div className="relative group">
                {renderAvatar()}
                
                {/* Overlay para cambiar archivo */}
                <div 
                    className="absolute inset-0 w-32 h-32 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <span className="text-white text-sm font-medium text-center">
                        {selectedFile ? 'Cambiar' : 'Editar'}
                        <br />
                        <span className="text-xs">
                            {getFileTypeText(previewType)}
                        </span>
                    </span>
                </div>
                
                {/* Input de archivo oculto - ahora acepta más tipos */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/mp4,video/webm,video/quicktime"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                
                {/* Indicador de cambio pendiente */}
                {selectedFile && (
                    <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                        {getFileTypeText(previewType)}
                    </div>
                )}
                
                {/* Indicador del tipo actual */}
                {!selectedFile && previewType !== 'image' && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {getFileTypeText(previewType)}
                    </div>
                )}
            </div>

            {/* Información del archivo seleccionado */}
            {selectedFile && (
                <div className="w-full max-w-md p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                    <p><strong>Nuevo {getFileTypeText(previewType).toLowerCase()}:</strong> {selectedFile.name}</p>
                    <p><strong>Tamaño:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>Tipo:</strong> {selectedFile.type}</p>
                    <p className="text-xs mt-1">
                        El {getFileTypeText(previewType).toLowerCase()} se guardará al presionar "Guardar Cambios"
                    </p>
                </div>
            )}

            {/* Nombre */}
            <h1
                className="text-[var(--color-secondary)] text-4xl font-display tracking-wide mb-2"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
                biomechanics.wav
            </h1>

            {/* Descripción editable */}
            <textarea
                name="description"
                defaultValue={description}
                maxLength={300}
                placeholder="Escribe una descripción (máximo 300 caracteres)"
                className="w-full max-w-2xl p-3 text-center text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-6"
            />

            {/* Lista de links como tarjetas editables */}
            <ul ref={listRef} className="w-full max-w-md space-y-4">
                {links.map((link, index) => (
                    <li key={link.id} className="p-4 bg-[var(--color-neutral-light)] text-[var(--color-neutral-base)] rounded-lg shadow-md">
                        <input
                            type="hidden"
                            name="id"
                            defaultValue={link.id}
                        />
                        <input
                            type="text"
                            name="url"
                            defaultValue={link.url}
                            placeholder="URL"
                            className="w-full p-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                            type="text"
                            name="label"
                            defaultValue={link.label}
                            placeholder="Texto visible (ej: TikTok)"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </li>
                ))}
            </ul>

            {/* Mensaje de estado */}
            {status && (
                <div className={`w-full max-w-md p-3 rounded-md text-center ${
                    status.message ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {status.message || status.error}
                </div>
            )}

            {/* Botón para guardar cambios */}
            <button
                type="submit"
                disabled={isSubmitting || uploadingImage}
                className={`px-6 py-3 text-white rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isSubmitting || uploadingImage 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                {uploadingImage 
                    ? `Subiendo ${getFileTypeText(previewType).toLowerCase()}...` 
                    : isSubmitting 
                        ? 'Guardando...' 
                        : 'Guardar Cambios'
                }
            </button>

            {/* Información adicional */}
            <div className="text-sm text-gray-400 max-w-md text-center">
                {selectedFile && (
                    <p>Se subirá un nuevo {getFileTypeText(previewType).toLowerCase()} al guardar los cambios.</p>
                )}
                <p>Formatos soportados: JPG, PNG, WebP, GIF, MP4, WebM. Tamaño máximo: 50MB</p>
                <p className="mt-1 text-xs">
                    Los videos se reproducen automáticamente en bucle y sin sonido.
                </p>
            </div>
        </form>
    )
}
