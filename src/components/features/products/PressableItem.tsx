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

    // Generamos un número basado en el ID o índice del item para que la altura sea constante
    // para el mismo elemento (evitando cambios de altura al cambiar categorías)
    const getRandomHeight = (id: string | number) => {
        // Convertir el ID a string si no lo es
        const idStr = typeof id === 'string' ? id : id.toString();
        // Sumar los valores ASCII de los caracteres para generar un número "aleatorio" pero consistente
        let sum = 0;
        for (let i = 0; i < idStr.length; i++) {
            sum += idStr.charCodeAt(i);
        }
        // Generar un número entre 160 y 300px basado en la suma
        return (sum % 140) + 160;
    };

    // Si es un producto
    if (item.type === 'product') {
        const product = item as Product
        
        // Altura pseudo-aleatoria pero consistente para el mismo producto
        const itemHeight = getRandomHeight(product.id || index);
        
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
                className="w-full pinterest-item"
            >
                <button
                    onClick={() => onProductClick?.(product)}
                    className={`relative w-full rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl bg-cover bg-center bg-no-repeat ${
                        product.images?.length > 0 ? '' : 'bg-gray-200'
                    }`}
                    style={{
                        backgroundImage: product.images?.length > 0 
                            ? `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${product.images[0]})` 
                            : undefined,
                        height: `${itemHeight}px`
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
        
        // Altura pseudo-aleatoria pero consistente para el mismo item
        const itemHeight = getRandomHeight(itemData.id || index);
        
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
                className="w-full pinterest-item"
            >
                <button
                    onClick={() => onItemClick?.(itemData)}
                    className={`relative w-full rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl bg-cover bg-center bg-no-repeat ${
                        itemData.images?.length > 0 ? '' : 'bg-gray-200'
                    }`}
                    style={{
                        backgroundImage: itemData.images?.length > 0 
                            ? `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${itemData.images[0]})` 
                            : undefined,
                        height: `${itemHeight}px`
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

                    {/* Contenido superpuesto */}
                    <div className="absolute inset-0 flex flex-col justify-between p-3">
                        {/* Título y precio centrados en la parte superior */}
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <h3 className="text-white font-bold text-xl text-center drop-shadow-lg">
                                {itemData.title}
                            </h3>
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
            transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
            className="w-full pinterest-item"
        >
            <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl"
                style={{
                    backgroundColor: styleSettings.linkCardBackgroundColor || '#ffffff',
                    color: styleSettings.linkCardTextColor || '#000000',
                    minHeight: '80px', // Altura mínima para links
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
