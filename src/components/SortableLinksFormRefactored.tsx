'use client'

import { useEffect, useState } from 'react'
import { updateAdminLinks } from '@/app/admin/_actions'
import { useRouter } from 'next/navigation'
import { type ProfileImageType } from '@/utils/file-utils'
import { type SocialIcons, type BackgroundSettings, type StyleSettings } from '@/utils/links'

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
import { LinksList } from '@/components/SortableLinksForm/LinksList'
import { ProductItem } from '@/components/ProductItem'
import { DeleteModal } from '@/components/SortableLinksForm/DeleteModal'
import { ActionButtons } from '@/components/SortableLinksForm/ActionButtons'
import { PreviewModal } from '@/components/SortableLinksForm/PreviewModal'

// Tipos
import { LinkItem } from '@/types/product'

export function SortableLinksFormRefactored({
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
    const router = useRouter()
    
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

    // Inicializar estados con valores por defecto
    useEffect(() => {
        setPreviewUrl(profileImage)
        setPreviewType(profileImageType)
        setBackgroundPreviewUrl(backgroundSettings.imageUrl || '')
    }, [profileImage, profileImageType, backgroundSettings.imageUrl, setPreviewUrl, setPreviewType, setBackgroundPreviewUrl])

    // Configuración de colores
    const {
        socialIconColors,
        bgColor,
        setBgColor,
        titleColor,
        setTitleColor,
        linkCardBackgroundColor,
        setLinkCardBackgroundColor,
        linkCardTextColor,
        setLinkCardTextColor,
        isValidHexColor,
        handleSocialIconColorChange
    } = useColorConfig({
        initialSocialIconColors: {
            instagram: socialIcons.instagram?.color || '#E4405F',
            soundcloud: socialIcons.soundcloud?.color || '#FF5500',
            youtube: socialIcons.youtube?.color || '#FF0000',
            tiktok: socialIcons.tiktok?.color || '#000000',
        },
        initialBgColor: backgroundColor || '#1a1a1a',
        initialTitleColor: styleSettings.titleColor || '#ffffff',
        initialLinkCardBackgroundColor: styleSettings.linkCardBackgroundColor || '#ffffff',
        initialLinkCardTextColor: styleSettings.linkCardTextColor || '#000000'
    })

    // Configuración de fondo
    const [backgroundType, setBackgroundType] = useState<'color' | 'image'>(backgroundSettings.type || 'color')
    const [backgroundImageUrl, setBackgroundImageUrl] = useState(backgroundSettings.imageUrl || '')
    const [backgroundImageOpacity, setBackgroundImageOpacity] = useState(backgroundSettings.imageOpacity || 0.5)

    // Manejo de archivos
    const {
        uploadFileToSupabase,
        handleFileSelect,
        handleBackgroundFileSelect,
        uploadingImage,
        setUploadingImage
    } = useFileUpload({ onStatusChange: setStatus })

    // Manejo de links
    const {
        currentLinks,
        setCurrentLinks,
        addNewLink,
        removeLink,
        confirmDelete,
        cancelDelete,
        updateLink,
        showDeleteModal
    } = useLinksManagement(links)

    // Sincronizar currentLinks con los props cuando cambien
    useEffect(() => {
        setCurrentLinks(links)
    }, [links, setCurrentLinks])

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
            handleBackgroundFileSelect(file, setSelectedBackgroundFile, setBackgroundPreviewUrl)
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

    return (
        <form
            action={handleSubmit}
            className="flex flex-col items-center min-h-screen px-4 py-10 space-y-6 text-[var(--color-neutral-light)] font-body"
            style={{
                backgroundImage: "url('/bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "var(--color-neutral-base)",
            }}
        >
            {/* Avatar con funcionalidad de cambio */}
            <AvatarUpload
                previewUrl={previewUrl}
                previewType={previewType}
                selectedFile={selectedFile}
                onFileSelect={onFileSelect}
            />

            {/* Información del archivo seleccionado */}
            <FileInfo
                selectedFile={selectedFile}
                previewType={previewType}
            />

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
            <SocialIconsConfig
                socialIconColors={socialIconColors}
                onColorChange={handleSocialIconColorChange}
                isValidHexColor={isValidHexColor}
            />

            {/* Configuración de fondo de pantalla */}
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

            {/* Configuración de colores de elementos */}
            <StyleConfig
                titleColor={titleColor}
                setTitleColor={setTitleColor}
                linkCardBackgroundColor={linkCardBackgroundColor}
                setLinkCardBackgroundColor={setLinkCardBackgroundColor}
                linkCardTextColor={linkCardTextColor}
                setLinkCardTextColor={setLinkCardTextColor}
                isValidHexColor={isValidHexColor}
            />

            {/* Lista de links como tarjetas editables */}
            <LinksList
                currentLinks={currentLinks}
                onAddNewLink={addNewLink}
                onRemoveLink={removeLink}
                onUpdateLink={updateLink}
                linkCardBackgroundColor={linkCardBackgroundColor}
                linkCardTextColor={linkCardTextColor}
            />

            {/* Mensaje de estado */}
            {status && (
                <div className={`w-full max-w-md p-3 rounded-md text-center ${
                    status.message ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {status.message || status.error}
                </div>
            )}

            {/* Botones de acción */}
            <ActionButtons
                onPreview={() => setShowPreviewModal(true)}
                onSubmit={() => {}} // Se maneja por el form action
                isSubmitting={isSubmitting}
                uploadingImage={uploadingImage}
                previewType={previewType}
                selectedFile={selectedFile}
            />

            {/* Modal de confirmación de eliminación */}
            <DeleteModal
                isOpen={showDeleteModal}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />

            {/* Modal de vista previa */}
            <PreviewModal
                isOpen={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                previewUrl={previewUrl}
                previewType={previewType}
                titleColor={titleColor}
                description={description}
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
            />
        </form>
    )
}
