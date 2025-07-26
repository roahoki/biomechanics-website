'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Product } from '@/types/product'
import { StyleSettings } from '@/utils/links'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import { ZoomableImage } from '@/components/ZoomableImage'

interface ProductModalProps {
    product: Product | null
    isOpen: boolean
    onClose: () => void
    styleSettings?: StyleSettings
}

export function ProductModal({ product, isOpen, onClose, styleSettings }: ProductModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isClient, setIsClient] = useState(false)

    // Verificar que estamos en el cliente
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Hook para gestos de swipe en móvil
    useSwipeGesture({
        onSwipeDown: onClose,
        enabled: isOpen && isClient && window.innerWidth < 768, // Solo en móvil
        threshold: 50
    })

    // Resetear index al cambiar producto
    useEffect(() => {
        setCurrentImageIndex(0)
    }, [product?.id])

    // Cerrar modal con ESC y prevenir scroll del body
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        // Navegación con teclado para el carrusel
        const handleArrowKeys = (e: KeyboardEvent) => {
            if (!product?.images || product.images.length <= 1) return
            
            if (e.key === 'ArrowLeft') {
                e.preventDefault()
                setCurrentImageIndex(prev => 
                    prev === 0 ? product.images.length - 1 : prev - 1
                )
            } else if (e.key === 'ArrowRight') {
                e.preventDefault()
                setCurrentImageIndex(prev => 
                    prev === product.images.length - 1 ? 0 : prev + 1
                )
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.addEventListener('keydown', handleArrowKeys)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.removeEventListener('keydown', handleArrowKeys)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose, product?.images])

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

                    {/* Modal - Responsivo */}
                    <motion.div
                        initial={{ 
                            y: isClient && window.innerWidth >= 768 ? -50 : '100%',
                            opacity: isClient && window.innerWidth >= 768 ? 0 : 1,
                            scale: isClient && window.innerWidth >= 768 ? 0.95 : 1
                        }}
                        animate={{ 
                            y: 0,
                            opacity: 1,
                            scale: 1
                        }}
                        exit={{ 
                            y: isClient && window.innerWidth >= 768 ? -50 : '100%',
                            opacity: isClient && window.innerWidth >= 768 ? 0 : 1,
                            scale: isClient && window.innerWidth >= 768 ? 0.95 : 1
                        }}
                        transition={{ type: 'spring', damping: 25, stiffness: 500 }}
                        className={`
                            fixed z-50 bg-white shadow-2xl
                            md:inset-0 md:m-auto md:max-w-4xl md:max-h-[90vh] md:rounded-xl
                            max-md:inset-x-0 max-md:bottom-0 max-md:rounded-t-2xl max-md:max-h-[90vh]
                            flex flex-col
                        `}
                    >
                        {/* Header con botón de cerrar */}
                        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200">
                            <div className="w-8" />
                            {/* Handle visual - solo en móvil */}
                            <div className="w-12 h-1 bg-gray-300 rounded-full md:hidden"></div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Contenido - Layout responsivo */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-6">
                                {/* Layout de dos columnas en desktop */}
                                <div className="md:grid md:grid-cols-2 md:gap-8 space-y-6 md:space-y-0">
                                    {/* Carrusel de imágenes */}
                                    <div className="md:order-1">
                                        {product.images && product.images.length > 0 ? (
                                            <div className="relative">
                                                {/* Imagen principal */}
                                                <div className="w-full aspect-square md:aspect-auto md:h-96 rounded-lg overflow-hidden bg-gray-100">
                                                    <ZoomableImage
                                                        src={product.images[currentImageIndex]}
                                                        alt={product.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Navegación del carrusel */}
                                                {product.images.length > 1 && (
                                                    <>
                                                        <button
                                                            onClick={() => setCurrentImageIndex(
                                                                currentImageIndex === 0 ? product.images.length - 1 : currentImageIndex - 1
                                                            )}
                                                            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => setCurrentImageIndex(
                                                                currentImageIndex === product.images.length - 1 ? 0 : currentImageIndex + 1
                                                            )}
                                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>

                                                        {/* Indicadores */}
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

                                                        {/* Thumbnails en desktop */}
                                                        <div className="hidden md:flex mt-4 space-x-2 overflow-x-auto">
                                                            {product.images.map((image, index) => (
                                                                <button
                                                                    key={index}
                                                                    onClick={() => setCurrentImageIndex(index)}
                                                                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                                                        index === currentImageIndex 
                                                                            ? 'border-gray-800' 
                                                                            : 'border-gray-200 hover:border-gray-400'
                                                                    }`}
                                                                >
                                                                    <img
                                                                        src={image}
                                                                        alt={`${product.title} ${index + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-full aspect-square md:aspect-auto md:h-96 rounded-lg bg-gray-200 flex items-center justify-center">
                                                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Información del producto */}
                                    <div className="md:order-2 md:flex md:flex-col md:justify-between space-y-6">
                                        <div className="space-y-4">
                                            {/* Título */}
                                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center md:text-left">
                                                {product.title || 'Producto sin título'}
                                            </h2>

                                            {/* Subtítulo */}
                                            {product.subtitle && (
                                                <p className="text-lg md:text-xl text-gray-600 text-center md:text-left">
                                                    {product.subtitle}
                                                </p>
                                            )}

                                            {/* Descripción */}
                                            {product.description && (
                                                <div className="text-gray-600">
                                                    <p className="leading-relaxed whitespace-pre-wrap">
                                                        {product.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Botón de comprar - desktop */}
                                        <div className="hidden md:block">
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
                                                    className="px-6 py-3 rounded-lg font-medium transition-all duration-200 text-white shadow-lg hover:shadow-xl"
                                                    style={{ 
                                                        backgroundColor: styleSettings?.productBuyButtonColor || '#ff6b35'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.filter = 'brightness(110%)'
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.filter = 'brightness(100%)'
                                                    }}
                                                >
                                                    COMPRAR AHORA
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer fijo con precio y botón - solo móvil */}
                        <div className="md:hidden flex-shrink-0 p-4 border-t border-gray-200 bg-white">
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
                                    className="px-6 py-3 rounded-lg font-medium transition-all duration-200 text-white shadow-lg hover:shadow-xl"
                                    style={{ 
                                        backgroundColor: styleSettings?.productBuyButtonColor || '#ff6b35'
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
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}