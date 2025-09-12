'use client'

import { useState, useRef } from 'react'
import ImageCropModal from './ImageCropModal'

interface ImageData {
    url: string // Data URL para mostrar
    blob?: Blob // Blob croppeado para subir (si existe)
    aspectRatio: number
}

interface ImageCarouselProps {
    images: string[] // Para compatibilidad hacia atrás
    onImagesChange: (images: string[]) => void
    maxImages?: number
    maxSizeInMB?: number
    bucketName?: string
    folderPrefix?: string
    error?: string
    textColor?: string
    aspectRatios?: number[] // Array de aspect ratios para cada imagen [1, 9/16, 1, ...]
    onAspectRatiosChange?: (aspectRatios: number[]) => void
    // Nuevas props para manejar blobs croppeados
    imageData?: ImageData[]
    onImageDataChange?: (imageData: ImageData[]) => void
}

export function ImageCarousel({ 
    images, 
    onImagesChange, 
    maxImages = 10, 
    maxSizeInMB = 1024,
    bucketName = 'products',
    folderPrefix,
    error: externalError,
    textColor = '#6b7280',
    aspectRatios = [],
    onAspectRatiosChange,
    imageData: propImageData,
    onImageDataChange
}: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(externalError || null)
    const [cropModalOpen, setCropModalOpen] = useState(false)
    const [currentCropImage, setCurrentCropImage] = useState<string | null>(null)
    const [pendingCropIndex, setPendingCropIndex] = useState<number | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const touchStartX = useRef<number>(0)
    const touchEndX = useRef<number>(0)

    // Estado interno para imageData si no se provee desde props
    const [internalImageData, setInternalImageData] = useState<ImageData[]>([])
    
    // Determinar si usar imageData de props o interno
    const usePropsImageData = onImageDataChange !== undefined
    const currentImageData = usePropsImageData ? (propImageData || []) : internalImageData
    const setImageData = usePropsImageData ? onImageDataChange! : setInternalImageData

    // Convertir images array a imageData cuando sea necesario (solo para modo legacy)
    const [syncedWithProps, setSyncedWithProps] = useState(false)
    
    if (!usePropsImageData && images.length > 0 && !syncedWithProps) {
        const convertedData: ImageData[] = images.map((url, index) => ({
            url,
            aspectRatio: aspectRatios[index] || 1
        }))
        setInternalImageData(convertedData)
        setSyncedWithProps(true)
    }



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

        const availableSlots = maxImages - currentImageData.length
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

        // Procesar la primera imagen con crop modal
        const file = files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
            const imageUrl = e.target?.result as string
            setCurrentCropImage(imageUrl)
            setPendingCropIndex(currentImageData.length) // Nueva imagen al final
            setCropModalOpen(true)
        }
        reader.readAsDataURL(file)

        // Limpiar input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // Manejar imagen recortada - FLUJO SIMPLE
    const handleCroppedImage = (croppedBlob: Blob, aspectRatio: number) => {
        // Convertir blob a data URL para mostrar Y para guardar
        const reader = new FileReader()
        reader.onload = (e) => {
            const croppedImageDataURL = e.target?.result as string
            console.log('✅ CROP SUCCESS - Data URL generado:', croppedImageDataURL.substring(0, 50) + '...')
            
            if (pendingCropIndex !== null) {
                if (usePropsImageData) {
                    // Modo con imageData (ItemForm)
                    const newImageData = [...currentImageData]
                    
                    if (pendingCropIndex === currentImageData.length) {
                        // Nueva imagen
                        newImageData.push({
                            url: croppedImageDataURL,
                            aspectRatio
                        })
                        setCurrentIndex(newImageData.length - 1)
                    } else {
                        // Imagen existente editada
                        newImageData[pendingCropIndex] = {
                            url: croppedImageDataURL,
                            aspectRatio
                        }
                    }
                    
                    setImageData(newImageData)
                    
                    // Actualizar arrays legacy para compatibilidad
                    const newImages = newImageData.map(data => data.url)
                    const newAspectRatios = newImageData.map(data => data.aspectRatio)
                    onImagesChange(newImages)
                    if (onAspectRatiosChange) {
                        onAspectRatiosChange(newAspectRatios)
                    }
                } else {
                    // Modo legacy (arrays directos)
                    if (pendingCropIndex === images.length) {
                        // Nueva imagen
                        const newImages = [...images, croppedImageDataURL]
                        const newAspectRatios = [...aspectRatios, aspectRatio]
                        onImagesChange(newImages)
                        if (onAspectRatiosChange) {
                            onAspectRatiosChange(newAspectRatios)
                        }
                        setCurrentIndex(newImages.length - 1)
                    } else {
                        // Imagen existente editada
                        const newImages = [...images]
                        const newAspectRatios = [...aspectRatios]
                        newImages[pendingCropIndex] = croppedImageDataURL
                        newAspectRatios[pendingCropIndex] = aspectRatio
                        onImagesChange(newImages)
                        if (onAspectRatiosChange) {
                            onAspectRatiosChange(newAspectRatios)
                        }
                    }
                }
            }
            
            // Cerrar modal
            setCropModalOpen(false)
            setCurrentCropImage(null)
            setPendingCropIndex(null)
        }
        reader.readAsDataURL(croppedBlob)
    }

    // Cancelar crop
    const handleCancelCrop = () => {
        setCropModalOpen(false)
        setCurrentCropImage(null)
        setPendingCropIndex(null)
    }

    // Editar imagen existente
    const handleEditImage = (index: number) => {
        setCurrentCropImage(currentImageData[index]?.url || images[index])
        setPendingCropIndex(index)
        setCropModalOpen(true)
    }

    // Remover imagen
    const removeImage = (index: number) => {
        const newImageData = currentImageData.filter((_, i) => i !== index)
        setImageData(newImageData)
        
        // Actualizar arrays legacy para compatibilidad
        const newImages = newImageData.map(data => data.url)
        const newAspectRatios = newImageData.map(data => data.aspectRatio)
        onImagesChange(newImages)
        if (onAspectRatiosChange) {
            onAspectRatiosChange(newAspectRatios)
        }
        
        if (currentIndex >= newImageData.length && newImageData.length > 0) {
            setCurrentIndex(newImageData.length - 1)
        }
    }

    // Navegación
    const goToPrevious = () => {
        const totalImages = Math.max(images.length, currentImageData.length)
        setCurrentIndex(prev => prev > 0 ? prev - 1 : totalImages - 1)
    }

    const goToNext = () => {
        const totalImages = Math.max(images.length, currentImageData.length)
        setCurrentIndex(prev => prev < totalImages - 1 ? prev + 1 : 0)
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

        const totalImages = Math.max(images.length, currentImageData.length)
        if (isLeftSwipe && totalImages > 1) {
            goToNext()
        }
        if (isRightSwipe && totalImages > 1) {
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

        const newImageData = [...currentImageData]
        const draggedImageData = newImageData[draggedIndex]

        newImageData.splice(draggedIndex, 1)
        newImageData.splice(dropIndex, 0, draggedImageData)
        
        setImageData(newImageData)
        
        // Actualizar arrays legacy para compatibilidad
        const newImages = newImageData.map(data => data.url)
        const newAspectRatios = newImageData.map(data => data.aspectRatio)
        onImagesChange(newImages)
        if (onAspectRatiosChange) {
            onAspectRatiosChange(newAspectRatios)
        }
        
        setDraggedIndex(null)
        setCurrentIndex(dropIndex)
    }

    return (
        <div className="w-full max-w-sm mx-auto">
            {/* Área principal del carrusel */}
            <div 
                className="relative bg-gray-200 rounded-lg overflow-hidden mb-4"
                style={{
                    aspectRatio: currentImageData.length > 0 && currentImageData[currentIndex] 
                        ? `1 / ${1 / currentImageData[currentIndex].aspectRatio}` 
                        : '1 / 1'
                }}
            >
                {currentImageData.length === 0 ? (
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
                            src={currentImageData[currentIndex]?.url || images[currentIndex]}
                            alt={`Imagen ${currentIndex + 1}`}
                            className="w-full h-full object-cover clickable"
                            draggable={false}
                        />

                        {/* Botones de acción */}
                        <div className="absolute top-2 right-2 flex space-x-2">
                            {/* Botón editar */}
                            <button
                                type="button"
                                onClick={() => handleEditImage(currentIndex)}
                                className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
                                title="Editar imagen"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            
                            {/* Botón eliminar */}
                            <button
                                type="button"
                                onClick={() => removeImage(currentIndex)}
                                className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                                title="Eliminar imagen"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Botones de navegación */}
                        {currentImageData.length > 1 && (
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
                        {currentImageData.length > 1 && (
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                {currentImageData.map((_, index) => (
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
            {currentImageData.length > 0 && currentImageData.length < maxImages && (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors mb-4"
                >
                    Agregar imagen ({currentImageData.length}/{maxImages})
                </button>
            )}

            {/* Thumbnails para reordenar */}
            {currentImageData.length > 1 && (
                <div className="w-full">
                    <div 
                        className="flex space-x-2 overflow-x-auto pb-2 min-h-[4rem] scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300" 
                        style={{ 
                            scrollbarWidth: 'thin',
                            msOverflowStyle: 'none'
                        }}
                    >
                        {currentImageData.map((imageData, index) => (
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
                                    src={imageData.url}
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
            <div 
                className="mt-4 text-xs text-center opacity-60"
                style={{ color: textColor }}
            >
                • Máximo {maxImages} imágenes<br/>
                • Máximo {maxSizeInMB}MB por imagen<br/>
                • Arrastra las miniaturas para reordenar<br/>
                • Desliza para navegar<br/>
                • Toca el icono de edición para ajustar recorte
            </div>

            {/* Modal de crop */}
            {cropModalOpen && currentCropImage && (
                <ImageCropModal
                    isOpen={cropModalOpen}
                    imageUrl={currentCropImage}
                    onCrop={handleCroppedImage}
                    onCancel={handleCancelCrop}
                    defaultAspectRatio={1} // 1:1 por defecto
                />
            )}
        </div>
    )
}
