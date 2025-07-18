'use client'

import { Item } from '@/types/product'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'

interface ItemCardProps {
    item: Item
    onClick: (item: Item) => void
    linkCardBackgroundColor?: string
    linkCardTextColor?: string
}

export function ItemCard({ 
    item, 
    onClick, 
    linkCardBackgroundColor = '#ffffff', 
    linkCardTextColor = '#000000'
}: ItemCardProps) {
    const [imageError, setImageError] = useState(false)

    const handleImageError = () => {
        console.error('Error loading image for item:', item.title, 'URL:', item.images[0])
        setImageError(true)
    }

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick(item)}
            className="relative w-full h-32 rounded-lg overflow-hidden cursor-pointer shadow-md"
            style={{
                backgroundColor: linkCardBackgroundColor,
                color: linkCardTextColor
            }}
        >
            {/* Imagen de fondo que ocupa todo el presionable */}
            {item.images.length > 0 ? (
                <>
                    {!imageError ? (
                        /* Usar Next Image con configuración para dominios externos */
                        <Image
                            src={item.images[0]}
                            alt={item.title}
                            fill
                            className="object-cover"
                            onError={handleImageError}
                            sizes="(max-width: 768px) 50vw, 25vw"
                        />
                    ) : (
                        /* Fallback con img regular */
                        <img
                            src={item.images[0]}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={() => console.error('Fallback image also failed:', item.images[0])}
                        />
                    )}
                    {/* Overlay oscuro para mejorar legibilidad del texto */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />
                </>
            ) : (
                <div className="absolute inset-0 bg-gray-600 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
            )}

            {/* Contenido superpuesto - Solo título */}
            <div className="relative z-20 h-full flex items-center justify-center p-3">
                <h3 className="text-white font-bold text-center text-sm leading-tight drop-shadow-lg">
                    {item.title || 'Item sin título'}
                </h3>
            </div>
        </motion.div>
    )
}
