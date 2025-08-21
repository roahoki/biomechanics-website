'use client'

import { LinkItem, Product, Item } from '@/types/product'
import { StyleSettings } from '@/utils/links'
import { PressableItem } from './PressableItem'

interface PressablesListProps {
    items: LinkItem[]
    styleSettings: StyleSettings
    onProductClick?: (product: Product) => void
    onItemClick?: (item: Item) => void
}

export function PressablesList({ 
    items, 
    styleSettings, 
    onProductClick,
    onItemClick 
}: PressablesListProps) {
    // Filtrar solo los items visibles (por defecto son visibles si no se especifica)
    const visibleItems = items.filter(item => item.visible !== false)
    
    return (
        <div 
            className="w-full mx-auto pinterest-grid" 
            style={{
                transition: 'all 0.3s ease-in-out',
                padding: '0.5rem',
                position: 'relative', // Para permitir el posicionamiento de los elementos hijo
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // Columnas responsivas
                gridGap: '16px', // Espacio entre elementos
                gridAutoRows: 'minmax(min-content, max-content)', // Ajustar altura automáticamente
                // Propiedades de scroll removidas para que funcione con el scroll de la página
            }}
        >
            {visibleItems.map((item, index) => (
                <PressableItem
                    key={item.id}
                    item={item}
                    styleSettings={styleSettings}
                    onProductClick={onProductClick}
                    onItemClick={onItemClick}
                    index={index}
                />
            ))}

            {/* Estilos para personalizar la barra de desplazamiento */}
            <style jsx global>{`
                /* Estilo para el scrollbar personalizado */
                .scrollbar-custom::-webkit-scrollbar {
                    width: 6px;
                }
                
                .scrollbar-custom::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                }
                
                .scrollbar-custom::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 8px;
                }
                
                .scrollbar-custom::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.5);
                }
                
                /* Estilos para Firefox */
                .scrollbar-custom {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
                }
                
                /* Grid estilo Pinterest - Responsivo */
                .pinterest-grid {
                    display: grid;
                    width: 100%;
                }
                
                /* Móvil - 1 columna */
                @media (max-width: 768px) {
                    .pinterest-grid {
                        grid-template-columns: 1fr !important;
                        height: auto !important;
                        max-height: none !important;
                        overflow-y: auto !important;
                        -webkit-overflow-scrolling: touch !important;
                    }
                }
                
                /* Tablet - 2 columnas */
                @media (min-width: 769px) and (max-width: 1199px) {
                    .pinterest-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                
                /* Escritorio - 3 columnas */
                @media (min-width: 1200px) {
                    .pinterest-grid {
                        grid-template-columns: repeat(3, 1fr) !important;
                    }
                }
                
                /* Estilos para los elementos Pinterest */
                .pinterest-item {
                    break-inside: avoid;
                    margin-bottom: 16px;
                    position: relative;
                    border-radius: 16px;
                    overflow: hidden;
                    transform: translateZ(0); /* Mejora el rendimiento de animaciones */
                }
            `}</style>
        </div>
    )
}
