'use client'

import { useEffect, useState, useRef } from 'react'
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
import { AvatarUpload } from '../../common/forms/AvatarUpload'
import { FileInfo } from '../../common/ui/FileInfo'
import { SocialIconsConfig } from '../profile/SocialIconsConfig'
import { BackgroundConfig } from '../profile/BackgroundConfig'
import { StyleConfig } from '../profile/StyleConfig'
import { LinksListUpdated } from './SortableLinksForm/LinksListUpdated'
import { DeleteModal } from './SortableLinksForm/DeleteModal'
import { ActionButtons } from './SortableLinksForm/ActionButtons'

export function SortableLinksFormWithProducts({
    links,
    title,
    description,
    profileImage,
    profileImageType,
    socialIcons,
    backgroundColor,
    backgroundSettings,
    styleSettings,
    categories
}: {
    links: any[]
    categories: string[]
    title?: string
    description: string
    profileImage: string
    profileImageType: ProfileImageType
    socialIcons: SocialIcons
    backgroundColor: string
    backgroundSettings: BackgroundSettings
    styleSettings: StyleSettings
}) {
    const router = useRouter()
    const formRef = useRef<HTMLFormElement | null>(null)
    
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
        uploadCroppedItemImages,
        uploadBackgroundImage 
    } = useFileUpload({
        onStatusChange: setStatus
    })

    // Inicializar estados con valores por defecto
    useEffect(() => {
        setPreviewUrl(profileImage)
        setPreviewType(profileImageType)
        setBackgroundPreviewUrl(backgroundSettings.imageUrl || '')
        // También actualizar backgroundImageUrl cuando cambien los props
        setBackgroundImageUrl(backgroundSettings.imageUrl || '')
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
            tiktok: socialIcons.tiktok?.color || '#000000',
            mixcloud: socialIcons.mixcloud?.color || '#52ADE9'
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
        currentLinksRef,
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

    // Estados locales
    const [localTitle, setLocalTitle] = useState(title || "biomechanics.wav")
    const [localDescription, setLocalDescription] = useState(description)
    // Estado local de categorías (editable hasta guardar)
    const [localCategories, setLocalCategories] = useState<string[]>(categories || [])
    const [showUnsaved, setShowUnsaved] = useState(false)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    // Baseline para comparar (se actualiza tras guardar con éxito)
    const [baseline, setBaseline] = useState(() => ({
        categories: categories || [],
        title: title || 'biomechanics.wav',
        description,
        profileImage,
        backgroundType: backgroundSettings.type || 'color',
        backgroundImageUrl: backgroundSettings.imageUrl || '',
        backgroundImageOpacity: backgroundSettings.imageOpacity || 0.5,
        bgColor: backgroundColor,
        titleColor: styleSettings.titleColor || '#ffffff',
        linkCardBackgroundColor: styleSettings.linkCardBackgroundColor || '#ffffff',
        linkCardTextColor: styleSettings.linkCardTextColor || '#000000',
        productBuyButtonColor: styleSettings.productBuyButtonColor || '#ff6b35',
        itemButtonColor: styleSettings.itemButtonColor || '#3b82f6'
    }))

    // Detectar cambios sin guardar comparando con baseline (no con props originales)
    useEffect(() => {
        const changed = (
            JSON.stringify(localCategories) !== JSON.stringify(baseline.categories) ||
            localTitle !== baseline.title ||
            localDescription !== baseline.description ||
            previewUrl !== baseline.profileImage ||
            backgroundType !== baseline.backgroundType ||
            backgroundImageUrl !== baseline.backgroundImageUrl ||
            backgroundImageOpacity !== baseline.backgroundImageOpacity ||
            bgColor !== baseline.bgColor ||
            titleColor !== baseline.titleColor ||
            linkCardBackgroundColor !== baseline.linkCardBackgroundColor ||
            linkCardTextColor !== baseline.linkCardTextColor ||
            productBuyButtonColor !== baseline.productBuyButtonColor ||
            itemButtonColor !== baseline.itemButtonColor
        )
        setShowUnsaved(changed)
    }, [localCategories, localTitle, localDescription, previewUrl, backgroundType, backgroundImageUrl, backgroundImageOpacity, bgColor, titleColor, linkCardBackgroundColor, linkCardTextColor, productBuyButtonColor, itemButtonColor, baseline])

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
                    const uploadedUrl = await uploadFileToSupabase(selectedFile)
                    if (uploadedUrl) {
                        finalProfileImage = uploadedUrl
                        finalProfileImageType = previewType
                    } else {
                        console.warn('⚠️ La subida devolvió null')
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
                    console.error('❌ Error subiendo imagen de perfil:', error)
                    console.error('❌ Mensaje del error:', errorMessage)
                    // No fallar todo el proceso por la imagen de perfil

                }
            }

            // 2. Subir imagen de fondo si es necesaria
            // Usar el valor actual de backgroundSettings.imageUrl como base
            let finalBackgroundImageUrl = backgroundSettings.imageUrl || ''

            if (selectedBackgroundFile) {
                setStatus({ message: 'Subiendo imagen de fondo...' })
                try {
                    const uploadedUrl = await uploadBackgroundImage(selectedBackgroundFile)
                    if (uploadedUrl) {
                        finalBackgroundImageUrl = uploadedUrl
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
                    console.error('❌ Error subiendo imagen de fondo:', error)
                    console.error('❌ Mensaje del error:', errorMessage)
                    // No fallar todo el proceso por la imagen de fondo
                    console.log('⚠️ Continuando sin imagen de fondo nueva...')
                }
            } else {
                // Si no hay nueva imagen, conservar la actual o usar backgroundImageUrl actualizado
                finalBackgroundImageUrl = backgroundImageUrl || backgroundSettings.imageUrl || ''
                console.log('📋 Manteniendo imagen de fondo actual:', finalBackgroundImageUrl)
            }

            // 3. Procesar productos e items para subir imágenes a Supabase
            
            // Obtener el estado más actualizado usando ref (evita stale closures)
            const latestLinks = currentLinksRef.current
            
            const processedLinks = await Promise.all(
                latestLinks.map(async (item) => {
                    
                    // Procesar productos
                    if (item.type === 'product' && item.images.length > 0) {
                        const dataUrls = item.images.filter((img: string) => img.startsWith('data:'))
                        const publicUrls = item.images.filter((img: string) => !img.startsWith('data:'))
                        
                        if (dataUrls.length > 0) {
                            setStatus({ message: `Subiendo imágenes del producto "${item.title}"...` })
                            try {
                                const uploadedUrls = await uploadMultipleProductImages(dataUrls, item.id)
                                return {
                                    ...item,
                                    images: [...publicUrls, ...uploadedUrls]
                                }
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
                                throw new Error(`Error subiendo imágenes del producto "${item.title}": ${errorMessage}`)
                            }
                        }
                    }
                    // Procesar items - MÉTODO SIMPLE
                    else if (item.type === 'item' && item.images.length > 0) {
                        const dataUrls = item.images.filter((img: string) => img.startsWith('data:'))
                        const publicUrls = item.images.filter((img: string) => !img.startsWith('data:'))
                        
                        if (dataUrls.length > 0) {
                            setStatus({ message: `Subiendo imágenes del item "${item.title}"...` })
                            try {
                                const uploadedUrls = await uploadMultipleItemImages(dataUrls, item.id)

                                return {
                                    ...item,
                                    images: [...publicUrls, ...uploadedUrls]
                                }
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

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
                title: localTitle,
                description: localDescription,
                profileImage: finalProfileImage,
                profileImageType: finalProfileImageType,
                socialIcons: {
                    instagram: { url: socialIcons.instagram?.url, color: socialIconColors.instagram },
                    soundcloud: { url: socialIcons.soundcloud?.url, color: socialIconColors.soundcloud },
                    youtube: { url: socialIcons.youtube?.url, color: socialIconColors.youtube },
                    tiktok: { url: socialIcons.tiktok?.url, color: socialIconColors.tiktok },
                    mixcloud: { url: socialIcons.mixcloud?.url || 'https://www.mixcloud.com/biomechanics-wav/', color: socialIconColors.mixcloud }
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
                },
                categories: localCategories
            }

            console.log('📤 Datos finales a enviar:', {
                finalBackgroundImageUrl,
                backgroundType,
                backgroundImageOpacity,
                originalBackgroundSettings: backgroundSettings
            })

            // Llamar a la nueva función que soporta productos
            const result = await updateAdminLinksWithProducts(processedLinks, updatedData)

            if (result.success) {
                setStatus({ message: result.message })
                setToast({ type: 'success', message: 'Cambios guardados correctamente.' })
                // Actualizar baseline para reflejar el nuevo estado persistido
                setBaseline({
                    categories: [...localCategories],
                    title: localTitle,
                    description: localDescription,
                    profileImage: finalProfileImage,
                    backgroundType,
                    backgroundImageUrl: finalBackgroundImageUrl,
                    backgroundImageOpacity,
                    bgColor,
                    titleColor,
                    linkCardBackgroundColor,
                    linkCardTextColor,
                    productBuyButtonColor,
                    itemButtonColor
                })
                setShowUnsaved(false)
                setTimeout(() => setToast(null), 4000)
            } else {
                setStatus({ error: result.error || 'Error desconocido' })
                setToast({ type: 'error', message: result.error || 'Error al guardar.' })
                setTimeout(() => setToast(null), 5000)
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

    useEffect(() => {
        const keyHandler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault()
                if (!isSubmitting) {
                    formRef.current?.requestSubmit()
                }
            }
        }
        window.addEventListener('keydown', keyHandler)
        return () => window.removeEventListener('keydown', keyHandler)
    }, [isSubmitting])

    return (
        <div className="w-full">
            <form ref={formRef} onSubmit={handleSubmit} className="p-3 sm:p-4 lg:p-6">
                {/* Layout móvil: Stack vertical con prioridad al listado de items */}
                <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-6">
                    {/* Configuraciones principales - Acordeón en móvil */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Panel colapsable para móvil */}
                        <details className="lg:hidden group bg-gray-800 rounded-lg">
                            <summary className="flex items-center justify-between cursor-pointer p-4 text-gray-200 hover:bg-gray-700 transition-colors rounded-lg">
                                <span className="text-sm font-medium">⚙️ Configuración del perfil</span>
                                <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </summary>
                            <div className="p-4 pt-0 space-y-4">
                                {/* Avatar Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Foto/Video de Perfil
                                    </label>
                                    <AvatarUpload
                                        previewUrl={previewUrl}
                                        previewType={previewType}
                                        onFileSelect={onFileSelect}
                                        selectedFile={selectedFile}
                                    />
                                </div>

                                {/* Título */}
                                <div>
                                    <label htmlFor="title-mobile" className="block text-sm font-medium text-gray-200 mb-2">
                                        Título de la página
                                    </label>
                                    <input
                                        type="text"
                                        id="title-mobile"
                                        value={localTitle}
                                        onChange={(e) => setLocalTitle(e.target.value.slice(0, 65))}
                                        maxLength={65}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="biomechanics.wav"
                                    />
                                    <div className="text-xs text-gray-400 mt-1">
                                        {localTitle.length}/65 caracteres
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label htmlFor="description-mobile" className="block text-sm font-medium text-gray-200 mb-2">
                                        Descripción/Subtítulo
                                    </label>
                                    <input
                                        type="text"
                                        id="description-mobile"
                                        value={localDescription}
                                        onChange={(e) => setLocalDescription(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Tu nombre o descripción"
                                    />
                                </div>
                            </div>
                        </details>

                        {/* Configuraciones avanzadas - Acordeón en móvil */}
                        <details className="lg:hidden group bg-gray-800 rounded-lg">
                            <summary className="flex items-center justify-between cursor-pointer p-4 text-gray-200 hover:bg-gray-700 transition-colors rounded-lg">
                                <span className="text-sm font-medium">🎨 Configuración de estilo</span>
                                <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </summary>
                            <div className="p-4 pt-0 space-y-4">
                                {/* Iconos Sociales */}
                                <SocialIconsConfig
                                    socialIconColors={socialIconColors}
                                    onColorChange={handleSocialIconColorChange}
                                    isValidHexColor={isValidHexColor}
                                />

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
                        </details>

                        {/* Desktop: Configuraciones siempre visibles */}
                        <div className="hidden lg:block space-y-6">
                            {/* Avatar Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2 sm:mb-3">
                                    Foto/Video de Perfil
                                </label>
                                <AvatarUpload
                                    previewUrl={previewUrl}
                                    previewType={previewType}
                                    onFileSelect={onFileSelect}
                                    selectedFile={selectedFile}
                                />
                            </div>

                            {/* Título */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-2">
                                    Título de la página
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={localTitle}
                                    onChange={(e) => setLocalTitle(e.target.value.slice(0, 65))}
                                    maxLength={65}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="biomechanics.wav"
                                />
                                <div className="text-xs text-gray-400 mt-1">
                                    {localTitle.length}/65 caracteres
                                </div>
                            </div>

                            {/* Descripción */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-2">
                                    Descripción/Subtítulo
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
                    </div>

                    {/* Lista de Items - Prioridad total en móvil */}
                    <div className="lg:col-span-3">
                        <div className="w-full">
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
                                availableCategories={localCategories}
                                onUpdateLinkCategories={(linkId: number, newCategories: string[]) => {
                                    const updatedLinks = currentLinks.map(link => 
                                        link.id === linkId 
                                            ? { ...link, categories: newCategories }
                                            : link
                                    )
                                    setCurrentLinks(updatedLinks)
                                }}
                                onCategoriesChange={(cats: string[]) => setLocalCategories(cats)}
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <ActionButtons
                    onPreview={() => setShowPreviewModal(true)}
                    onSubmit={() => {}}
                    isSubmitting={isSubmitting}
                    uploadingImage={false}
                    previewType={previewType}
                    selectedFile={selectedFile}
                />
                {/* Toast de cambios sin guardar */}
                {showUnsaved && !isSubmitting && !toast && (
                    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-yellow-500/95 text-white px-4 py-3 rounded shadow-lg flex items-start space-x-3 animate-fade-in">
                    <span className="text-lg">⚠️</span>
                    <div className="text-sm leading-snug">
                        <p className="font-semibold">Cambios sin guardar</p>
                        <p>Pulsa "Guardar Cambios" para persistirlos.</p>
                    </div>
                    <button onClick={() => setShowUnsaved(false)} className="ml-2 text-white/80 hover:text-white">✕</button>
                    </div>
                )}
                {/* Toast de resultado */}
                {toast && (
                    <div className={`fixed bottom-4 right-4 z-50 max-w-sm px-4 py-3 rounded shadow-lg flex items-start space-x-3 animate-fade-in ${toast.type === 'success' ? 'bg-green-600/95' : 'bg-red-600/95'}`}> 
                    <span className="text-lg">{toast.type === 'success' ? '✅' : '❌'}</span>
                    <div className="text-sm leading-snug">
                        <p className="font-semibold">{toast.type === 'success' ? 'Éxito' : 'Error'}</p>
                        <p>{toast.message}</p>
                    </div>
                    <button onClick={() => setToast(null)} className="ml-2 text-white/80 hover:text-white">✕</button>
                    </div>
                )}
            </form>
            {/* Modales */}
            <DeleteModal
                isOpen={showDeleteModal}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </div>
        )
        }
