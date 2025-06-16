'use client'

import { useEffect, useRef, useState } from 'react'
import Sortable from 'sortablejs'
import { updateAdminLinks } from '@/app/admin/_actions'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@/lib/supabase-auth'
import { useUser } from '@clerk/nextjs'
import { getFileType, isValidAvatarFile, getFileTypeText, type ProfileImageType } from '@/utils/file-utils'
import { type SocialIcons, type BackgroundSettings, type StyleSettings } from '@/utils/links'
import { SocialIcon } from '@/app/components/SocialIcon'

export function SortableLinksForm({
    links,
    description,
    profileImage,
    profileImageType,
    socialIcons,
    backgroundColor,
    backgroundSettings,
    styleSettings,
}: {
    links: { id: number; url: string; label: string }[]
    description: string
    profileImage: string
    profileImageType: ProfileImageType
    socialIcons: SocialIcons
    backgroundColor: string
    backgroundSettings: BackgroundSettings
    styleSettings: StyleSettings
}) {
    const listRef = useRef<HTMLUListElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const backgroundFileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const { user } = useUser()
    const supabase = useSupabaseClient()
    
    const [status, setStatus] = useState<{ message?: string; error?: string } | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>(profileImage)
    const [previewType, setPreviewType] = useState<ProfileImageType>(profileImageType)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [socialIconColors, setSocialIconColors] = useState({
        instagram: socialIcons.instagram?.color || '#E4405F',
        soundcloud: socialIcons.soundcloud?.color || '#FF5500',
        youtube: socialIcons.youtube?.color || '#FF0000',
        tiktok: socialIcons.tiktok?.color || '#000000',
    })
    const [bgColor, setBgColor] = useState(backgroundColor || '#1a1a1a')
    const [backgroundType, setBackgroundType] = useState<'color' | 'image'>(backgroundSettings.type || 'color')
    const [backgroundImageUrl, setBackgroundImageUrl] = useState(backgroundSettings.imageUrl || '')
    const [backgroundImageOpacity, setBackgroundImageOpacity] = useState(backgroundSettings.imageOpacity || 0.5)
    const [selectedBackgroundFile, setSelectedBackgroundFile] = useState<File | null>(null)
    const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState(backgroundSettings.imageUrl || '')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [linkToDelete, setLinkToDelete] = useState<number | null>(null)
    const [currentLinks, setCurrentLinks] = useState(links)
    const [titleColor, setTitleColor] = useState(styleSettings.titleColor || '#ffffff')
    const [linkCardBackgroundColor, setLinkCardBackgroundColor] = useState(styleSettings.linkCardBackgroundColor || '#ffffff')
    const [linkCardTextColor, setLinkCardTextColor] = useState(styleSettings.linkCardTextColor || '#000000')
    const [showPreviewModal, setShowPreviewModal] = useState(false)

    useEffect(() => {
        if (listRef.current) {
            Sortable.create(listRef.current, {
                animation: 150,
                ghostClass: 'bg-gray-200',
            })
        }
    }, [])

    // Sincronizar currentLinks con los props cuando cambien
    useEffect(() => {
        setCurrentLinks(links)
    }, [links])

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

    // Validar color hex
    const isValidHexColor = (color: string): boolean => {
        return /^#([0-9A-F]{3}){1,2}$/i.test(color)
    }

    // Manejar cambio de color de icono social
    const handleSocialIconColorChange = (platform: string, color: string) => {
        setSocialIconColors(prev => ({
            ...prev,
            [platform]: color
        }))
    }

    // Manejar selección de imagen de fondo
    const handleBackgroundFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            // Validar que sea una imagen
            if (!file.type.startsWith('image/')) {
                setStatus({ error: 'Solo se permiten archivos de imagen para el fondo.' })
                return
            }

            // Validar tamaño (máximo 10MB para fondo)
            if (file.size > 10 * 1024 * 1024) {
                setStatus({ error: 'La imagen de fondo debe ser menor a 10MB.' })
                return
            }

            setSelectedBackgroundFile(file)
            
            // Crear preview del archivo
            const reader = new FileReader()
            reader.onload = (e) => {
                setBackgroundPreviewUrl(e.target?.result as string)
            }
            reader.readAsDataURL(file)
            
            setStatus(null) // Limpiar errores previos
        }
    }

    // Función para agregar un nuevo link
    const addNewLink = () => {
        const newId = Math.max(...currentLinks.map(link => link.id), 0) + 1
        const newLink = {
            id: newId,
            url: '',
            label: ''
        }
        setCurrentLinks([...currentLinks, newLink])
    }

    // Función para eliminar un link
    const removeLink = (id: number) => {
        setLinkToDelete(id)
        setShowDeleteModal(true)
    }

    // Confirmar eliminación
    const confirmDelete = () => {
        if (linkToDelete !== null) {
            setCurrentLinks(currentLinks.filter(link => link.id !== linkToDelete))
            setShowDeleteModal(false)
            setLinkToDelete(null)
        }
    }

    // Cancelar eliminación
    const cancelDelete = () => {
        setShowDeleteModal(false)
        setLinkToDelete(null)
    }

    // Función para actualizar un link específico
    const updateLink = (id: number, field: 'url' | 'label', value: string) => {
        setCurrentLinks(currentLinks.map(link => 
            link.id === id ? { ...link, [field]: value } : link
        ))
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
            
            // Agregar colores de iconos sociales al FormData
            Object.entries(socialIconColors).forEach(([platform, color]) => {
                if (isValidHexColor(color)) {
                    formData.append(`socialIcon_${platform}_color`, color)
                }
            })
            
            // Agregar color de fondo al FormData
            if (isValidHexColor(bgColor)) {
                formData.append('backgroundColor', bgColor)
            }
            
            // Agregar configuración de fondo
            formData.append('backgroundType', backgroundType)
            formData.append('backgroundImageOpacity', backgroundImageOpacity.toString())
            
            // Si hay una nueva imagen de fondo seleccionada, subirla
            let newBackgroundImageUrl = backgroundImageUrl
            if (selectedBackgroundFile && backgroundType === 'image') {
                setStatus({ message: 'Subiendo imagen de fondo...' })
                const uploadedUrl = await uploadFileToSupabase(selectedBackgroundFile)
                if (uploadedUrl) {
                    newBackgroundImageUrl = uploadedUrl
                    formData.append('backgroundImageUrl', uploadedUrl)
                }
            } else if (backgroundType === 'image' && backgroundImageUrl) {
                formData.append('backgroundImageUrl', backgroundImageUrl)
            }
            
            // Agregar configuración de estilos
            if (isValidHexColor(titleColor)) {
                formData.append('titleColor', titleColor)
            }
            if (isValidHexColor(linkCardBackgroundColor)) {
                formData.append('linkCardBackgroundColor', linkCardBackgroundColor)
            }
            if (isValidHexColor(linkCardTextColor)) {
                formData.append('linkCardTextColor', linkCardTextColor)
            }
            
            setStatus({ message: 'Guardando cambios...' })
            
            const result = await updateAdminLinks(formData)
            if (result.success) {
                setStatus({ message: result.message || 'Cambios guardados con éxito' })
                setSelectedFile(null) // Limpiar archivo seleccionado
                setSelectedBackgroundFile(null) // Limpiar archivo de fondo seleccionado
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
                className="text-4xl font-display tracking-wide mb-2"
                style={{ 
                    fontFamily: 'Space Grotesk, sans-serif',
                    color: titleColor 
                }}
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

            {/* Configuración de colores de iconos sociales */}
            <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6 border border-white/20">
                <h3 className="text-xl font-semibold text-[var(--color-secondary)] mb-4 text-center">
                    Colores de Iconos Sociales
                </h3>
                <div className="space-y-4">
                    {Object.entries(socialIconColors).map(([platform, color]) => (
                        <div key={platform} className="flex items-center space-x-3">
                            <label className="flex-1 text-sm font-medium text-white capitalize min-w-[80px]">
                                {platform}:
                            </label>
                            <div className="flex items-center space-x-2">
                                {/* Vista previa del color */}
                                <div 
                                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                                    style={{ backgroundColor: isValidHexColor(color) ? color : '#000000' }}
                                />
                                {/* Input de color hex */}
                                <input
                                    type="text"
                                    value={color}
                                    onChange={(e) => handleSocialIconColorChange(platform, e.target.value)}
                                    placeholder="#000000"
                                    maxLength={7}
                                    className={`w-24 p-2 text-sm border rounded-md focus:outline-none focus:ring-2 text-black ${
                                        isValidHexColor(color) 
                                            ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                                            : 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                                    }`}
                                />
                                {/* Input de color nativo como respaldo */}
                                <input
                                    type="color"
                                    value={isValidHexColor(color) ? color : '#000000'}
                                    onChange={(e) => handleSocialIconColorChange(platform, e.target.value)}
                                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer flex-shrink-0"
                                    title={`Seleccionar color para ${platform}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 p-3 bg-blue-500/10 rounded-md border border-blue-500/20">
                    <p className="text-xs text-blue-200 text-center">
                        💡 Usa formato hex (#000000) o selecciona con el selector de color
                    </p>
                </div>
            </div>

            {/* Configuración de fondo de pantalla */}
            <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6 border border-white/20">
                <h3 className="text-xl font-semibold text-[var(--color-secondary)] mb-4 text-center">
                    Fondo de Pantalla
                </h3>
                
                {/* Selector de tipo de fondo */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">
                        Tipo de fondo:
                    </label>
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="color"
                                checked={backgroundType === 'color'}
                                onChange={(e) => setBackgroundType(e.target.value as 'color' | 'image')}
                                className="mr-2"
                            />
                            <span className="text-white">Color sólido</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="image"
                                checked={backgroundType === 'image'}
                                onChange={(e) => setBackgroundType(e.target.value as 'color' | 'image')}
                                className="mr-2"
                            />
                            <span className="text-white">Imagen</span>
                        </label>
                    </div>
                </div>

                {/* Configuración de color */}
                {backgroundType === 'color' && (
                    <div className="flex items-center justify-center space-x-3">
                        <label className="text-sm font-medium text-white">
                            Color:
                        </label>
                        <div className="flex items-center space-x-2">
                            <div 
                                className="w-12 h-12 rounded-lg border-2 border-white shadow-sm"
                                style={{ backgroundColor: bgColor }}
                            />
                            <input
                                type="text"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                placeholder="#1a1a1a"
                                maxLength={7}
                                className={`w-28 p-2 text-sm border rounded-md focus:outline-none focus:ring-2 text-black ${
                                    isValidHexColor(bgColor) 
                                        ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                                        : 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                }`}
                            />
                            <input
                                type="color"
                                value={isValidHexColor(bgColor) ? bgColor : '#1a1a1a'}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                                title="Seleccionar color de fondo"
                            />
                        </div>
                    </div>
                )}

                {/* Configuración de imagen */}
                {backgroundType === 'image' && (
                    <div className="space-y-4">
                        {/* Subir imagen */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Imagen de fondo:
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBackgroundFileSelect}
                                    className="text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                                />
                                {backgroundPreviewUrl && (
                                    <div 
                                        className="w-12 h-12 rounded border-2 border-white bg-cover bg-center"
                                        style={{ backgroundImage: `url(${backgroundPreviewUrl})` }}
                                        title="Vista previa de la imagen"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Control de opacidad */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Opacidad: {Math.round(backgroundImageOpacity * 100)}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={backgroundImageOpacity}
                                onChange={(e) => setBackgroundImageOpacity(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                )}

                <div className="mt-4 p-3 bg-purple-500/10 rounded-md border border-purple-500/20">
                    <p className="text-xs text-purple-200 text-center">
                        🎨 {backgroundType === 'color' 
                            ? 'Este color se aplicará como fondo de la página pública' 
                            : 'La imagen se aplicará como fondo con la opacidad seleccionada'}
                    </p>
                </div>
            </div>

            {/* Configuración de colores de elementos */}
            <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6 border border-white/20">
                <h3 className="text-xl font-semibold text-[var(--color-secondary)] mb-4 text-center">
                    Colores de Elementos
                </h3>
                <div className="space-y-4">
                    {/* Color del título */}
                    <div className="flex items-center space-x-3">
                        <label className="flex-1 text-sm font-medium text-white min-w-[120px]">
                            Título principal:
                        </label>
                        <div className="flex items-center space-x-2">
                            <div 
                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                                style={{ backgroundColor: isValidHexColor(titleColor) ? titleColor : '#ffffff' }}
                            />
                            <input
                                type="text"
                                value={titleColor}
                                onChange={(e) => setTitleColor(e.target.value)}
                                placeholder="#ffffff"
                                maxLength={7}
                                className={`w-24 p-2 text-sm border rounded-md focus:outline-none focus:ring-2 text-black ${
                                    isValidHexColor(titleColor) 
                                        ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                                        : 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                                }`}
                            />
                            <input
                                type="color"
                                value={isValidHexColor(titleColor) ? titleColor : '#ffffff'}
                                onChange={(e) => setTitleColor(e.target.value)}
                                className="w-8 h-8 border border-gray-300 rounded cursor-pointer flex-shrink-0"
                                title="Seleccionar color del título"
                            />
                        </div>
                    </div>

                    {/* Color de fondo de tarjetas */}
                    <div className="flex items-center space-x-3">
                        <label className="flex-1 text-sm font-medium text-white min-w-[120px]">
                            Fondo de tarjetas:
                        </label>
                        <div className="flex items-center space-x-2">
                            <div 
                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                                style={{ backgroundColor: isValidHexColor(linkCardBackgroundColor) ? linkCardBackgroundColor : '#ffffff' }}
                            />
                            <input
                                type="text"
                                value={linkCardBackgroundColor}
                                onChange={(e) => setLinkCardBackgroundColor(e.target.value)}
                                placeholder="#ffffff"
                                maxLength={7}
                                className={`w-24 p-2 text-sm border rounded-md focus:outline-none focus:ring-2 text-black ${
                                    isValidHexColor(linkCardBackgroundColor) 
                                        ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                                        : 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                                }`}
                            />
                            <input
                                type="color"
                                value={isValidHexColor(linkCardBackgroundColor) ? linkCardBackgroundColor : '#ffffff'}
                                onChange={(e) => setLinkCardBackgroundColor(e.target.value)}
                                className="w-8 h-8 border border-gray-300 rounded cursor-pointer flex-shrink-0"
                                title="Seleccionar color de fondo de tarjetas"
                            />
                        </div>
                    </div>

                    {/* Color de texto de tarjetas */}
                    <div className="flex items-center space-x-3">
                        <label className="flex-1 text-sm font-medium text-white min-w-[120px]">
                            Texto de tarjetas:
                        </label>
                        <div className="flex items-center space-x-2">
                            <div 
                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                                style={{ backgroundColor: isValidHexColor(linkCardTextColor) ? linkCardTextColor : '#000000' }}
                            />
                            <input
                                type="text"
                                value={linkCardTextColor}
                                onChange={(e) => setLinkCardTextColor(e.target.value)}
                                placeholder="#000000"
                                maxLength={7}
                                className={`w-24 p-2 text-sm border rounded-md focus:outline-none focus:ring-2 text-black ${
                                    isValidHexColor(linkCardTextColor) 
                                        ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                                        : 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                                }`}
                            />
                            <input
                                type="color"
                                value={isValidHexColor(linkCardTextColor) ? linkCardTextColor : '#000000'}
                                onChange={(e) => setLinkCardTextColor(e.target.value)}
                                className="w-8 h-8 border border-gray-300 rounded cursor-pointer flex-shrink-0"
                                title="Seleccionar color de texto de tarjetas"
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-orange-500/10 rounded-md border border-orange-500/20">
                    <p className="text-xs text-orange-200 text-center">
                        🎨 Personaliza los colores del título y las tarjetas de links
                    </p>
                </div>
            </div>

            {/* Lista de links como tarjetas editables */}
            <div className="w-full max-w-md">
                {/* Botón para agregar nuevo link */}
                <div className="mb-4 flex justify-center">
                    <button
                        type="button"
                        onClick={addNewLink}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Agregar Link</span>
                    </button>
                </div>

                <ul ref={listRef} className="space-y-4">
                    {currentLinks.map((link, index) => (
                        <li key={link.id} className="relative p-4 rounded-lg shadow-md" style={{
                            backgroundColor: linkCardBackgroundColor,
                            color: linkCardTextColor
                        }}>
                            {/* Botón de eliminar */}
                            <button
                                type="button"
                                onClick={() => removeLink(link.id)}
                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                                title="Eliminar link"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <input
                                type="hidden"
                                name="id"
                                value={link.id}
                                readOnly
                            />
                            <input
                                type="text"
                                name="url"
                                value={link.url}
                                onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                                placeholder="URL"
                                className="w-full p-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                                type="text"
                                name="label"
                                value={link.label}
                                onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                                placeholder="Texto visible (ej: TikTok)"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </li>
                    ))}
                </ul>
            </div>

            {/* Mensaje de estado */}
            {status && (
                <div className={`w-full max-w-md p-3 rounded-md text-center ${
                    status.message ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {status.message || status.error}
                </div>
            )}

            {/* Botones de acción */}
            <div className="flex space-x-4">
                {/* Botón de vista previa */}
                <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="px-6 py-3 text-blue-600 bg-white rounded-md shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    👁️ Vista Previa
                </button>

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
            </div>

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

            {/* Modal de confirmación de eliminación */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            ¿Eliminar link?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            ¿Estás seguro que quieres eliminar este link? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex space-x-3 justify-end">
                            <button
                                type="button"
                                onClick={cancelDelete}
                                className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de vista previa */}
            {showPreviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-neutral-900 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
                        {/* Botón de cerrar */}
                        <button
                            onClick={() => setShowPreviewModal(false)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Título del modal */}
                        <h2 className="text-white text-2xl font-semibold mb-6 pr-8">Vista Previa</h2>

                        {/* Vista previa simulando la página pública */}
                        <div 
                            className="rounded-lg overflow-hidden"
                            style={backgroundType === 'image' ? {
                                backgroundImage: `url(${backgroundPreviewUrl || backgroundImageUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                position: "relative",
                            } : {
                                backgroundColor: bgColor,
                            }}
                        >
                            {/* Overlay de opacidad para imagen de fondo */}
                            {backgroundType === 'image' && (
                                <div 
                                    className="absolute inset-0 bg-black"
                                    style={{ 
                                        opacity: 1 - backgroundImageOpacity,
                                        zIndex: 0
                                    }}
                                />
                            )}

                            <div className={`relative ${backgroundType === 'image' ? 'z-10' : ''} flex flex-col items-center p-8`}>
                                {/* Avatar */}
                                <div className="relative mb-6">
                                    {previewType === 'video' ? (
                                        <video 
                                            src={previewUrl}
                                            className="w-32 h-32 rounded-full border-4 border-[var(--color-accent-organic)] shadow-lg object-cover"
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                        />
                                    ) : (
                                        <img
                                            src={previewUrl}
                                            alt="Avatar"
                                            className="w-32 h-32 rounded-full border-4 border-[var(--color-accent-organic)] shadow-lg object-cover"
                                        />
                                    )}
                                </div>

                                {/* Título */}
                                <h1
                                    className="text-4xl font-display tracking-wide mb-4"
                                    style={{ 
                                        fontFamily: 'Space Grotesk, sans-serif',
                                        color: titleColor 
                                    }}
                                >
                                    biomechanics.wav
                                </h1>

                                {/* Descripción */}
                                <p className="text-center text-lg mb-6 text-white">
                                    {description}
                                </p>

                                {/* Iconos sociales */}
                                <div className="flex gap-6 mb-8">
                                    {Object.entries(socialIconColors).map(([platform, color]) => (
                                        <div key={platform} className="w-8 h-8">
                                            <SocialIcon 
                                                icon={platform as any}
                                                url={socialIcons[platform as keyof typeof socialIcons]?.url || '#'}
                                                color={color}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Links */}
                                <div className="w-full max-w-md space-y-4">
                                    {currentLinks.map((link) => (
                                        <div
                                            key={link.id}
                                            className="p-4 rounded-lg shadow-md hover:opacity-80 transition-opacity cursor-pointer"
                                            style={{
                                                backgroundColor: linkCardBackgroundColor,
                                                color: linkCardTextColor
                                            }}
                                        >
                                            {link.label || link.url}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Pie del modal */}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Cerrar Vista Previa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    )
}
