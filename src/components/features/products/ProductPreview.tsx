'use client'

import { useState } from 'react'

interface Product {
    id: number
    type: 'product'
    title: string
    price: number
    paymentLink: string
    description: string
    images: string[]
}

interface ProductPreviewProps {
    product: Product
    onClick?: () => void
    className?: string
}

export function ProductPreview({ product, onClick, className = '' }: ProductPreviewProps) {
    const [imageIndex, setImageIndex] = useState(0)
    const [imageError, setImageError] = useState(false)

    // Formatear precio
    const formatPrice = (price: number) => {
        return `$${price.toLocaleString('es-CL')}`
    }

    // Manejar error de imagen
    const handleImageError = () => {
        setImageError(true)
    }

    // Cambiar imagen del producto (si hay múltiples)
    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (product.images.length > 1) {
            setImageIndex((prev) => (prev + 1) % product.images.length)
        }
    }

    return (
        <div 
            className={`relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer transform hover:scale-[1.02] ${className}`}
            onClick={onClick}
        >
            {/* Imagen del producto */}
            <div className="relative h-48 bg-gray-200">
                {!imageError && product.images[imageIndex] ? (
                    <img
                        src={product.images[imageIndex]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                        onClick={handleImageClick}
                    />
                ) : (
                    // Fallback si no hay imagen o falla la carga
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                )}

                {/* Indicador de múltiples imágenes */}
                {product.images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                        {imageIndex + 1}/{product.images.length}
                    </div>
                )}

                {/* Badge de producto */}
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    PRODUCTO
                </div>
            </div>

            {/* Contenido del producto */}
            <div className="p-4">
                {/* Título y precio */}
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                        {product.title}
                    </h3>
                    <div className="ml-2 text-right">
                        <p className="text-xl font-bold text-green-600">
                            {formatPrice(product.price)}
                        </p>
                    </div>
                </div>

                {/* Descripción */}
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {product.description}
                </p>

                {/* Botón de acción */}
                <button 
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    onClick={(e) => {
                        e.stopPropagation()
                        if (onClick) onClick()
                    }}
                >
                    Ver Producto
                </button>
            </div>

            {/* Efecto hover sutil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    )
}
