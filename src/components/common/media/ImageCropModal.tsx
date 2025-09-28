'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Cropper from 'cropperjs'
import { XMarkIcon, CheckIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline'

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
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | null>(defaultAspectRatio)
  const [isMobile, setIsMobile] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cropperInstance, setCropperInstance] = useState<Cropper | null>(null)

  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  // Detectar móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Inicializar Cropper cuando la imagen se carga
  useEffect(() => {
    if (!isOpen || !imgRef.current) return

    const cropper = new Cropper(imgRef.current, {
      aspectRatio: selectedAspectRatio || NaN, // NaN permite ratio libre
      viewMode: 1,
      background: false,
      autoCropArea: 0.8,
      responsive: true,
      restore: false,
      modal: true,
      guides: true,
      center: true,
      highlight: true,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
    })

    setCropperInstance(cropper)

    return () => {
      if (cropper) {
        cropper.destroy()
      }
      setCropperInstance(null)
    }
  }, [isOpen, imageUrl, selectedAspectRatio])

  // Cambiar aspect ratio
  const handleAspectRatioChange = (aspectRatio: number | null) => {
    setSelectedAspectRatio(aspectRatio)
    
    if (cropperInstance) {
      cropperInstance.setAspectRatio(aspectRatio || NaN)
    }
  }

  // Actualizar previsualización
  const updatePreview = useCallback(() => {
    if (!cropperInstance || !previewCanvasRef.current) return

    const cropBoxData = cropperInstance.getCropBoxData()
    const canvasData = cropperInstance.getCanvasData()
    
    if (!cropBoxData || !canvasData) return

    const canvas = previewCanvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return

    const previewSize = 200
    canvas.width = previewSize
    canvas.height = previewSize

    const scaleX = previewSize / cropBoxData.width
    const scaleY = previewSize / cropBoxData.height

    context.drawImage(
      imgRef.current!,
      cropBoxData.left - canvasData.left,
      cropBoxData.top - canvasData.top,
      cropBoxData.width,
      cropBoxData.height,
      0,
      0,
      previewSize,
      previewSize
    )
  }, [cropperInstance])

  // Actualizar previsualización cuando cambie el crop
  useEffect(() => {
    if (!cropperInstance) return

    const handleCrop = () => {
      updatePreview()
    }

    const imgElement = imgRef.current
    imgElement?.addEventListener('crop', handleCrop)
    return () => {
      imgElement?.removeEventListener('crop', handleCrop)
    }
  }, [cropperInstance, updatePreview])

  // Generar imagen recortada
  const generateCroppedImage = useCallback(async () => {
    if (!cropperInstance) return

    setIsProcessing(true)

    try {
      // Obtener el canvas croppeado usando Cropper.js 1.x
      const canvas = cropperInstance.getCroppedCanvas({
        width: 800, // Ancho máximo
        height: 800, // Alto máximo 
        minWidth: 256,
        minHeight: 256,
        maxWidth: 4096,
        maxHeight: 4096,
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      })

      if (!canvas) {
        setIsProcessing(false)
        return
      }

      // Convertir canvas a blob
      canvas.toBlob(
        (blob: Blob | null) => {
          if (blob) {
            onCrop(blob, selectedAspectRatio || 1)
          }
          setIsProcessing(false)
        },
        'image/jpeg',
        0.95
      )
    } catch (error) {
      console.error('Error al generar imagen recortada:', error)
      setIsProcessing(false)
    }
  }, [cropperInstance, onCrop, selectedAspectRatio])

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
              <img
                ref={imgRef}
                alt="Recorte"
                src={imageUrl}
                className="max-w-full max-h-full block"
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              />
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
                disabled={!cropperInstance || isProcessing}
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
              <img
                ref={imgRef}
                alt="Recorte"
                src={imageUrl}
                className="max-w-full max-h-full block"
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              />
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
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Previsualización</h3>
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex justify-center">
                  <canvas
                    ref={previewCanvasRef}
                    className="rounded border"
                    width={200}
                    height={200}
                    style={{
                      width: '200px',
                      height: '200px',
                    }}
                  />
                </div>
              </div>

              {/* Información sobre el recorte */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Instrucciones</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    • Arrastra para mover el área de recorte<br/>
                    • Usa las esquinas para redimensionar<br/>
                    • Selecciona un formato arriba para fijar proporciones
                  </p>
                </div>
              </div>

              {/* Botones */}
              <div className="mt-auto space-y-3">
                <button
                  onClick={generateCroppedImage}
                  disabled={!cropperInstance || isProcessing}
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


    </div>
  )
}
