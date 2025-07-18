'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface ZoomableImageProps {
    src: string
    alt: string
    className?: string
}

export function ZoomableImage({ src, alt, className = '' }: ZoomableImageProps) {
    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [lastTouchDistance, setLastTouchDistance] = useState(0)
    const [lastTouchCenter, setLastTouchCenter] = useState({ x: 0, y: 0 })
    
    const imageRef = useRef<HTMLDivElement>(null)
    const dragStart = useRef({ x: 0, y: 0 })
    const positionStart = useRef({ x: 0, y: 0 })

    // Calcular distancia entre dos puntos táctiles
    const getTouchDistance = (touches: React.TouchList) => {
        if (touches.length < 2) return 0
        const touch1 = touches[0]
        const touch2 = touches[1]
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) + 
            Math.pow(touch2.clientY - touch1.clientY, 2)
        )
    }

    // Calcular centro entre dos puntos táctiles
    const getTouchCenter = (touches: React.TouchList) => {
        if (touches.length < 2) return { x: 0, y: 0 }
        const touch1 = touches[0]
        const touch2 = touches[1]
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        }
    }

    // Resetear zoom y posición
    const resetTransform = useCallback(() => {
        setScale(1)
        setPosition({ x: 0, y: 0 })
    }, [])

    // Manejar inicio de toque
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        e.preventDefault()
        
        if (e.touches.length === 2) {
            // Inicio de pinch zoom
            const distance = getTouchDistance(e.touches)
            const center = getTouchCenter(e.touches)
            setLastTouchDistance(distance)
            setLastTouchCenter(center)
        } else if (e.touches.length === 1 && scale > 1) {
            // Inicio de drag (solo si hay zoom)
            setIsDragging(true)
            const touch = e.touches[0]
            dragStart.current = { x: touch.clientX, y: touch.clientY }
            positionStart.current = { ...position }
        }
    }, [scale, position])

    // Manejar movimiento de toque
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        e.preventDefault()
        
        if (e.touches.length === 2) {
            // Pinch zoom
            const distance = getTouchDistance(e.touches)
            const center = getTouchCenter(e.touches)
            
            if (lastTouchDistance > 0) {
                const scaleChange = distance / lastTouchDistance
                const newScale = Math.min(Math.max(scale * scaleChange, 1), 4) // Límite entre 1x y 4x
                
                setScale(newScale)
                
                // Ajustar posición basada en el centro del pinch
                if (imageRef.current) {
                    const rect = imageRef.current.getBoundingClientRect()
                    const centerX = center.x - rect.left - rect.width / 2
                    const centerY = center.y - rect.top - rect.height / 2
                    
                    setPosition(prev => ({
                        x: prev.x + (centerX - lastTouchCenter.x + rect.left + rect.width / 2) * 0.1,
                        y: prev.y + (centerY - lastTouchCenter.y + rect.top + rect.height / 2) * 0.1
                    }))
                }
            }
            
            setLastTouchDistance(distance)
            setLastTouchCenter(center)
        } else if (e.touches.length === 1 && isDragging && scale > 1) {
            // Drag para pan
            const touch = e.touches[0]
            const deltaX = touch.clientX - dragStart.current.x
            const deltaY = touch.clientY - dragStart.current.y
            
            setPosition({
                x: positionStart.current.x + deltaX,
                y: positionStart.current.y + deltaY
            })
        }
    }, [scale, isDragging, lastTouchDistance, lastTouchCenter, position])

    // Manejar fin de toque
    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 0) {
            setIsDragging(false)
            setLastTouchDistance(0)
            
            // Si el scale es muy pequeño, resetear
            if (scale < 1.1) {
                resetTransform()
            }
        }
    }, [scale, resetTransform])

    // Doble toque para zoom
    const handleDoubleClick = useCallback(() => {
        if (scale === 1) {
            setScale(2)
        } else {
            resetTransform()
        }
    }, [scale, resetTransform])

    // Wheel para zoom en desktop
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault()
        const delta = e.deltaY * -0.01
        const newScale = Math.min(Math.max(scale + delta, 1), 4)
        setScale(newScale)
        
        if (newScale === 1) {
            setPosition({ x: 0, y: 0 })
        }
    }, [scale])

    // Resetear cuando cambie la imagen
    useEffect(() => {
        resetTransform()
    }, [src, resetTransform])

    return (
        <div 
            ref={imageRef}
            className={`relative overflow-hidden touch-none ${className}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={handleDoubleClick}
            onWheel={handleWheel}
        >
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover transition-transform duration-100 ease-out"
                style={{
                    transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                    cursor: scale > 1 ? 'grab' : 'pointer'
                }}
                draggable={false}
            />
            
            {/* Indicador de zoom */}
            {scale > 1 && (
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-sm">
                    {Math.round(scale * 100)}%
                </div>
            )}
            
            {/* Botón de reset solo si hay zoom */}
            {scale > 1 && (
                <button
                    onClick={resetTransform}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            )}
            
            {/* Hint para móviles */}
            {scale === 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md text-xs sm:hidden">
                    Toca dos veces o pellizca para zoom
                </div>
            )}
        </div>
    )
}
