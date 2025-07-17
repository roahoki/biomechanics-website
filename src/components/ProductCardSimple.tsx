'use client'

import { Product } from '@/types/product'
import { motion } from 'framer-motion'

interface ProductCardProps {
    product: Product
    onClick: (product: Product) => void
    linkCardBackgroundColor?: string
    linkCardTextColor?: string
}

export function ProductCard({ product, onClick, linkCardBackgroundColor = '#ffffff', linkCardTextColor = '#000000' }: ProductCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick(product)}
            className="relative w-full h-32 rounded-lg overflow-hidden cursor-pointer shadow-md"
        >
            {/* Imagen de fondo - método directo */}
            {product.images && product.images.length > 0 ? (
                <img
                    src={product.images[0]}
                    alt={product.title || 'Producto'}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            ) : (
                <div 
                    className="absolute inset-0 w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: linkCardBackgroundColor }}
                >
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
            )}

            {/* Overlay oscuro para legibilidad */}
            <div className="absolute inset-0 bg-black bg-opacity-40" />

            {/* Contenido */}
            <div className="absolute inset-0 z-10 flex flex-col justify-between p-3">
                {/* Título centrado */}
                <div className="flex-1 flex items-center justify-center">
                    <h3 className="text-white font-bold text-center text-sm leading-tight drop-shadow-lg">
                        {product.title || 'Producto sin título'}
                    </h3>
                </div>

                {/* Tres puntos en esquina inferior derecha */}
                <div className="flex justify-end">
                    <div className="text-white opacity-80">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
