'use client'

import { useState } from 'react'
import { ImageCarousel } from '@/components/ImageCarousel'

interface Product {
    id: number
    type: 'product'
    title: string
    price: number // En CLP, solo números
    paymentLink: string
    description: string // Máximo 150 caracteres
    images: string[] // 1-3 URLs
}

interface ProductFormProps {
    product?: Product
    onUpdate: (product: Partial<Product>) => void
    onRemove: () => void
}

export function ProductForm({ product, onUpdate, onRemove }: ProductFormProps) {
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Estados locales para los campos
    const [title, setTitle] = useState(product?.title || '')
    const [price, setPrice] = useState(product?.price?.toString() || '')
    const [paymentLink, setPaymentLink] = useState(product?.paymentLink || '')
    const [description, setDescription] = useState(product?.description || '')
    const [images, setImages] = useState<string[]>(product?.images || [])

    // Validaciones
    const validateField = (field: string, value: any) => {
        const newErrors = { ...errors }

        switch (field) {
            case 'title':
                if (!value.trim()) {
                    newErrors.title = 'El título es obligatorio'
                } else if (value.length > 50) {
                    newErrors.title = 'El título debe tener máximo 50 caracteres'
                } else {
                    delete newErrors.title
                }
                break

            case 'price':
                if (!value.trim()) {
                    newErrors.price = 'El precio es obligatorio'
                } else if (!/^\d+$/.test(value)) {
                    newErrors.price = 'Solo se permiten números'
                } else if (parseInt(value) <= 0) {
                    newErrors.price = 'El precio debe ser mayor a 0'
                } else {
                    delete newErrors.price
                }
                break

            case 'paymentLink':
                if (!value.trim()) {
                    newErrors.paymentLink = 'El link de pago es obligatorio'
                } else if (!value.includes('.')) {
                    newErrors.paymentLink = 'Ingresa un link válido'
                } else {
                    delete newErrors.paymentLink
                }
                break

            case 'description':
                if (!value.trim()) {
                    newErrors.description = 'La descripción es obligatoria'
                } else if (value.length > 150) {
                    newErrors.description = 'La descripción debe tener máximo 150 caracteres'
                } else {
                    delete newErrors.description
                }
                break

            case 'images':
                if (!value || value.length === 0) {
                    newErrors.images = 'Debes agregar al menos 1 imagen'
                } else {
                    delete newErrors.images
                }
                break
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Formatear precio para mostrar
    const formatPrice = (priceString: string) => {
        if (!priceString) return ''
        const number = parseInt(priceString.replace(/\D/g, ''))
        if (isNaN(number)) return ''
        return number.toLocaleString('es-CL')
    }

    // Manejar cambios en los campos
    const handleTitleChange = (value: string) => {
        setTitle(value)
        validateField('title', value)
        onUpdate({ title: value })
    }

    const handlePriceChange = (value: string) => {
        // Solo permitir números
        const numbersOnly = value.replace(/\D/g, '')
        setPrice(numbersOnly)
        validateField('price', numbersOnly)
        onUpdate({ price: parseInt(numbersOnly) || 0 })
    }

    const handlePaymentLinkChange = (value: string) => {
        setPaymentLink(value)
        validateField('paymentLink', value)
        onUpdate({ paymentLink: value })
    }

    const handleDescriptionChange = (value: string) => {
        setDescription(value)
        validateField('description', value)
        onUpdate({ description: value })
    }

    const handleImagesChange = (newImages: string[]) => {
        setImages(newImages)
        validateField('images', newImages)
        onUpdate({ images: newImages })
    }

    // Verificar si el producto está completo
    const isComplete = title.trim() && 
                      price && 
                      paymentLink.trim() && 
                      description.trim() && 
                      images.length > 0 &&
                      Object.keys(errors).length === 0

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-green-500">
            {/* Header del producto */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                        Producto {isComplete ? '✅' : '⚠️'}
                    </h3>
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    title="Eliminar producto"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Carrusel de imágenes */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imágenes del producto *
                </label>
                <ImageCarousel
                    images={images}
                    onImagesChange={handleImagesChange}
                    maxImages={3}
                    maxSizeInMB={2}
                />
                {errors.images && (
                    <p className="mt-1 text-sm text-red-600">{errors.images}</p>
                )}
            </div>

            {/* Campos del formulario */}
            <div className="space-y-4">
                {/* Título */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título del producto *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Ej: Jockey Rosado"
                        maxLength={50}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                        }`}
                    />
                    <div className="flex justify-between mt-1">
                        {errors.title && (
                            <p className="text-sm text-red-600">{errors.title}</p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">{title.length}/50</p>
                    </div>
                </div>

                {/* Precio */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio (CLP) *
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                            type="text"
                            value={formatPrice(price)}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            placeholder="15000"
                            className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.price ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                            }`}
                        />
                    </div>
                    {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                    )}
                    {price && !errors.price && (
                        <p className="mt-1 text-sm text-green-600">
                            Se mostrará como: ${formatPrice(price)}
                        </p>
                    )}
                </div>

                {/* Link de pago */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link de pago *
                    </label>
                    <input
                        type="url"
                        value={paymentLink}
                        onChange={(e) => handlePaymentLinkChange(e.target.value)}
                        placeholder="https://mpago.la/2wPmNL9"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.paymentLink ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.paymentLink && (
                        <p className="mt-1 text-sm text-red-600">{errors.paymentLink}</p>
                    )}
                </div>

                {/* Descripción */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción *
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => handleDescriptionChange(e.target.value)}
                        placeholder="Describe tu producto..."
                        maxLength={150}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                            errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                        }`}
                    />
                    <div className="flex justify-between mt-1">
                        {errors.description && (
                            <p className="text-sm text-red-600">{errors.description}</p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">{description.length}/150</p>
                    </div>
                </div>
            </div>

            {/* Estado del producto */}
            <div className="mt-4 p-3 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                        Estado del producto:
                    </span>
                    <span className={`text-sm font-semibold ${
                        isComplete ? 'text-green-600' : 'text-orange-600'
                    }`}>
                        {isComplete ? 'Completo ✅' : 'Incompleto ⚠️'}
                    </span>
                </div>
                {!isComplete && (
                    <p className="text-xs text-gray-500 mt-1">
                        Complete todos los campos obligatorios para que aparezca en la vista previa
                    </p>
                )}
            </div>
        </div>
    )
}
