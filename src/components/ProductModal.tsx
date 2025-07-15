'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Product } from '@/types/product'
import { StyleSettings } from '@/utils/links'

interface ProductModalProps {
    product: Product | null
    isOpen: boolean
    onClose: () => void
    styleSettings?: StyleSettings
}

export function ProductModal({ product, isOpen, onClose, styleSettings }: ProductModalProps) {
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
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price).replace('CLP', '').trim()
    }

    if (!product) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50"
                    />

                    {/* Modal que se desliza desde abajo */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 500 }}
                        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[90vh] overflow-hidden"
                    >
                        <div className="flex flex-col h-full">
                            {/* Header con botón de cerrar */}
                            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <div className="flex-1" />
                            </div>

                            {/* Contenido scrolleable */}
                            <div className="flex-1 overflow-y-auto px-4 pb-4">
                                {/* Carrusel de imágenes */}
                                <div className="mb-6">
                                    {product.images.length > 0 ? (
                                        <div className="relative">
                                            {/* Imagen principal */}
                                            <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                                                <img
                                                    src={product.images[currentImageIndex]}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Navegación del carrusel */}
                                            {product.images.length > 1 && (
                                                <>
                                                    {/* Botones de navegación */}
                                                    <button
                                                        onClick={() => setCurrentImageIndex(
                                                            currentImageIndex === 0 ? product.images.length - 1 : currentImageIndex - 1
                                                        )}
                                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => setCurrentImageIndex(
                                                            currentImageIndex === product.images.length - 1 ? 0 : currentImageIndex + 1
                                                        )}
                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>

                                                    {/* Indicadores de página - líneas horizontales */}
                                                    <div className="flex justify-center mt-4 space-x-1">
                                                        {product.images.map((_, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => setCurrentImageIndex(index)}
                                                                className={`h-1 rounded-full transition-all duration-300 ${
                                                                    index === currentImageIndex 
                                                                        ? 'w-8 bg-gray-800' 
                                                                        : 'w-6 bg-gray-300'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-64 rounded-lg bg-gray-200 flex items-center justify-center">
                                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Título del producto */}
                                <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
                                    {product.title || 'Producto sin título'}
                                </h2>

                                {}{/* Subtítulo del producto */}
                                {product.subtitle && (
                                    <p className="text-gray-600 text-center mb-4">
                                        {product.subtitle}
                                    </p>
                                )}

                                {/* Descripción */}
                                {product.description && (
                                    <p className="text-gray-600 text-center mb-6 leading-relaxed">
                                        {product.description}
                                    </p>
                                )}

                                {/* Precio y botón de compra */}
                                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                                    <div className="text-left">
                                        <span className="text-2xl font-bold text-gray-900">
                                            {formatPrice(product.price)}
                                        </span>
                                    </div>
                                    <a
                                        href={product.paymentLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 rounded-lg font-medium transition-colors text-white"
                                        style={{ 
                                            backgroundColor: styleSettings?.productBuyButtonColor || '#ff6b35',
                                            filter: 'hover:brightness(110%)'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.filter = 'brightness(110%)'
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.filter = 'brightness(100%)'
                                        }}
                                    >
                                        COMPRAR
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}