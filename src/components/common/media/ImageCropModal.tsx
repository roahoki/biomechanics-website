'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, { 
  Crop, 
  PixelCrop, 
  centerCrop, 
  makeAspectCrop, 
  convertToPixelCrop 
} from 'react-image-crop'
import { XMarkIcon, CheckIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline'
import 'react-image-crop/dist/ReactCrop.css'

interface AspectRatioOption {
  value: number | null
  label: string
  ratio?: string
}

const ASPECT_RATIOS: AspectRatioOption[] = [
  { value: 1, label: 'Cuadrado', ratio: '1:1' },
  { value: 9/16, label: 'Vertical', ratio: '9:16' }
]

interface ImageCropModalProps {
  isOpen: boolean
  imageUrl: string
  onCrop: (croppedImageBlob: Blob, aspectRatio: number) => void
  onCancel: () => void
  defaultAspectRatio?: number | null
}

export default function ImageCropModal({
  isOpen,
  imageUrl,
  onCrop,
  onCancel,
  defaultAspectRatio = 1
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | null>(defaultAspectRatio)
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  // Detectar móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Función para centrar el crop cuando cambia el aspect ratio
  function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number | null,
  ) {
    if (!aspect) {
      // Crop libre - usar 80% de la imagen
      return centerCrop(
        makeAspectCrop({ unit: '%', width: 80 }, mediaWidth / mediaHeight, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight,
      )
    }
    
    return centerCrop(
      makeAspectCrop(
        { unit: '%', width: 90 },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    )
  }

  // Cuando la imagen carga
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, selectedAspectRatio))
  }

  // Cambiar aspect ratio
  const handleAspectRatioChange = (aspectRatio: number | null) => {
    setSelectedAspectRatio(aspectRatio)
    
    if (imgRef.current) {
      const { width, height } = imgRef.current
      setCrop(centerAspectCrop(width, height, aspectRatio))
    }
  }

  // Generar imagen recortada
  const generateCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return

    setIsProcessing(true)

    const image = imgRef.current
    const canvas = previewCanvasRef.current
    const crop = completedCrop

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      setIsProcessing(false)
      return
    }

    const pixelRatio = window.devicePixelRatio || 1

    canvas.width = crop.width * pixelRatio
    canvas.height = crop.height * pixelRatio

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    )

    // Convertir canvas a blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCrop(blob, selectedAspectRatio || 1)
        }
        setIsProcessing(false)
      },
      'image/jpeg',
      0.95
    )
  }, [completedCrop, onCrop, selectedAspectRatio])

  // Manejar teclado
  useEffect(() => {
    if (!isOpen) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      } else if (e.key === 'Enter') {
        generateCroppedImage()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, onCancel, generateCroppedImage])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-90 flex items-center justify-center">
      {isMobile ? (
        /* Modal móvil - Pantalla completa */
        <div className="w-full h-full bg-white flex flex-col">
          {/* Header móvil */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-semibold text-gray-900">Ajustar imagen</h2>
            <div className="flex space-x-2">
              <button
                onClick={onCancel}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isProcessing}
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Selector de formato móvil */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-3">Formato de imagen</p>
            <div className="flex space-x-2 overflow-x-auto">
              {ASPECT_RATIOS.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleAspectRatioChange(option.value)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedAspectRatio === option.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                  disabled={isProcessing}
                >
                  <div className="text-center">
                    <div>{option.label}</div>
                    <div className="text-xs opacity-75">{option.ratio}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Área de crop móvil */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={selectedAspectRatio || undefined}
                minWidth={50}
                minHeight={50}
                className="max-w-full max-h-full"
              >
                <img
                  ref={imgRef}
                  alt="Recorte"
                  src={imageUrl}
                  style={{ 
                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>
          </div>

          {/* Controles móvil */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex justify-between items-center space-x-4">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 text-base text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium"
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                onClick={generateCroppedImage}
                disabled={!completedCrop || isProcessing}
                className="flex-1 px-4 py-3 text-base text-white bg-blue-500 rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <CheckIcon className="w-5 h-5 mr-2" />
                )}
                {isProcessing ? 'Procesando...' : 'Aplicar'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Modal desktop */
        <div className="bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh] max-w-6xl flex flex-col overflow-hidden">
          {/* Header desktop */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Ajustar imagen</h2>
              <p className="text-sm text-gray-500 mt-1">Selecciona el área que quieres mostrar</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isProcessing}
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Panel izquierdo - Imagen y crop */}
            <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={selectedAspectRatio || undefined}
                minWidth={50}
                minHeight={50}
                className="max-w-full max-h-full"
              >
                <img
                  ref={imgRef}
                  alt="Recorte"
                  src={imageUrl}
                  style={{ 
                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>

            {/* Panel derecho - Controles */}
            <div className="w-80 p-6 border-l border-gray-200 flex flex-col">
              {/* Formatos */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Formato de imagen</h3>
                <div className="space-y-2">
                  {ASPECT_RATIOS.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => handleAspectRatioChange(option.value)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        selectedAspectRatio === option.value
                          ? 'bg-blue-50 border-2 border-blue-500 text-blue-900'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700'
                      }`}
                      disabled={isProcessing}
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className="text-sm opacity-75">{option.ratio}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Previsualización */}
              {completedCrop && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Previsualización</h3>
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <canvas
                      ref={previewCanvasRef}
                      className="max-w-full h-auto rounded border"
                      style={{
                        width: Math.min(200, completedCrop.width),
                        height: Math.min(200, completedCrop.height),
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="mt-auto space-y-3">
                <button
                  onClick={generateCroppedImage}
                  disabled={!completedCrop || isProcessing}
                  className="w-full px-4 py-3 text-white bg-blue-500 rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <CheckIcon className="w-5 h-5 mr-2" />
                  )}
                  {isProcessing ? 'Procesando...' : 'Aplicar recorte'}
                </button>
                <button
                  onClick={onCancel}
                  className="w-full px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium"
                  disabled={isProcessing}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas oculto para el procesamiento */}
      <canvas
        ref={previewCanvasRef}
        className="hidden"
      />
    </div>
  )
}
