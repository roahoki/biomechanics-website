'use client'

import { useState, useEffect } from 'react'
import { ImageCarousel } from './ImageCarousel'

interface Product {
    id: number
    type: 'product'
    title: string
    price: number
    paymentLink: string
    description: string
    images: string[]
}

interface ProductModalProps {
    product: Product | null
    isOpen: boolean
    onClose: () => void
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Resetear index al cambiar producto
    useEffect(() => {
        setCurrentImageIndex(0)
    }, [product?.id])

    // Cerrar modal con ESC
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    // Formatear precio
    const formatPrice = (price: number) => {
        return `$${price.toLocaleString('es-CL')}`
    }

    // Manejar clic en comprar
    const handlePurchase = () => {
        if (product?.paymentLink) {
            window.open(product.paymentLink, '_blank', 'noopener,noreferrer')
        }
    }

    if (!isOpen || !product) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-900">
                        Producto
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Carrusel de imágenes - Solo lectura */}
                    <div className="mb-6">
                        <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                            {product.images.length > 0 ? (
                                <div className="relative w-full h-full">
                                    <img
                                        src={product.images[currentImageIndex]}
                                        alt={`${product.title} - Imagen ${currentImageIndex + 1}`}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Navegación */}
                                    {product.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setCurrentImageIndex(prev => 
                                                    prev > 0 ? prev - 1 : product.images.length - 1
                                                )}
                                                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setCurrentImageIndex(prev => 
                                                    prev < product.images.length - 1 ? prev + 1 : 0
                                                )}
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>

                                            {/* Indicadores */}
                                            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                                {product.images.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setCurrentImageIndex(index)}
                                                        className={`w-3 h-3 rounded-full transition-all ${
                                                            index === currentImageIndex 
                                                                ? 'bg-white' 
                                                                : 'bg-white bg-opacity-50'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.images.length > 1 && (
                            <div className="flex space-x-2 mt-3 overflow-x-auto pb-2">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                            index === currentImageIndex 
                                                ? 'border-blue-500' 
                                                : 'border-gray-300'
                                        }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`Miniatura ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Información del producto */}
                    <div className="space-y-4">
                        {/* Título y precio */}
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {product.title}
                            </h3>
                            <div className="text-3xl font-bold text-green-600">
                                {formatPrice(product.price)}
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900">Descripción</h4>
                            <p className="text-gray-600 leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Botón de compra */}
                        <div className="pt-4">
                            <button
                                onClick={handlePurchase}
                                disabled={!product.paymentLink}
                                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                                    product.paymentLink 
                                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {product.paymentLink ? 'Comprar Ahora' : 'Link de pago no disponible'}
                            </button>
                        </div>

                        {/* Información adicional */}
                        <div className="pt-4 border-t border-gray-200">
                            <div className="text-xs text-gray-500 space-y-1">
                                <p>• Al hacer clic en "Comprar Ahora" serás redirigido a la plataforma de pago</p>
                                <p>• Transacción segura y protegida</p>
                                {product.images.length > 1 && (
                                    <p>• Usa las flechas o toca las miniaturas para ver más imágenes</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
