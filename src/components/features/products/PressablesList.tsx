'use client'

import { LinkItem, Product, Item } from '@/types/product'
import { StyleSettings } from '@/utils/links'
import { PressableItem } from './PressableItem'
import { useEffect, useRef, useState } from 'react'

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
    
    const containerRef = useRef<HTMLDivElement>(null)
    const [masonryStyle, setMasonryStyle] = useState<React.CSSProperties>({})
    const [itemPositions, setItemPositions] = useState<Array<{top: number, left: number, width: number}>>([])
    
    // Hook para calcular el layout masonry
    useEffect(() => {
        const calculateMasonryLayout = () => {
            if (!containerRef.current) return
            
            const container = containerRef.current
            const containerWidth = container.offsetWidth
            const gap = 12 // Gap más pequeño estilo Pinterest
            
            // Calcular número de columnas estilo Pinterest (más densidad)
            let columns = 2 // Mínimo 2 columnas en móvil
            if (containerWidth >= 1400) columns = 5 // Desktop grande
            else if (containerWidth >= 1024) columns = 4 // Desktop
            else if (containerWidth >= 768) columns = 3 // Tablet
            
            const itemWidth = Math.floor((containerWidth - gap * (columns - 1)) / columns)
            const columnHeights = new Array(columns).fill(0)
            const positions: Array<{top: number, left: number, width: number}> = []
            
            // Obtener todos los elementos hijos
            const items = Array.from(container.children) as HTMLElement[]
            
            items.forEach((item, index) => {
                if (item.classList.contains('pinterest-item')) {
                    // Encontrar la columna más corta
                    const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights))
                    
                    const left = shortestColumn * (itemWidth + gap)
                    const top = columnHeights[shortestColumn]
                    
                    positions.push({ top, left, width: itemWidth })
                    
                    // Actualizar la altura de la columna
                    columnHeights[shortestColumn] += item.offsetHeight + gap
                }
            })
            
            setItemPositions(positions)
            
            // Establecer la altura total del contenedor
            const maxHeight = Math.max(...columnHeights)
            setMasonryStyle({
                height: `${maxHeight}px`,
                position: 'relative'
            })
        }
        
        // Calcular layout después del render inicial
        const timeoutId = setTimeout(calculateMasonryLayout, 200)
        
        // Recalcular en resize
        const handleResize = () => {
            setTimeout(calculateMasonryLayout, 200)
        }
        
        window.addEventListener('resize', handleResize)
        
        return () => {
            clearTimeout(timeoutId)
            window.removeEventListener('resize', handleResize)
        }
    }, [visibleItems])
    
    return (
        <div 
            ref={containerRef}
            className="w-full mx-auto pinterest-grid-js" 
            style={{
                ...masonryStyle,
                transition: 'all 0.3s ease-in-out',
                padding: '0.5rem',
            }}
        >
            {visibleItems.map((item, index) => (
                <div
                    key={item.id}
                    className="pinterest-item"
                    style={{
                        position: itemPositions[index] ? 'absolute' : 'static',
                        top: itemPositions[index]?.top || 0,
                        left: itemPositions[index]?.left || 0,
                        width: itemPositions[index]?.width || '100%',
                        transition: 'all 0.3s ease-in-out',
                    }}
                >
                    <PressableItem
                        item={item}
                        styleSettings={styleSettings}
                        onProductClick={onProductClick}
                        onItemClick={onItemClick}
                        index={index}
                    />
                </div>
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
                
                /* Grid estilo Pinterest masonry con JavaScript */
                .pinterest-grid-js {
                    width: 100%;
                    --columns: 1;
                }
                
                /* Variables CSS para columnas responsivas estilo Pinterest */
                .pinterest-grid-js {
                    --columns: 2; /* Mínimo 2 en móvil */
                }
                
                @media (min-width: 768px) and (max-width: 1023px) {
                    .pinterest-grid-js {
                        --columns: 3; /* 3 en tablet */
                    }
                }
                
                @media (min-width: 1024px) and (max-width: 1399px) {
                    .pinterest-grid-js {
                        --columns: 4; /* 4 en desktop */
                    }
                }
                
                @media (min-width: 1400px) {
                    .pinterest-grid-js {
                        --columns: 5; /* 5 en desktop grande */
                    }
                }
                
                /* Estilos para los elementos Pinterest */
                .pinterest-item {
                    border-radius: 16px;
                    overflow: hidden;
                    transform: translateZ(0); /* Mejora el rendimiento de animaciones */
                }
            `}</style>
        </div>
    )
}
