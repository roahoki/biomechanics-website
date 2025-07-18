import Image from 'next/image'
import { useState } from 'react'
import { SocialIcon } from '@/app/components/SocialIcon'
import { ProductModal } from '@/components/ProductModal'
import { ItemModal } from '@/components/ItemModal'
import { PressablesList } from '@/components/PressablesList'
import { type ProfileImageType } from '@/utils/file-utils'
import { LinkItem, Product, Item } from '@/types/product'
import { StyleSettings } from '@/utils/links'

type ViewMode = 'mobile' | 'desktop'

interface PreviewModalProps {
    isOpen: boolean
    onClose: () => void
    previewUrl: string
    previewType: ProfileImageType
    titleColor: string
    description: string
    socialIconColors: {
        instagram: string
        soundcloud: string
        youtube: string
        tiktok: string
    }
    socialIcons: any
    currentLinks: LinkItem[]
    linkCardBackgroundColor: string
    linkCardTextColor: string
    backgroundType: 'color' | 'image'
    backgroundPreviewUrl: string
    backgroundImageUrl: string
    backgroundImageOpacity: number
    bgColor: string
    styleSettings: StyleSettings
}

export function PreviewModalUpdated({
    isOpen,
    onClose,
    previewUrl,
    previewType,
    titleColor,
    description,
    socialIconColors,
    socialIcons,
    currentLinks,
    linkCardBackgroundColor,
    linkCardTextColor,
    backgroundType,
    backgroundPreviewUrl,
    backgroundImageUrl,
    backgroundImageOpacity,
    bgColor,
    styleSettings
}: PreviewModalProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [selectedItem, setSelectedItem] = useState<Item | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('mobile')
    const [isProductModalOpen, setIsProductModalOpen] = useState(false)
    const [isItemModalOpen, setIsItemModalOpen] = useState(false)

    if (!isOpen) return null

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product)
        setIsProductModalOpen(true)
    }

    const handleItemClick = (item: Item) => {
        setSelectedItem(item)
        setIsItemModalOpen(true)
    }

    const closeProductModal = () => {
        setIsProductModalOpen(false)
        setSelectedProduct(null)
    }

    const closeItemModal = () => {
        setIsItemModalOpen(false)
        setSelectedItem(null)
    }

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price).replace('CLP', '').trim()
    }

    // Configuración de estilos según el modo de vista
    const getViewportStyles = () => {
        if (viewMode === 'desktop') {
            return {
                container: 'max-w-4xl w-full h-[80vh]',
                viewport: 'max-w-md mx-auto h-full',
                avatarSize: 'w-32 h-32',
                titleSize: 'text-4xl',
                linksWidth: 'max-w-md',
                spacing: 'space-y-4'
            }
        } else {
            return {
                container: 'max-w-sm w-full h-[80vh]',
                viewport: 'w-full h-full',
                avatarSize: 'w-24 h-24',
                titleSize: 'text-xl',
                linksWidth: 'max-w-xs',
                spacing: 'space-y-3'
            }
        }
    }

    const styles = getViewportStyles()

    const backgroundImageStyle = backgroundType === 'image' && backgroundImageUrl
        ? {
            backgroundImage: `url(${backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }
        : {}

    const overlayStyle = backgroundType === 'image' && backgroundImageUrl
        ? {
            backgroundColor: `${bgColor}${Math.round(backgroundImageOpacity * 255).toString(16).padStart(2, '0')}`
        }
        : {
            backgroundColor: bgColor
        }

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className={`bg-white rounded-lg ${styles.container} shadow-2xl flex flex-col`}>
                    {/* Header con selector de vista */}
                    <div className="flex justify-between items-center p-4 border-b bg-white rounded-t-lg flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-semibold">Vista Previa</h2>
                            
                            {/* Selector de vista */}
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('mobile')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                                        viewMode === 'mobile'
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
                                    </svg>
                                    Móvil
                                </button>
                                <button
                                    onClick={() => setViewMode('desktop')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                                        viewMode === 'desktop'
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    PC
                                </button>
                            </div>
                        </div>
                        
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Preview Content con scroll */}
                    <div className="flex-1 overflow-hidden bg-gray-50 rounded-b-lg">
                        <div className={`${styles.viewport} overflow-y-auto h-full`}>
                            <div 
                                className="min-h-full flex flex-col items-center p-6 relative select-none"
                                style={{
                                    ...backgroundImageStyle,
                                    userSelect: 'none',
                                    WebkitUserSelect: 'none',
                                    WebkitTouchCallout: 'none',
                                    msUserSelect: 'none'
                                }}
                            >
                                {/* Overlay si hay imagen de fondo */}
                                <div 
                                    className="absolute inset-0 pointer-events-none select-none"
                                    style={{
                                        ...overlayStyle,
                                        userSelect: 'none',
                                        WebkitUserSelect: 'none',
                                        WebkitTouchCallout: 'none',
                                        msUserSelect: 'none',
                                        pointerEvents: 'none'
                                    }}
                                />

                                {/* Content */}
                                <div className="relative z-10 flex flex-col items-center w-full">
                                    {/* Avatar */}
                                    <div className="mb-4">
                                        {previewType === 'video' ? (
                                            <video
                                                src={previewUrl}
                                                className={`${styles.avatarSize} rounded-full object-cover border-4 border-gray-200`}
                                                autoPlay
                                                muted
                                                loop
                                            />
                                        ) : (
                                            <Image
                                                src={previewUrl}
                                                alt="Profile"
                                                width={viewMode === 'desktop' ? 128 : 96}
                                                height={viewMode === 'desktop' ? 128 : 96}
                                                className={`${styles.avatarSize} rounded-full object-cover border-4 border-gray-200`}
                                            />
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h1 
                                        className={`${styles.titleSize} font-bold mb-6 text-center font-display tracking-wide`}
                                        style={{ 
                                            color: titleColor,
                                            fontFamily: 'Space Grotesk, sans-serif'
                                        }}
                                    >
                                        biomechanics.wav
                                    </h1>

                                    {/* Description */}
                                    <p className={`text-center ${viewMode === 'desktop' ? 'text-lg mb-8' : 'text-base mb-6'} max-w-2xl`}>
                                        {description}
                                    </p>

                                    {/* Social Icons */}
                                    {(socialIcons.instagram?.url || socialIcons.soundcloud?.url || socialIcons.youtube?.url || socialIcons.tiktok?.url) && (
                                        <div className={`flex ${viewMode === 'desktop' ? 'gap-6 mb-8' : 'gap-4 mb-6'}`}>
                                            {socialIcons.instagram?.url && (
                                                <SocialIcon
                                                    icon="instagram"
                                                    url={socialIcons.instagram.url}
                                                    color={socialIconColors.instagram}
                                                />
                                            )}
                                            {socialIcons.soundcloud?.url && (
                                                <SocialIcon
                                                    icon="soundcloud"
                                                    url={socialIcons.soundcloud.url}
                                                    color={socialIconColors.soundcloud}
                                                />
                                            )}
                                            {socialIcons.youtube?.url && (
                                                <SocialIcon
                                                    icon="youtube"
                                                    url={socialIcons.youtube.url}
                                                    color={socialIconColors.youtube}
                                                />
                                            )}
                                            {socialIcons.tiktok?.url && (
                                                <SocialIcon
                                                    icon="tiktok"
                                                    url={socialIcons.tiktok.url}
                                                    color={socialIconColors.tiktok}
                                                />
                                            )}
                                        </div>
                                    )}

                                    {/* Lista unificada de presionables */}
                                    <div className={`w-full ${styles.linksWidth} ${styles.spacing}`}>
                                        <PressablesList
                                            items={currentLinks}
                                            styleSettings={styleSettings}
                                            onProductClick={handleProductClick}
                                            onItemClick={handleItemClick}
                                        />
                                    </div>

                                    {/* Indicador de scroll si hay muchos elementos */}
                                    {currentLinks.length > 6 && (
                                        <div className="mt-6 text-center">
                                            <p className="text-xs text-gray-500 opacity-60">
                                                Desplázate para ver más elementos
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Modal */}
            <ProductModal
                product={selectedProduct}
                isOpen={isProductModalOpen}
                onClose={closeProductModal}
                styleSettings={styleSettings}
            />

            {/* Item Modal */}
            <ItemModal
                item={selectedItem}
                isOpen={isItemModalOpen}
                onClose={closeItemModal}
                styleSettings={styleSettings}
            />
        </>
    )
}
