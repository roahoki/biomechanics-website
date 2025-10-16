'use client'

import { getLinksData } from '@/utils/links'
import { sortLinks } from '@/utils/sort-utils'
import { SocialIcon } from '@/components'
import { LinkItem, Product, Item } from '@/types/product'
import Image from 'next/image'
import { ProductModal, ItemModal, PressablesList, CategoryFilter } from '@/components'
import { useCategoryFilter } from '@/hooks/useCategoryFilter'
import { useState, useEffect, useMemo } from 'react'

export default function Page() {
    const [linksData, setLinksData] = useState<any>(null)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [selectedItem, setSelectedItem] = useState<Item | null>(null)
    const [loading, setLoading] = useState(true)

    // Aplicar sorting a los links según el sortMode configurado
    const sortedLinks = useMemo(() => {
        if (!linksData?.links || !linksData?.sortMode) return linksData?.links || []
        return sortLinks(linksData.links, linksData.sortMode)
    }, [linksData?.links, linksData?.sortMode])

    // Filtrado por categorías (ahora usa sortedLinks)
    const {
        filteredItems,
        categoriesWithItems,
        selectedCategory,
        setSelectedCategory
    } = useCategoryFilter(sortedLinks, linksData?.categories || [])

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getLinksData()
                console.log('Datos cargados:', data)
                console.log('Modo de ordenamiento:', data.sortMode)
                console.log('Productos encontrados:', data.links.filter(item => item.type === 'product'))
                setLinksData(data)
            } catch (error) {
                console.error("Error al cargar datos de enlaces:", error)
                // Proporcionar datos mínimos para que la página se renderice
                setLinksData({
                    links: [],
                    sortMode: 'manual',
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
        
        // Solo aplicar backgroundColor para color sólido
        // Las imágenes se manejan con una capa fija separada
        if (settings.type === 'color' || !('imageUrl' in settings) || !settings.imageUrl) {
            return {
                backgroundColor: (settings.color || backgroundColor || "var(--color-neutral-base)"),
            }
        } else {
            return {}
        }
    }

    const backgroundStyle = getBackgroundStyle()
    const hasImageBackground = backgroundSettings?.type === 'image' && 
                            'imageUrl' in (backgroundSettings || {}) && 
                            !!backgroundSettings.imageUrl

    // Crear variables CSS para fondo y opacidad
    const cssVariables = {
        '--bg-image': hasImageBackground ? `url(${backgroundSettings?.imageUrl})` : 'none',
        '--bg-color': backgroundSettings?.color || backgroundColor || "#1a1a1a",
        '--bg-opacity': backgroundSettings?.imageOpacity || 0.5,
    } as React.CSSProperties;

    // Vista de solo lectura para usuarios comunes
    return (
        <div className="relative min-h-screen" style={cssVariables}>
            {/* Capa de fondo optimizada y responsive */}
            <div 
                className="fixed inset-0 z-0 pointer-events-none bg-cover bg-top bg-no-repeat md:bg-cover sm:bg-contain"
                style={{
                    backgroundImage: hasImageBackground 
                        ? `linear-gradient(rgba(0, 0, 0, calc(1 - var(--bg-opacity))), rgba(0, 0, 0, calc(1 - var(--bg-opacity)))), var(--bg-image)`
                        : 'none',
                    backgroundColor: hasImageBackground ? 'transparent' : 'var(--bg-color)',
                }}
            />

            {/* Contenedor de contenido - ahora con z-index y posición sobre la capa de fondo */}
            <div
                className="flex flex-col items-center min-h-screen py-10 text-[var(--color-neutral-light)] font-body relative"
                style={{
                    zIndex: 1, // Mantener encima de la capa de fondo
                    position: 'relative', // Asegura el correcto apilamiento
                    width: '100%', // Usar todo el ancho disponible
                    overflowX: 'hidden', // Solo ocultar desbordamiento horizontal
                    overflowY: 'auto', // Permitir scroll vertical
                    WebkitOverflowScrolling: 'touch' // Scroll suave en iOS
                }}
            >
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
                        {socialIcons.mixcloud && socialIcons.mixcloud.url && (
                            <SocialIcon
                                icon="mixcloud"
                                url={socialIcons.mixcloud.url}
                                color={socialIcons.mixcloud.color || '#52ADE9'}
                            />
                        )}
                    </div>
                )}

                {/* Filtro de categorías */}
                {categoriesWithItems.length > 1 && (
                    <div className="w-full mb-4 flex justify-center z-30 sticky-category-filter">
                        <CategoryFilter
                            categories={categoriesWithItems}
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                            className="w-full lg:w-auto"
                        />
                    </div>
                )}



                {/* Lista unificada de presionables (links + productos + items) */}
                <div className="w-full max-w-full px-4 md:px-8 lg:px-16 flex-grow flex flex-col items-center list-container">
                    {Array.isArray(filteredItems) && filteredItems.length > 0 ? (
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
                    ) : (
                        <div className="w-full py-8 text-center text-white">
                            No hay elementos disponibles en esta categoría
                        </div>
                    )}
                </div>
                
                {/* Espacio adicional para móvil */}
                <div className="h-8 md:hidden"></div>
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
            
            {/* Estilos optimizados para el fondo */}
            <style jsx global>{`
                /* Optimizaciones de rendimiento para el fondo */
                .bg-cover {
                    background-size: cover;
                }
                .bg-center {
                    background-position: center;
                }
                .bg-no-repeat {
                    background-repeat: no-repeat;
                }
                
                /* Transiciones suaves */
                .fixed.inset-0 {
                    transition: background-image 0.3s ease-out, background-color 0.3s ease-out;
                    will-change: auto;
                }
                
                /* Optimizaciones móvil */
                @media (max-width: 768px) {
                    .fixed.inset-0 {
                        /* Reducir transiciones en móvil para mejor performance */
                        transition: background-color 0.2s ease-out;
                    }
                }
                
                /* Optimizaciones desktop */
                @media (min-width: 769px) {
                    .fixed.inset-0 {
                        /* Transiciones más suaves en desktop */
                        transition: background-image 0.4s ease-out, background-color 0.4s ease-out;
                    }
                }
                
                /* Estilo para el filtro de categorías fijo */
                .sticky-category-filter {
                    position: sticky;
                    top: 0;
                    padding-top: 0.5rem;
                    padding-bottom: 0.5rem;
                    margin-bottom: 1rem;
                    z-index: 40;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                }
                
                /* En escritorio, ajustamos la estructura */
                @media (min-width: 768px) {
                    .sticky-category-filter {
                        background: transparent;
                        backdrop-filter: none;
                        -webkit-backdrop-filter: none;
                        padding-top: 1rem;
                        padding-bottom: 1rem;
                    }
                    
                    /* Contenedor de la lista de presionables en escritorio */
                    .list-container {
                        height: auto; /* Altura automática según contenido */
                        min-height: calc(100vh - 320px); /* Altura mínima para ocupar espacio disponible */
                        overflow: visible; /* Permite que el contenido sea visible */
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        max-width: 100% !important; /* Asegurar que use todo el ancho disponible */
                        width: 100% !important;
                        padding-bottom: 40px; /* Espacio inferior para mejorar UX */
                    }
                }
                
                /* Mejoras específicas para el scroll de categorías en móvil */
                @media (max-width: 767px) {
                    /* Asegurar que el contenedor de categorías tenga un comportamiento suave */
                    #category-filter-container {
                        -webkit-overflow-scrolling: touch;
                        overscroll-behavior-x: contain;
                        scroll-padding: 1rem;
                    }
                    
                    /* Optimizar el rendimiento del scroll */
                    #category-filter-container button {
                        transform: translateZ(0);
                        -webkit-transform: translateZ(0);
                    }
                    
                    /* Evitar el bounce del scroll en iOS */
                    .sticky-category-filter {
                        overscroll-behavior: contain;
                    }
                }
            `}</style>
        </div>
    );
}
