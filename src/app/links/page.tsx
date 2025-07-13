'use client'

import { getLinksData } from '@/utils/links'
import { SocialIcon } from '@/app/components/SocialIcon'
import { LinkItem, Product } from '@/types/product'
import Image from 'next/image'
import { ProductModal } from '@/components/ProductModal'
import { useState, useEffect } from 'react'

export default function Page() {
    const [linksData, setLinksData] = useState<any>(null)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getLinksData()
                setLinksData(data)
            } catch (error) {
                console.error("Error al cargar datos de enlaces:", error)
                // Proporcionar datos mínimos para que la página se renderice
                setLinksData({
                    links: [],
                    description: "biomechanics.wav",
                    profileImage: "/ghost.jpg", 
                    profileImageType: "image",
                    socialIcons: {},
                    backgroundColor: "#1a1a1a",
                    backgroundSettings: { type: 'color', color: "#1a1a1a", imageOpacity: 0.5 },
                    styleSettings: { titleColor: "#ffffff", linkCardBackgroundColor: "#ffffff", linkCardTextColor: "#000000" }
                })
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white">Cargando...</div>
            </div>
        )
    }

    if (!linksData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white">Error al cargar datos</div>
            </div>
        )
    }
    
    const { links, description, profileImage, profileImageType, socialIcons, backgroundColor, backgroundSettings, styleSettings } = linksData;

    // Función para renderizar el avatar según su tipo
    const renderAvatar = () => {
        const commonClasses = "w-32 h-32 rounded-full border-4 border-[var(--color-neutral-base)] mb-4 shadow-lg object-cover"
        
        // Si no hay imagen de perfil, mostrar una imagen por defecto
        if (!profileImage) {
            return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src="/icons/default-avatar.png"
                    alt="Avatar por defecto"
                    className={commonClasses}
                    width={128}
                    height={128}
                />
            );
        }
        
        if (profileImageType === 'video' && profileImage) {
            return (
                <video 
                    src={profileImage}
                    className={commonClasses}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
            )
        } else {
            // Para 'image' y 'gif', o cuando no hay información de tipo
            // Usamos una etiqueta img nativa en lugar de Next Image para evitar problemas de serialización
            return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={profileImage}
                    alt="Foto de perfil Biomechanics"
                    className={commonClasses}
                    width={128}
                    height={128}
                    // No podemos usar onError en un componente de servidor
                    // Dejamos que Next.js maneje los errores de imagen automáticamente
                />
            )
        }
    }

    // Configurar el estilo de fondo basado en la configuración
    const getBackgroundStyle = () => {
        // Garantizar que backgroundSettings tenga un valor por defecto compatible con el tipo BackgroundSettings
        const settings = backgroundSettings || { 
            type: 'color' as const, 
            color: backgroundColor || "#1a1a1a", 
            imageOpacity: 0.5 
        };
        
        // Verificar si es una imagen y tiene URL
        if (settings.type === 'image' && 'imageUrl' in settings && settings.imageUrl) {
            return {
                backgroundImage: `url(${settings.imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                position: "relative" as const,
            }
        } else {
            return {
                backgroundColor: (settings.color || backgroundColor || "var(--color-neutral-base)"),
            }
        }
    }

    const backgroundStyle = getBackgroundStyle()
    const hasImageBackground = backgroundSettings?.type === 'image' && 
                            'imageUrl' in (backgroundSettings || {}) && 
                            !!backgroundSettings.imageUrl

    // Vista de solo lectura para usuarios comunes
    return (
        <div
            className="flex flex-col items-center min-h-screen px-4 py-10 text-[var(--color-neutral-light)] font-body"
            style={backgroundStyle}
        >
            {/* Overlay de opacidad para imagen de fondo */}
            {hasImageBackground && (
                <div 
                    className="absolute inset-0 bg-black"
                    style={{ 
                        opacity: 1 - (backgroundSettings?.imageOpacity || 0.5),
                        zIndex: 0
                    }}
                />
            )}
            
            {/* Contenido principal */}
            <div className={`relative ${hasImageBackground ? 'z-10' : ''} flex flex-col items-center`}>
                {/* Avatar dinámico */}
                {renderAvatar()}

                {/* Nombre */}
                <h1
                    className="text-4xl font-display tracking-wide mb-2"
                    style={{ 
                        fontFamily: 'Space Grotesk, sans-serif',
                        color: styleSettings?.titleColor || '#ffffff'
                    }}
                >
                    biomechanics.wav
                </h1>

                {/* Descripción */}
                <p className="text-center text-lg mb-6 max-w-2xl">
                    {description}
                </p>

                {/* Redes sociales con colores personalizables */}
                {socialIcons && Object.keys(socialIcons).length > 0 && (
                    <div className="flex gap-6 mb-8">
                        {socialIcons.instagram && socialIcons.instagram.url && (
                            <SocialIcon 
                                icon="instagram" 
                                url={socialIcons.instagram.url} 
                                color={socialIcons.instagram.color || '#E4405F'} 
                            />
                        )}
                        {socialIcons.soundcloud && socialIcons.soundcloud.url && (
                            <SocialIcon 
                                icon="soundcloud" 
                                url={socialIcons.soundcloud.url} 
                                color={socialIcons.soundcloud.color || '#FF5500'} 
                            />
                        )}
                        {socialIcons.youtube && socialIcons.youtube.url && (
                            <SocialIcon 
                                icon="youtube" 
                                url={socialIcons.youtube.url} 
                                color={socialIcons.youtube.color || '#FF0000'} 
                            />
                        )}
                        {socialIcons.tiktok && socialIcons.tiktok.url && (
                            <SocialIcon 
                                icon="tiktok" 
                                url={socialIcons.tiktok.url} 
                                color={socialIcons.tiktok.color || '#000000'} 
                            />
                        )}
                    </div>
                )}

                {/* Lista de links como tarjetas */}
                {Array.isArray(links) && links.length > 0 && (
                    <ul className="w-full max-w-md space-y-4">
                        {links.map((item: LinkItem) => (
                            <li key={item.id}>
                                {item.type === 'product' ? (
                                    <div 
                                        className="block p-4 rounded-lg shadow-md cursor-pointer font-body transition-transform hover:scale-105"
                                        style={{
                                            backgroundColor: styleSettings?.linkCardBackgroundColor || '#ffffff',
                                            color: styleSettings?.linkCardTextColor || '#000000'
                                        }}
                                        onClick={() => setSelectedProduct(item as Product)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Imagen del producto */}
                                            {item.images && item.images.length > 0 ? (
                                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={item.images[0]}
                                                        alt={item.title || 'Producto'}
                                                        width={48}
                                                        height={48}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                    🛍️
                                                </div>
                                            )}
                                            
                                            {/* Información del producto */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold truncate">{item.title || 'Producto'}</h3>
                                                <p className="text-sm opacity-75">
                                                    ${item.price?.toLocaleString('es-CL') || '0'}
                                                </p>
                                            </div>
                                            
                                            {/* Indicador de producto */}
                                            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                Producto
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <a
                                        href={item.url || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-4 rounded-lg shadow-md hover:opacity-80 transition-opacity font-body"
                                        style={{
                                            backgroundColor: styleSettings?.linkCardBackgroundColor || '#ffffff',
                                            color: styleSettings?.linkCardTextColor || '#000000'
                                        }}
                                    >
                                        {item.label || item.url || 'Sin título'}
                                    </a>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Modal de producto */}
            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
}
