'use client'

import { getLinksData } from '@/utils/links'
import { SocialIcon } from '@/components'
import { LinkItem, Product, Item } from '@/types/product'
import Image from 'next/image'
import { ProductModal, ItemModal, PressablesList, CategoryFilter } from '@/components'
import { useCategoryFilter } from '@/hooks/useCategoryFilter'
import { useState, useEffect } from 'react'

export default function Page() {
    const [linksData, setLinksData] = useState<any>(null)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [selectedItem, setSelectedItem] = useState<Item | null>(null)
    const [loading, setLoading] = useState(true)

    // Filtrado por categorías
    const {
        filteredItems,
        categoriesWithItems,
        selectedCategory,
        setSelectedCategory
    } = useCategoryFilter(linksData?.links || [], linksData?.categories || [])

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getLinksData()
                console.log('Datos cargados:', data)
                console.log('Productos encontrados:', data.links.filter(item => item.type === 'product'))
                setLinksData(data)
            } catch (error) {
                console.error("Error al cargar datos de enlaces:", error)
                // Proporcionar datos mínimos para que la página se renderice
                setLinksData({
                    links: [],
                    title: "biomechanics.wav",
                    description: "biomechanics.wav",
                    profileImage: "/ghost.jpg", 
                    profileImageType: "image",
                    socialIcons: {},
                    backgroundColor: "#1a1a1a",
                    backgroundSettings: { type: 'color', color: "#1a1a1a", imageOpacity: 0.5 },
                    styleSettings: { titleColor: "#ffffff", linkCardBackgroundColor: "#ffffff", linkCardTextColor: "#000000" },
                    categories: []
                })
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="text-white">Cargando...</div>
            </div>
        )
    }

    if (!linksData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
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
                    className={`${commonClasses} clickable`}
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
                    className={`${commonClasses} clickable`}
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
            className="flex flex-col items-center min-h-screen px-4 py-10 text-[var(--color-neutral-light)] font-body select-none"
            style={{
                ...backgroundStyle,
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
                msUserSelect: 'none'
            }}
        >
            {/* Overlay de opacidad para imagen de fondo */}
            {hasImageBackground && (
                <div 
                    className="absolute inset-0 bg-black select-none"
                    style={{ 
                        opacity: 1 - (backgroundSettings?.imageOpacity || 0.5),
                        zIndex: 0,
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        WebkitTouchCallout: 'none',
                        msUserSelect: 'none',
                        pointerEvents: 'none'
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
                    {linksData.title || "biomechanics.wav"}
                </h1>                {/* Descripción */}
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

                {/* Filtro de categorías */}
                {categoriesWithItems.length > 1 && (
                    <div className="w-full max-w-4xl mb-8">
                        <CategoryFilter
                            categories={categoriesWithItems}
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                        />
                    </div>
                )}



                {/* Lista unificada de presionables (links + productos + items) */}
                {Array.isArray(filteredItems) && filteredItems.length > 0 && (
                    <PressablesList
                        items={filteredItems}
                        styleSettings={styleSettings || { 
                            titleColor: '#ffffff', 
                            linkCardBackgroundColor: '#ffffff', 
                            linkCardTextColor: '#000000',
                            productBuyButtonColor: '#ff6b35'
                        }}
                        onProductClick={(product) => setSelectedProduct(product)}
                        onItemClick={(item) => setSelectedItem(item)}
                    />
                )}
            </div>

            {/* Modal de producto */}
            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    styleSettings={styleSettings}
                />
            )}

            {/* Modal de item */}
            {selectedItem && (
                <ItemModal
                    item={selectedItem}
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    styleSettings={styleSettings}
                />
            )}
        </div>
    );
}
