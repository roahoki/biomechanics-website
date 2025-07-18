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
        <div className="w-full max-w-md mx-auto">
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
        </div>
    )
}
