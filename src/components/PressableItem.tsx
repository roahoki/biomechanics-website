'use client'

import { motion } from 'framer-motion'
import { LinkItem, Product, Item } from '@/types/product'
import { StyleSettings } from '@/utils/links'

interface PressableItemProps {
    item: LinkItem
    styleSettings: StyleSettings
    onProductClick?: (product: Product) => void
    onItemClick?: (item: Item) => void
    index: number
}

export function PressableItem({ 
    item, 
    styleSettings, 
    onProductClick,
    onItemClick, 
    index 
}: PressableItemProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price).replace('CLP', '').trim()
    }

    // Si es un producto
    if (item.type === 'product') {
        const product = item as Product
        
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-full mb-4"
            >
                <button
                    onClick={() => onProductClick?.(product)}
                    className={`relative w-full h-32 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl bg-cover bg-center bg-no-repeat ${
                        product.images?.length > 0 ? '' : 'bg-gray-200'
                    }`}
                    style={{
                        backgroundImage: product.images?.length > 0 
                            ? `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${product.images[0]})` 
                            : undefined
                    }}
                >
                    {/* Fallback para productos sin imagen */}
                    {(!product.images || product.images.length === 0) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    )}

                    {/* Título centrado */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-white font-bold text-xl text-center px-4 drop-shadow-lg">
                            {product.title}
                        </h3>
                    </div>
                </button>
            </motion.div>
        )
    }

    // Si es un item
    if (item.type === 'item') {
        const itemData = item as Item
        
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-full mb-4"
            >
                <button
                    onClick={() => onItemClick?.(itemData)}
                    className={`relative w-full h-32 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl bg-cover bg-center bg-no-repeat ${
                        itemData.images?.length > 0 ? '' : 'bg-gray-200'
                    }`}
                    style={{
                        backgroundImage: itemData.images?.length > 0 
                            ? `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${itemData.images[0]})` 
                            : undefined
                    }}
                >
                    {/* Fallback para items sin imagen */}
                    {(!itemData.images || itemData.images.length === 0) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    )}

                    {/* Título centrado */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-white font-bold text-xl text-center px-4 drop-shadow-lg">
                            {itemData.title}
                        </h3>
                    </div>
                </button>
            </motion.div>
        )
    }

    // Si es un link
    const link = item as any // Link interface
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w-full mb-4"
        >
            <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-16 p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl"
                style={{
                    backgroundColor: styleSettings.linkCardBackgroundColor || '#ffffff',
                    color: styleSettings.linkCardTextColor || '#000000'
                }}
            >
                <div className="flex items-center justify-between h-full">
                    <span className="font-medium text-lg">
                        {link.label}
                    </span>
                    <svg 
                        className="w-5 h-5 opacity-60" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                        />
                    </svg>
                </div>
            </a>
        </motion.div>
    )
}
