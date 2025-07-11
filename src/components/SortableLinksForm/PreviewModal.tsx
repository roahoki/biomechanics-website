import Image from 'next/image'
import { SocialIcon } from '@/app/components/SocialIcon'
import { type ProfileImageType } from '@/utils/file-utils'

interface Link {
    id: number
    url: string
    label: string
}

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
    currentLinks: Link[]
    linkCardBackgroundColor: string
    linkCardTextColor: string
    backgroundType: 'color' | 'image'
    backgroundPreviewUrl: string
    backgroundImageUrl: string
    backgroundImageOpacity: number
    bgColor: string
}

export function PreviewModal({
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
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-neutral-900 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
                {/* Botón de cerrar */}
                <button
                    onClick={onClose}
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
                                <Image
                                    src={previewUrl}
                                    alt="Avatar"
                                    className="w-32 h-32 rounded-full border-4 border-[var(--color-accent-organic)] shadow-lg object-cover"
                                    width={128}
                                    height={128}
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
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Cerrar Vista Previa
                    </button>
                </div>
            </div>
        </div>
    )
}
