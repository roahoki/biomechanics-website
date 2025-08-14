'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Item } from '@/types/product'
import { StyleSettings } from '@/utils/links'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import { ImageCarousel } from '@/components/common/media/ImageCarousel'
import { ZoomableImage } from '@/components/common/media/ZoomableImage'

interface ItemModalProps {
    item: Item | null
    isOpen: boolean
    onClose: () => void
    styleSettings?: StyleSettings
}

export function ItemModal({ item, isOpen, onClose, styleSettings }: ItemModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isClient, setIsClient] = useState(false)
    // Referencia al header del modal para el swipe
    const headerRef = useRef<HTMLDivElement>(null)

    // Verificar que estamos en el cliente
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Hook para gestos de swipe en móvil (solo en el header)
    useSwipeGesture({
        onSwipeDown: onClose,
        enabled: isOpen && isClient && window.innerWidth < 768, // Solo en móvil
        threshold: 50,
        targetRef: headerRef // Aplicar solo al header
    })

    // Resetear index al cambiar item
    useEffect(() => {
        setCurrentImageIndex(0)
    }, [item?.id])

    // Cerrar modal con ESC y prevenir scroll del body
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        // Navegación con teclado para el carrusel
        const handleArrowKeys = (e: KeyboardEvent) => {
            if (!item?.images || item.images.length <= 1) return
            
            if (e.key === 'ArrowLeft') {
                e.preventDefault()
                setCurrentImageIndex(prev => 
                    prev === 0 ? item.images.length - 1 : prev - 1
                )
            } else if (e.key === 'ArrowRight') {
                e.preventDefault()
                setCurrentImageIndex(prev => 
                    prev === item.images.length - 1 ? 0 : prev + 1
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
    }, [isOpen, onClose, item?.images])

    // Formatear precio
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price).replace('CLP', '').trim()
    }

    if (!item) return null

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
                            fixed z-50 shadow-2xl
                            md:inset-0 md:m-auto md:max-w-4xl md:max-h-[90vh] md:rounded-xl
                            max-md:inset-x-0 max-md:bottom-0 max-md:rounded-t-2xl max-md:max-h-[90vh]
                            flex flex-col
                        `}
                        style={{
                            backgroundColor: styleSettings?.linkCardBackgroundColor || '#ffffff',
                            color: styleSettings?.linkCardTextColor || '#000000'
                        }}
                    >
                        {/* Header con botón de cerrar */}
                        <div 
                            ref={headerRef}
                            className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200"
                        >
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
                                        {item.images && item.images.length > 0 ? (
                                            <div className="relative">
                                                {/* Imagen principal */}
                                                <div className="w-full aspect-square md:aspect-auto md:h-96 rounded-lg overflow-hidden bg-gray-100">
                                                    <ZoomableImage
                                                        src={item.images[currentImageIndex]}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Navegación del carrusel */}
                                                {item.images.length > 1 && (
                                                    <>
                                                        <button
                                                            onClick={() => setCurrentImageIndex(
                                                                currentImageIndex === 0 ? item.images.length - 1 : currentImageIndex - 1
                                                            )}
                                                            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => setCurrentImageIndex(
                                                                currentImageIndex === item.images.length - 1 ? 0 : currentImageIndex + 1
                                                            )}
                                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>

                                                        {/* Indicadores */}
                                                        <div className="flex justify-center mt-4 space-x-1">
                                                            {item.images.map((_, index) => (
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
                                                            {item.images.map((image, index) => (
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
                                                                        alt={`${item.title} ${index + 1}`}
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

                                    {/* Información del item */}
                                    <div className="md:order-2 md:flex md:flex-col md:justify-between space-y-6">
                                        <div className="space-y-4">
                                            {/* Título */}
                                            <h2 
                                                className="text-2xl md:text-3xl font-bold text-center md:text-left"
                                                style={{ color: styleSettings?.linkCardTextColor || '#000000' }}
                                            >
                                                {item.title || 'Item sin título'}
                                            </h2>

                                            {/* Subtítulo */}
                                            {item.subtitle && (
                                                <p 
                                                    className="text-lg md:text-xl text-center md:text-left opacity-75"
                                                    style={{ color: styleSettings?.linkCardTextColor || '#000000' }}
                                                >
                                                    {item.subtitle}
                                                </p>
                                            )}

                                            {/* Precio (solo si es visible) */}
                                            {item.priceVisible && item.price > 0 && (
                                                <div 
                                                    className="text-2xl md:text-3xl font-bold text-center md:text-left"
                                                    style={{ color: styleSettings?.linkCardTextColor || '#000000' }}
                                                >
                                                    {formatPrice(item.price)}
                                                </div>
                                            )}

                                            {/* Descripción */}
                                            {item.description && (
                                                <div 
                                                    className="opacity-80"
                                                    style={{ color: styleSettings?.linkCardTextColor || '#000000' }}
                                                >
                                                    <p className="leading-relaxed whitespace-pre-wrap">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Botón de acción - desktop */}
                                        <div className="hidden md:block">
                                            <a
                                                href={item.paymentLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 text-white shadow-lg hover:shadow-xl"
                                                style={{ 
                                                    backgroundColor: styleSettings?.itemButtonColor || '#3b82f6'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.filter = 'brightness(110%)'
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.filter = 'brightness(100%)'
                                                }}
                                            >
                                                {item.buttonText || 'Ver más'}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer fijo con botón - solo móvil */}
                        <div 
                            className="md:hidden flex-shrink-0 p-4 border-t border-gray-200"
                            style={{ backgroundColor: styleSettings?.linkCardBackgroundColor || '#ffffff' }}
                        >
                            <div className="flex items-center justify-center">
                                <a
                                    href={item.paymentLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full max-w-md px-6 py-3 rounded-lg font-medium transition-all duration-200 text-white shadow-lg hover:shadow-xl text-center"
                                    style={{ 
                                        backgroundColor: styleSettings?.itemButtonColor || '#3b82f6'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.filter = 'brightness(110%)'
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.filter = 'brightness(100%)'
                                    }}
                                >
                                    {item.buttonText || 'Ver más'}
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
