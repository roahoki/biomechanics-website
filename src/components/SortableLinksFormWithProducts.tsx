'use client'

import { useEffect, useState } from 'react'
import { updateAdminLinksWithProducts } from '@/app/admin/_actions'
import { useRouter } from 'next/navigation'
import { type ProfileImageType } from '@/utils/file-utils'
import { type SocialIcons, type BackgroundSettings, type StyleSettings } from '@/utils/links'
import { LinkItem } from '@/types/product'

// Hooks
import { useFileUpload } from '@/hooks/useFileUpload'
import { useLinksManagement } from '@/hooks/useLinksManagement'
import { useColorConfig } from '@/hooks/useColorConfig'
import { useFormState } from '@/hooks/useFormState'

// Componentes
import { AvatarUpload } from '@/components/AvatarUpload'
import { FileInfo } from '@/components/FileInfo'
import { SocialIconsConfig } from '@/components/SocialIconsConfig'
import { BackgroundConfig } from '@/components/BackgroundConfig'
import { StyleConfig } from '@/components/StyleConfig'
import { LinksListUpdated } from '@/components/SortableLinksForm/LinksListUpdated'
import { DeleteModal } from '@/components/SortableLinksForm/DeleteModal'
import { ActionButtons } from '@/components/SortableLinksForm/ActionButtons'
import { PreviewModalUpdated } from '@/components/SortableLinksForm/PreviewModalUpdated'

