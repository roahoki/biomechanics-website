'use client'

import { motion } from 'framer-motion'
import { LinkItem, Product } from '@/types/product'
import { StyleSettings } from '@/utils/links'

interface PressableItemProps {
    item: LinkItem
    styleSettings: StyleSettings
    onProductClick?: (product: Product) => void
    index: number
}

export function PressableItem({ 
    item, 
    styleSettings, 
    onProductClick, 
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
                    className="w-full p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    style={{
                        backgroundColor: styleSettings.linkCardBackgroundColor || '#ffffff',
                        color: styleSettings.linkCardTextColor || '#000000'
                    }}
                >
                    <div className="flex items-center space-x-4">
                        {/* Imagen del producto */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Información del producto */}
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-lg mb-1">
                                {product.title}
                            </h3>
                            {product.subtitle && (
                                <p className="text-sm opacity-75 mb-2">
                                    {product.subtitle}
                                </p>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold">
                                    {formatPrice(product.price)}
                                </span>
                                <div 
                                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                                    style={{
                                        backgroundColor: styleSettings.productBuyButtonColor || '#ff6b35'
                                    }}
                                >
                                    Ver producto
                                </div>
                            </div>
                        </div>
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
                className="block w-full p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl"
                style={{
                    backgroundColor: styleSettings.linkCardBackgroundColor || '#ffffff',
                    color: styleSettings.linkCardTextColor || '#000000'
                }}
            >
                <div className="flex items-center justify-between">
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
