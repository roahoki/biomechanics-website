import { useEffect, useRef } from 'react'
import Sortable from 'sortablejs'
import { LinkCard } from './LinkCard'
import { ProductItem } from '../ProductItem'
import { LinkItem, Product } from '@/types/product'

interface LinksListProps {
    currentLinks: LinkItem[]
    onAddNewLink: () => void
    onAddNewProduct: () => void
    onRemoveLink: (id: number) => void
    onUpdateLink: (id: number, field: 'url' | 'label', value: string) => void
    onUpdateProduct: (id: number, updatedProduct: Partial<Product>) => void
    linkCardBackgroundColor: string
    linkCardTextColor: string
}

export function LinksListUpdated({ 
    currentLinks,
    onAddNewLink,
    onAddNewProduct,
    onRemoveLink,
    onUpdateLink,
    onUpdateProduct,
    linkCardBackgroundColor,
    linkCardTextColor
}: LinksListProps) {
    const listRef = useRef<HTMLUListElement>(null)

    useEffect(() => {
        if (listRef.current) {
            Sortable.create(listRef.current, {
                animation: 150,
                ghostClass: 'bg-gray-200',
            })
        }
    }, [])

    return (
        <div className="w-full max-w-md">
            {/* Botones para agregar nuevo link o producto */}
            <div className="mb-4 flex justify-center space-x-3">
                <button
                    type="button"
                    onClick={onAddNewLink}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Agregar Link</span>
                </button>
                
                <button
                    type="button"
                    onClick={onAddNewProduct}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Agregar Producto</span>
                </button>
            </div>

            <ul ref={listRef} className="space-y-4">
                {currentLinks.map((item) => (
                    <li key={item.id}>
                        {item.type === 'product' ? (
                            <ProductItem
                                product={item}
                                onUpdate={onUpdateProduct}
                                onRemove={onRemoveLink}
                            />
                        ) : (
                            <LinkCard
                                link={item}
                                onRemove={onRemoveLink}
                                onUpdate={onUpdateLink}
                                linkCardBackgroundColor={linkCardBackgroundColor}
                                linkCardTextColor={linkCardTextColor}
                            />
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}
