'use client'

import { LinkItem, Product } from '@/types/product'
import { StyleSettings } from '@/utils/links'
import { PressableItem } from './PressableItem'

interface PressablesListProps {
    items: LinkItem[]
    styleSettings: StyleSettings
    onProductClick?: (product: Product) => void
}

export function PressablesList({ 
    items, 
    styleSettings, 
    onProductClick 
}: PressablesListProps) {
    return (
        <div className="w-full max-w-md mx-auto">
            {items.map((item, index) => (
                <PressableItem
                    key={item.id}
                    item={item}
                    styleSettings={styleSettings}
                    onProductClick={onProductClick}
                    index={index}
                />
            ))}
        </div>
    )
}
