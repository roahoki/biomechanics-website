import Image from 'next/image'
import { useState } from 'react'
import { SocialIcon } from '@/app/components/SocialIcon'
import { ProductModal } from '@/components/ProductModal'
import { type ProfileImageType } from '@/utils/file-utils'
import { LinkItem, Product } from '@/types/product'

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
    bgColor
}: PreviewModalProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [isProductModalOpen, setIsProductModalOpen] = useState(false)

    if (!isOpen) return null

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product)
        setIsProductModalOpen(true)
    }

    const closeProductModal = () => {
        setIsProductModalOpen(false)
        setSelectedProduct(null)
    }

    const formatPrice = (price: number) => {
        return `$${price.toLocaleString('es-CL')}`
    }

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
                <div className="bg-white rounded-lg max-w-sm mx-auto max-h-[90vh] overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-lg font-semibold">Vista Previa</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Preview Content */}
                    <div 
                        className="relative min-h-[600px] flex flex-col items-center p-6 overflow-y-auto"
                        style={backgroundImageStyle}
                    >
                        {/* Overlay si hay imagen de fondo */}
                        <div 
                            className="absolute inset-0"
                            style={overlayStyle}
                        />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center w-full">
                            {/* Avatar */}
                            <div className="mb-4">
                                {previewType === 'video' ? (
                                    <video
                                        src={previewUrl}
                                        className="w-24 h-24 rounded-full object-cover"
                                        autoPlay
                                        muted
                                        loop
                                    />
                                ) : (
                                    <Image
                                        src={previewUrl}
                                        alt="Profile"
                                        width={96}
                                        height={96}
                                        className="w-24 h-24 rounded-full object-cover"
                                    />
                                )}
                            </div>

                            {/* Title */}
                            <h1 
                                className="text-xl font-bold mb-6 text-center"
                                style={{ color: titleColor }}
                            >
                                {description}
                            </h1>

                            {/* Social Icons */}
                            <div className="flex space-x-4 mb-6">
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

                            {/* Links and Products */}
                            <div className="w-full max-w-xs space-y-3">
                                {currentLinks.map((item) => (
                                    <div key={item.id}>
                                        {item.type === 'product' ? (
                                            /* Product Card */
                                            <div
                                                onClick={() => handleProductClick(item)}
                                                className="cursor-pointer transform hover:scale-[1.02] transition-all"
                                                style={{
                                                    backgroundColor: linkCardBackgroundColor,
                                                    color: linkCardTextColor
                                                }}
                                            >
                                                <div className="relative rounded-lg overflow-hidden shadow-md">
                                                    {/* Product Image */}
                                                    {item.images.length > 0 ? (
                                                        <div className="h-32 bg-gray-200">
                                                            <img
                                                                src={item.images[0]}
                                                                alt={item.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="h-32 bg-gray-200 flex items-center justify-center">
                                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                            </svg>
                                                        </div>
                                                    )}

                                                    {/* Product Info */}
                                                    <div className="p-3">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h3 className="font-semibold text-sm line-clamp-1">
                                                                {item.title || 'Producto sin título'}
                                                            </h3>
                                                            <span className="text-green-600 font-bold text-sm ml-2">
                                                                {formatPrice(item.price)}
                                                            </span>
                                                        </div>
                                                        {item.description && (
                                                            <p className="text-xs opacity-80 line-clamp-2">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                        <div className="mt-2">
                                                            <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                                PRODUCTO
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Link Card */
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block w-full py-3 px-4 rounded-lg text-center font-medium transition-all hover:scale-[1.02] shadow-md"
                                                style={{
                                                    backgroundColor: linkCardBackgroundColor,
                                                    color: linkCardTextColor
                                                }}
                                            >
                                                {item.label || 'Link sin etiqueta'}
                                            </a>
                                        )}
                                    </div>
                                ))}
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
            />
        </>
    )
}