export function SortableLinksFormWithProducts({
    links,
    description,
    profileImage,
    profileImageType,
    socialIcons,
    backgroundColor,
    backgroundSettings,
    styleSettings
}: {
    links: any[]
    description: string
    profileImage: string
    profileImageType: ProfileImageType
    socialIcons: SocialIcons
    backgroundColor: string
    backgroundSettings: BackgroundSettings
    styleSettings: StyleSettings
}) {
    const router = useRouter()
    
    // Convertir links legacy a LinkItem
    const convertedLinks: LinkItem[] = links.map(link => ({
        ...link,
        type: link.type || 'link',
        visible: link.visible !== undefined ? link.visible : true
    }))

    // Estado del formulario
    const {
        status,
        setStatus,
        isSubmitting,
        setIsSubmitting,
        selectedFile,
        setSelectedFile,
        previewUrl,
        setPreviewUrl,
        previewType,
        setPreviewType,
        selectedBackgroundFile,
        setSelectedBackgroundFile,
        backgroundPreviewUrl,
        setBackgroundPreviewUrl,
        showPreviewModal,
        setShowPreviewModal
    } = useFormState()

    // File upload
    const { 
        handleFileSelect,
        uploadFileToSupabase,
        uploadMultipleProductImages,
        uploadMultipleItemImages,
        uploadBackgroundImage 
    } = useFileUpload({
        onStatusChange: setStatus
    })

    // Inicializar estados con valores por defecto
    useEffect(() => {
        setPreviewUrl(profileImage)
        setPreviewType(profileImageType)
        setBackgroundPreviewUrl(backgroundSettings.imageUrl || '')
    }, [profileImage, profileImageType, backgroundSettings.imageUrl, setPreviewUrl, setPreviewType, setBackgroundPreviewUrl])

    // Configuración de colores
    const {
        socialIconColors,
        setSocialIconColors,
        bgColor,
        setBgColor,
        titleColor,
        setTitleColor,
        linkCardBackgroundColor,
        setLinkCardBackgroundColor,
        linkCardTextColor,
        setLinkCardTextColor,
        productBuyButtonColor,
        setProductBuyButtonColor,
        itemButtonColor,
        setItemButtonColor,
        isValidHexColor,
        handleSocialIconColorChange
    } = useColorConfig({
        initialSocialIconColors: {
            instagram: socialIcons.instagram?.color || '#E4405F',
            soundcloud: socialIcons.soundcloud?.color || '#FF5500',
            youtube: socialIcons.youtube?.color || '#FF0000',
            tiktok: socialIcons.tiktok?.color || '#000000'
        },
        initialBgColor: backgroundColor,
        initialTitleColor: styleSettings.titleColor || '#ffffff',
        initialLinkCardBackgroundColor: styleSettings.linkCardBackgroundColor || '#ffffff',
        initialLinkCardTextColor: styleSettings.linkCardTextColor || '#000000',
        initialProductBuyButtonColor: styleSettings.productBuyButtonColor || '#ff6b35',
        initialItemButtonColor: styleSettings.itemButtonColor || '#3b82f6'
    })

    // Estados adicionales para el fondo
    const [backgroundType, setBackgroundType] = useState<'color' | 'image'>(backgroundSettings.type || 'color')
    const [backgroundImageUrl, setBackgroundImageUrl] = useState(backgroundSettings.imageUrl || '')
    const [backgroundImageOpacity, setBackgroundImageOpacity] = useState(backgroundSettings.imageOpacity || 0.5)

    // Gestión de links y productos
    const {
        currentLinks,
        setCurrentLinks,
        addNewLink,
        addNewProduct,
        addNewItem,
        removeLink,
        confirmDelete,
        cancelDelete,
        updateLink,
        updateProduct,
        updateItem,
        reorderLinks,
        toggleVisibility,
        showDeleteModal
    } = useLinksManagement(convertedLinks)

    // Sincronizar currentLinks con los props cuando cambien
    useEffect(() => {
        setCurrentLinks(convertedLinks)
    }, [links])

    // Descripción local
    const [localDescription, setLocalDescription] = useState(description)

    // Manejadores de archivo
    const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            handleFileSelect(file, setSelectedFile, setPreviewUrl, setPreviewType)
        }
    }

    const onBackgroundFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            handleFileSelect(file, setSelectedBackgroundFile, setBackgroundPreviewUrl, () => {})
        }
    }

    // Función para manejar el envío del formulario
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSubmitting(true)
        setStatus({ message: 'Guardando cambios...' })

        try {
            // 1. Subir imagen de perfil si es necesaria
            let finalProfileImage = previewUrl
            let finalProfileImageType = previewType

            if (selectedFile) {
                setStatus({ message: 'Subiendo imagen de perfil...' })
                try {
                    console.log('🔄 Intentando subir imagen de perfil...')
                    const uploadedUrl = await uploadFileToSupabase(selectedFile)
                    if (uploadedUrl) {
                        finalProfileImage = uploadedUrl
                        finalProfileImageType = previewType
                        console.log('✅ Imagen de perfil subida:', uploadedUrl)
                    } else {
                        console.warn('⚠️ La subida devolvió null')
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
                    console.error('❌ Error subiendo imagen de perfil:', error)
                    console.error('❌ Mensaje del error:', errorMessage)
                    // No fallar todo el proceso por la imagen de perfil
                    console.log('⚠️ Continuando sin imagen de perfil nueva...')
                }
            }

            // 2. Subir imagen de fondo si es necesaria
            let finalBackgroundImageUrl = backgroundImageUrl

            if (selectedBackgroundFile) {
                setStatus({ message: 'Subiendo imagen de fondo...' })
                try {
                    console.log('🔄 Intentando subir imagen de fondo...')
                    const uploadedUrl = await uploadBackgroundImage(selectedBackgroundFile)
                    finalBackgroundImageUrl = uploadedUrl
                    console.log('✅ Imagen de fondo subida:', uploadedUrl)
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
                    console.error('❌ Error subiendo imagen de fondo:', error)
                    // No fallar todo el proceso por la imagen de fondo
                    console.log('⚠️ Continuando sin imagen de fondo nueva...')
                }
            }

            // 3. Procesar productos e items para subir imágenes a Supabase
            console.log('🔄 Procesando productos e items...')
            const processedLinks = await Promise.all(
                currentLinks.map(async (item) => {
                    console.log(`📝 Procesando item tipo: ${item.type}, ID: ${item.id}`)
                    
                    // Procesar productos
                    if (item.type === 'product' && item.images.length > 0) {
                        const dataUrls = item.images.filter(img => img.startsWith('data:'))
                        const publicUrls = item.images.filter(img => !img.startsWith('data:'))
                        
                        console.log(`📦 Producto "${item.title}": ${dataUrls.length} nuevas imágenes, ${publicUrls.length} existentes`)
                        
                        if (dataUrls.length > 0) {
                            setStatus({ message: `Subiendo imágenes del producto "${item.title}"...` })
                            try {
                                const uploadedUrls = await uploadMultipleProductImages(dataUrls, item.id)
                                console.log(`✅ Producto "${item.title}": ${uploadedUrls.length} imágenes subidas`)
                                return {
                                    ...item,
                                    images: [...publicUrls, ...uploadedUrls]
                                }
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
                                console.error(`❌ Error subiendo imágenes del producto "${item.title}":`, error)
                                throw new Error(`Error subiendo imágenes del producto "${item.title}": ${errorMessage}`)
                            }
                        }
                    }
                    // Procesar items
                    else if (item.type === 'item' && item.images.length > 0) {
                        const dataUrls = item.images.filter(img => img.startsWith('data:'))
                        const publicUrls = item.images.filter(img => !img.startsWith('data:'))
                        
                        console.log(`🎯 Item "${item.title}": ${dataUrls.length} nuevas imágenes, ${publicUrls.length} existentes`)
                        
                        if (dataUrls.length > 0) {
                            setStatus({ message: `Subiendo imágenes del item "${item.title}"...` })
                            try {
                                const uploadedUrls = await uploadMultipleItemImages(dataUrls, item.id)
                                console.log(`✅ Item "${item.title}": ${uploadedUrls.length} imágenes subidas`)
                                return {
                                    ...item,
                                    images: [...publicUrls, ...uploadedUrls]
                                }
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
                                console.error(`❌ Error subiendo imágenes del item "${item.title}":`, error)
                                throw new Error(`Error subiendo imágenes del item "${item.title}": ${errorMessage}`)
                            }
                        }
                    }
                    return item
                })
            )

            setStatus({ message: 'Guardando configuración...' })

            // Preparar datos actualizados con las URLs finales
            const updatedData = {
                description: localDescription,
                profileImage: finalProfileImage,
                profileImageType: finalProfileImageType,
                socialIcons: {
                    instagram: { url: socialIcons.instagram?.url, color: socialIconColors.instagram },
                    soundcloud: { url: socialIcons.soundcloud?.url, color: socialIconColors.soundcloud },
                    youtube: { url: socialIcons.youtube?.url, color: socialIconColors.youtube },
                    tiktok: { url: socialIcons.tiktok?.url, color: socialIconColors.tiktok }
                },
                backgroundColor: bgColor,
                backgroundSettings: {
                    type: backgroundType,
                    color: bgColor,
                    imageUrl: finalBackgroundImageUrl,
                    imageOpacity: backgroundImageOpacity
                },
                styleSettings: {
                    titleColor,
                    linkCardBackgroundColor,
                    linkCardTextColor,
                    productBuyButtonColor,
                    itemButtonColor
                }
            }

            // Llamar a la nueva función que soporta productos
            const result = await updateAdminLinksWithProducts(processedLinks, updatedData)

            if (result.success) {
                setStatus({ message: result.message })
                
                // Limpiar archivos seleccionados después del éxito
                setSelectedFile(null)
                setSelectedBackgroundFile(null)
                
                // Opcionalmente recargar la página o navegar
                setTimeout(() => {
                    router.refresh()
                }, 1000)
            } else {
                setStatus({ error: result.error || 'Error desconocido' })
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar los cambios'
            setStatus({ error: errorMessage })
            console.error('Error en handleSubmit:', {
                error: error,
                message: errorMessage,
                stack: error instanceof Error ? error.stack : undefined
            })
        } finally {
            setIsSubmitting(false)
            setTimeout(() => setStatus(null), 5000)
        }
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700">
                    {/* Header */}
                    <div className="border-b border-gray-700 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">
                            Administrar Enlaces y Productos
                        </h1>
                        <p className="text-gray-300 mt-1">
                            Gestiona tu página de enlaces y productos
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {/* Primera columna: Perfil y descripción */}
                            <div className="space-y-6 md:col-span-1 lg:col-span-1">
                                {/* Avatar Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-3">
                                        Foto/Video de Perfil
                                    </label>
                                    <AvatarUpload
                                        previewUrl={previewUrl}
                                        previewType={previewType}
                                        onFileSelect={onFileSelect}
                                        selectedFile={selectedFile}
                                    />
                                    <FileInfo selectedFile={selectedFile} previewType={previewType} />
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-2">
                                        Descripción/Título
                                    </label>
                                    <input
                                        type="text"
                                        id="description"
                                        value={localDescription}
                                        onChange={(e) => setLocalDescription(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Tu nombre o descripción"
                                    />
                                </div>

                                {/* Iconos Sociales */}
                                <SocialIconsConfig
                                    socialIconColors={socialIconColors}
                                    onColorChange={handleSocialIconColorChange}
                                    isValidHexColor={isValidHexColor}
                                />
                            </div>

                            {/* Segunda columna: Configuración de estilo */}
                            <div className="space-y-6 md:col-span-1 lg:col-span-1">
                                {/* Configuración de Fondo */}
                                <BackgroundConfig
                                    backgroundType={backgroundType}
                                    setBackgroundType={setBackgroundType}
                                    bgColor={bgColor}
                                    setBgColor={setBgColor}
                                    backgroundPreviewUrl={backgroundPreviewUrl}
                                    backgroundImageOpacity={backgroundImageOpacity}
                                    setBackgroundImageOpacity={setBackgroundImageOpacity}
                                    onBackgroundFileSelect={onBackgroundFileSelect}
                                    isValidHexColor={isValidHexColor}
                                />

                                {/* Configuración de Estilos */}
                                <StyleConfig
                                    titleColor={titleColor}
                                    setTitleColor={setTitleColor}
                                    linkCardBackgroundColor={linkCardBackgroundColor}
                                    setLinkCardBackgroundColor={setLinkCardBackgroundColor}
                                    linkCardTextColor={linkCardTextColor}
                                    setLinkCardTextColor={setLinkCardTextColor}
                                    productBuyButtonColor={productBuyButtonColor}
                                    setProductBuyButtonColor={setProductBuyButtonColor}
                                    itemButtonColor={itemButtonColor}
                                    setItemButtonColor={setItemButtonColor}
                                    isValidHexColor={isValidHexColor}
                                />
                            </div>

                            {/* Tercera columna: Lista de Links y Productos */}
                            <div className="space-y-6 md:col-span-2 lg:col-span-1 w-full max-w-full overflow-hidden">
                                {/* Lista de Links y Productos */}
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-200 mb-3">
                                        Enlaces y Productos
                                    </label>
                                    <div className="w-full max-w-full overflow-hidden">
                                        <LinksListUpdated
                                            currentLinks={currentLinks}
                                            onAddNewLink={addNewLink}
                                            onAddNewProduct={addNewProduct}
                                            onAddNewItem={addNewItem}
                                            onRemoveLink={removeLink}
                                            onUpdateLink={updateLink}
                                            onUpdateProduct={updateProduct}
                                            onUpdateItem={updateItem}
                                            onReorderLinks={reorderLinks}
                                            onToggleVisibility={toggleVisibility}
                                            linkCardBackgroundColor={linkCardBackgroundColor}
                                            linkCardTextColor={linkCardTextColor}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <ActionButtons
                            onPreview={() => setShowPreviewModal(true)}
                            onSubmit={() => {}} // El submit se maneja en el form onSubmit
                            isSubmitting={isSubmitting}
                            uploadingImage={false}
                            previewType={previewType}
                            selectedFile={selectedFile}
                        />
                    </form>
                </div>

                {/* Modales */}
                <DeleteModal
                    isOpen={showDeleteModal}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />

                <PreviewModalUpdated
                    isOpen={showPreviewModal}
                    onClose={() => setShowPreviewModal(false)}
                    previewUrl={previewUrl}
                    previewType={previewType}
                    titleColor={titleColor}
                    description={localDescription}
                    socialIconColors={socialIconColors}
                    socialIcons={socialIcons}
                    currentLinks={currentLinks}
                    linkCardBackgroundColor={linkCardBackgroundColor}
                    linkCardTextColor={linkCardTextColor}
                    backgroundType={backgroundType}
                    backgroundPreviewUrl={backgroundPreviewUrl}
                    backgroundImageUrl={backgroundImageUrl}
                    backgroundImageOpacity={backgroundImageOpacity}
                    bgColor={bgColor}
                    styleSettings={{
                        titleColor,
                        linkCardBackgroundColor,
                        linkCardTextColor,
                        productBuyButtonColor
                    }}
                />
            </div>
        </div>
    )
}
