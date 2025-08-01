'use client'

import { useState, useRef } from 'react'

interface ImageCarouselProps {
    images: string[]
    onImagesChange: (images: string[]) => void
    maxImages?: number
    maxSizeInMB?: number
    bucketName?: string
    folderPrefix?: string
    error?: string
}

export function ImageCarousel({ 
    images, 
    onImagesChange, 
    maxImages = 10, 
    maxSizeInMB = 10,
    bucketName = 'products',
    folderPrefix,
    error: externalError 
}: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(externalError || null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const touchStartX = useRef<number>(0)
    const touchEndX = useRef<number>(0)

    // Validar archivo
    const validateFile = (file: File): string | null => {
        if (!file.type.startsWith('image/')) {
            return 'Solo se permiten archivos de imagen'
        }
        if (file.size > maxSizeInMB * 1024 * 1024) {
            return `La imagen debe ser menor a ${maxSizeInMB}MB`
        }
        return null
    }

    // Manejar selección de archivos
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        if (files.length === 0) return

        const availableSlots = maxImages - images.length
        if (files.length > availableSlots) {
            setError(`Solo puedes agregar ${availableSlots} imagen(es) más`)
            return
        }

        setError(null)

        // Validar cada archivo
        for (const file of files) {
            const validation = validateFile(file)
            if (validation) {
                setError(validation)
                return
            }
        }

        // Convertir archivos a URLs para preview
        const newImagePromises = files.map(file => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader()
                reader.onload = (e) => resolve(e.target?.result as string)
                reader.readAsDataURL(file)
            })
        })

        Promise.all(newImagePromises).then(newImages => {
            onImagesChange([...images, ...newImages])
        })

        // Limpiar input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // Remover imagen
    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index)
        onImagesChange(newImages)
        if (currentIndex >= newImages.length && newImages.length > 0) {
            setCurrentIndex(newImages.length - 1)
        }
    }

    // Navegación
    const goToPrevious = () => {
        setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1)
    }

    const goToNext = () => {
        setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0)
    }

    // Touch handlers para swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX
    }

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return
        
        const distance = touchStartX.current - touchEndX.current
        const isLeftSwipe = distance > 50
        const isRightSwipe = distance < -50

        if (isLeftSwipe && images.length > 1) {
            goToNext()
        }
        if (isRightSwipe && images.length > 1) {
            goToPrevious()
        }
    }

    // Drag & Drop para reordenar
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === dropIndex) return

        const newImages = [...images]
        const draggedImage = newImages[draggedIndex]
        newImages.splice(draggedIndex, 1)
        newImages.splice(dropIndex, 0, draggedImage)
        
        onImagesChange(newImages)
        setDraggedIndex(null)
        setCurrentIndex(dropIndex)
    }

    return (
        <div className="w-full max-w-sm mx-auto">
            {/* Área principal del carrusel */}
            <div className="relative bg-gray-200 rounded-lg overflow-hidden aspect-square mb-4">
                {images.length === 0 ? (
                    // Estado vacío
                    <div 
                        className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <p className="text-gray-600 text-sm text-center px-4">
                            Toca para agregar<br/>hasta {maxImages} imágenes
                        </p>
                    </div>
                ) : (
                    // Carrusel con imágenes
                    <div 
                        className="relative w-full h-full"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <img
                            src={images[currentIndex]}
                            alt={`Imagen ${currentIndex + 1}`}
                            className="w-full h-full object-cover clickable"
                            draggable={false}
                        />

                        {/* Botón eliminar */}
                        <button
                            type="button"
                            onClick={() => removeImage(currentIndex)}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Botones de navegación */}
                        {images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={goToPrevious}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={goToNext}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}

                        {/* Indicadores de página */}
                        {images.length > 1 && (
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setCurrentIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${
                                            index === currentIndex 
                                                ? 'bg-white' 
                                                : 'bg-white bg-opacity-50'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Botón agregar más imágenes */}
            {images.length > 0 && images.length < maxImages && (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors mb-4"
                >
                    Agregar imagen ({images.length}/{maxImages})
                </button>
            )}

            {/* Thumbnails para reordenar */}
            {images.length > 1 && (
                <div className="w-full">
                    <div 
                        className="flex space-x-2 overflow-x-auto pb-2 min-h-[4rem] scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300" 
                        style={{ 
                            scrollbarWidth: 'thin',
                            msOverflowStyle: 'none'
                        }}
                    >
                        {images.map((image, index) => (
                            <div
                                key={index}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index)}
                                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-move border-2 transition-all ${
                                    index === currentIndex 
                                        ? 'border-blue-500' 
                                        : 'border-gray-300'
                                } ${draggedIndex === index ? 'opacity-50' : ''}`}
                                onClick={() => setCurrentIndex(index)}
                            >
                                <img
                                    src={image}
                                    alt={`Miniatura ${index + 1}`}
                                    className="w-full h-full object-cover clickable"
                                    draggable={false}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Input de archivo oculto */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Mensaje de error */}
            {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Información */}
            <div className="mt-4 text-xs text-gray-500 text-center">
                • Máximo {maxImages} imágenes<br/>
                • Máximo {maxSizeInMB}MB por imagen<br/>
                • Arrastra las miniaturas para reordenar<br/>
                • Desliza para navegar
            </div>
        </div>
    )
}
