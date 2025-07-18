'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ZoomableImageProps {
    src: string
    alt: string
    className?: string
}

export function ZoomableImage({ src, alt, className = '' }: ZoomableImageProps) {
    const [isZoomed, setIsZoomed] = useState(false)
    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [lastTouchDistance, setLastTouchDistance] = useState(0)
    const [lastTouchCenter, setLastTouchCenter] = useState({ x: 0, y: 0 })
    const [lastTap, setLastTap] = useState(0)
    
    const containerRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)
    const dragStart = useRef({ x: 0, y: 0 })
    const positionStart = useRef({ x: 0, y: 0 })

    // Calcular distancia entre dos puntos táctiles
    const getTouchDistance = (touches: TouchList) => {
        if (touches.length < 2) return 0
        const touch1 = touches[0]
        const touch2 = touches[1]
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) + 
            Math.pow(touch2.clientY - touch1.clientY, 2)
        )
    }

    // Calcular centro entre dos puntos táctiles
    const getTouchCenter = (touches: TouchList) => {
        if (touches.length < 2) return { x: 0, y: 0 }
        const touch1 = touches[0]
        const touch2 = touches[1]
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        }
    }

    // Calcular centro relativo al contenedor
    const getRelativeCenter = (center: { x: number, y: number }) => {
        if (!containerRef.current) return { x: 0, y: 0 }
        const rect = containerRef.current.getBoundingClientRect()
        return {
            x: center.x - rect.left - rect.width / 2,
            y: center.y - rect.top - rect.height / 2
        }
    }

    // Restringir posición dentro de los límites
    const constrainPosition = (pos: { x: number, y: number }, currentScale: number) => {
        if (!containerRef.current) return pos
        
        const container = containerRef.current.getBoundingClientRect()
        const maxX = (container.width * (currentScale - 1)) / 2
        const maxY = (container.height * (currentScale - 1)) / 2
        
        return {
            x: Math.max(-maxX, Math.min(maxX, pos.x)),
            y: Math.max(-maxY, Math.min(maxY, pos.y))
        }
    }

    // Resetear zoom y posición
    const resetTransform = useCallback(() => {
        setScale(1)
        setPosition({ x: 0, y: 0 })
    }, [])

    // Abrir modal de zoom
    const openZoom = () => {
        setIsZoomed(true)
        resetTransform()
    }

    // Cerrar modal de zoom
    const closeZoom = () => {
        setIsZoomed(false)
        resetTransform()
    }

    // Manejar inicio de toque en modal
    const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault()
        const touches = e.touches
        
        if (touches.length === 1) {
            // Un dedo - preparar para arrastrar
            setIsDragging(true)
            dragStart.current = { x: touches[0].clientX, y: touches[0].clientY }
            positionStart.current = { ...position }
        } else if (touches.length === 2) {
            // Dos dedos - preparar para zoom/pellizco
            setIsDragging(false)
            const distance = getTouchDistance(touches)
            const center = getTouchCenter(touches)
            setLastTouchDistance(distance)
            setLastTouchCenter(getRelativeCenter(center))
        }
    }

    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        const touches = e.touches
        
        if (touches.length === 1 && isDragging && scale > 1) {
            // Arrastrar con un dedo cuando hay zoom
            const deltaX = touches[0].clientX - dragStart.current.x
            const deltaY = touches[0].clientY - dragStart.current.y
            
            const newPosition = {
                x: positionStart.current.x + deltaX,
                y: positionStart.current.y + deltaY
            }
            
            setPosition(constrainPosition(newPosition, scale))
        } else if (touches.length === 2) {
            // Zoom con pellizco
            const distance = getTouchDistance(touches)
            const center = getTouchCenter(touches)
            const relativeCenter = getRelativeCenter(center)
            
            if (lastTouchDistance > 0) {
                const scaleChange = distance / lastTouchDistance
                const newScale = Math.max(1, Math.min(4, scale * scaleChange))
                
                // Calcular nueva posición para mantener el punto focal
                const scaleDiff = newScale / scale
                const newPosition = {
                    x: position.x + (lastTouchCenter.x - position.x) * (1 - scaleDiff),
                    y: position.y + (lastTouchCenter.y - position.y) * (1 - scaleDiff)
                }
                
                setScale(newScale)
                setPosition(newScale === 1 ? { x: 0, y: 0 } : constrainPosition(newPosition, newScale))
            }
            
            setLastTouchDistance(distance)
            setLastTouchCenter(relativeCenter)
        }
    }

    const handleTouchEnd = (e: TouchEvent) => {
        e.preventDefault()
        const currentTime = Date.now()
        const tapLength = currentTime - lastTap
        
        // Detectar doble tap
        if (tapLength < 300 && tapLength > 0 && e.touches.length === 0 && e.changedTouches.length === 1) {
            if (scale === 1) {
                // Zoom in al punto tocado
                const touch = e.changedTouches[0]
                const relativeCenter = getRelativeCenter({ x: touch.clientX, y: touch.clientY })
                setScale(2)
                setPosition(constrainPosition({
                    x: -relativeCenter.x * 0.5,
                    y: -relativeCenter.y * 0.5
                }, 2))
            } else {
                // Zoom out
                resetTransform()
            }
        }
        
        setIsDragging(false)
        setLastTouchDistance(0)
        setLastTap(currentTime)
        
        // Si el scale es menor a 1.1, resetear completamente
        if (scale < 1.1) {
            resetTransform()
        }
    }

    // Eventos de teclado y escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isZoomed) {
                closeZoom()
            }
        }

        if (isZoomed) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            if (isZoomed) {
                document.body.style.overflow = 'unset'
            }
        }
    }, [isZoomed])

    // Añadir event listeners para touch events en el modal
    useEffect(() => {
        if (!isZoomed || !containerRef.current) return

        const container = containerRef.current
        
        container.addEventListener('touchstart', handleTouchStart, { passive: false })
        container.addEventListener('touchmove', handleTouchMove, { passive: false })
        container.addEventListener('touchend', handleTouchEnd, { passive: false })

        return () => {
            container.removeEventListener('touchstart', handleTouchStart)
            container.removeEventListener('touchmove', handleTouchMove)
            container.removeEventListener('touchend', handleTouchEnd)
        }
    }, [isZoomed, position, scale, isDragging, lastTouchDistance, lastTouchCenter, lastTap])

    return (
        <>
            {/* Imagen normal con click para abrir zoom */}
            <img
                src={src}
                alt={alt}
                className={`${className} cursor-zoom-in transition-transform hover:scale-105`}
                onClick={openZoom}
            />

            {/* Modal de zoom */}
            <AnimatePresence>
                {isZoomed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
                        onClick={closeZoom}
                    >
                        {/* Botón de cerrar */}
                        <button
                            onClick={closeZoom}
                            className="absolute top-4 right-4 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-all z-10 backdrop-blur-sm"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Indicadores de instrucciones mejorados */}
                        <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-lg backdrop-blur-sm">
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                                <span>Pellizca para zoom • Doble tap para centrar</span>
                            </div>
                        </div>

                        {/* Contenedor de imagen con zoom */}
                        <div
                            ref={containerRef}
                            className="relative w-full h-full flex items-center justify-center overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.img
                                ref={imageRef}
                                src={src}
                                alt={alt}
                                className="max-w-full max-h-full object-contain select-none"
                                style={{
                                    scale,
                                    x: position.x,
                                    y: position.y,
                                    cursor: scale > 1 ? 'grab' : 'zoom-in'
                                }}
                                animate={{
                                    scale,
                                    x: position.x,
                                    y: position.y
                                }}
                                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                draggable={false}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
