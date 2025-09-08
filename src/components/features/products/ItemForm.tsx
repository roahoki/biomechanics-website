'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { EyeIcon, EyeSlashIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Item } from '@/types/product'
import { ImageCarousel, CategorySelector } from '@/components'

interface ItemFormProps {
    item?: Item
    availableCategories: string[]
    onUpdate: (item: Partial<Item>) => void
    onRemove: () => void
    linkCardBackgroundColor?: string
    linkCardTextColor?: string
}

export function ItemForm({ 
    item, 
    availableCategories, 
    onUpdate, 
    onRemove,
    linkCardBackgroundColor = '#ffffff',
    linkCardTextColor = '#000000'
}: ItemFormProps) {
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Estados locales para los campos
    const [title, setTitle] = useState(item?.title || '')
    const [subtitle, setSubtitle] = useState(item?.subtitle || '')
    const [price, setPrice] = useState(item?.price?.toString() || '')
    const [priceVisible, setPriceVisible] = useState(item?.priceVisible ?? true)
    const [buttonText, setButtonText] = useState(item?.buttonText || 'Ver más')
    const [paymentLink, setPaymentLink] = useState(item?.paymentLink || '')
    const [description, setDescription] = useState(item?.description || '')
    const [images, setImages] = useState<string[]>(item?.images || [])
    const [categories, setCategories] = useState<string[]>(item?.categories || [])

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

            case 'subtitle':
                if (value.length > 150) {
                    newErrors.subtitle = 'El subtítulo debe tener máximo 150 caracteres'
                } else {
                    delete newErrors.subtitle
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

            case 'buttonText':
                if (!value.trim()) {
                    newErrors.buttonText = 'El texto del botón es obligatorio'
                } else if (value.length > 20) {
                    newErrors.buttonText = 'El texto del botón debe tener máximo 20 caracteres'
                } else {
                    delete newErrors.buttonText
                }
                break

            case 'paymentLink':
                if (!value.trim()) {
                    newErrors.paymentLink = 'El link es obligatorio'
                } else if (!value.includes('.')) {
                    newErrors.paymentLink = 'Ingresa un link válido'
                } else {
                    delete newErrors.paymentLink
                }
                break

            case 'description':
                if (!value.trim()) {
                    newErrors.description = 'La descripción es obligatoria'
                } else if (value.length > 1000) {
                    newErrors.description = 'La descripción debe tener máximo 1000 caracteres'
                } else {
                    delete newErrors.description
                }
                break

            case 'images':
                if (!value || value.length === 0) {
                    newErrors.images = 'Debes agregar al menos 1 imagen'
                } else if (value.length > 10) {
                    newErrors.images = 'No puedes tener más de 10 imágenes'
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

    // Handlers para los campos
    const handleTitleChange = (value: string) => {
        setTitle(value)
        validateField('title', value)
        onUpdate({ title: value })
    }

    const handleSubtitleChange = (value: string) => {
        setSubtitle(value)
        validateField('subtitle', value)
        onUpdate({ subtitle: value })
    }

    const handlePriceChange = (value: string) => {
        const cleanValue = value.replace(/\D/g, '')
        setPrice(cleanValue)
        validateField('price', cleanValue)
        onUpdate({ price: parseInt(cleanValue) || 0 })
    }

    const handlePriceVisibleChange = (visible: boolean) => {
        setPriceVisible(visible)
        onUpdate({ priceVisible: visible })
    }

    const handleButtonTextChange = (value: string) => {
        setButtonText(value)
        validateField('buttonText', value)
        onUpdate({ buttonText: value })
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

    const handleCategoriesChange = (newCategories: string[]) => {
        setCategories(newCategories)
        onUpdate({ categories: newCategories })
    }

    // Verificar si el item está completo
    const isComplete = title.trim() && price && buttonText.trim() && paymentLink.trim() && 
                      description.trim() && images.length > 0 && 
                      Object.keys(errors).length === 0

    return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header mobile-first */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                    {item ? 'Editar Item' : 'Crear Item'}
                </h3>
                <button
                    onClick={onRemove}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Eliminar item"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Layout móvil primero, desktop después */}
            <div className="flex flex-col lg:flex-row">
                {/* Preview de imágenes - Más prominente en móvil */}
                <div className="w-full lg:w-1/2 p-4 lg:p-6 bg-gray-50">
                    <div className="max-w-full lg:max-w-md mx-auto">
                        <ImageCarousel
                            images={images}
                            onImagesChange={handleImagesChange}
                            bucketName="items"
                            folderPrefix={item?.id ? `item-${item.id}` : undefined}
                            error={errors.images}
                            textColor="#374151"
                        />
                    </div>
                </div>

                {/* Formulario - Optimizado para móvil */}
                <div className="w-full lg:w-1/2 p-4 lg:p-6 space-y-4 lg:space-y-6">
                    {/* Campos principales - Siempre visibles */}
                    <div className="space-y-4">
                        {/* Título */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Título *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Añade un título"
                                maxLength={50}
                                className={`w-full px-3 py-3 text-base lg:text-lg border-0 border-b-2 bg-transparent focus:outline-none focus:border-blue-500 placeholder-gray-400 ${
                                    errors.title ? 'border-red-300' : 'border-gray-200'
                                }`}
                            />
                            <div className="flex justify-between mt-1">
                                {errors.title && (
                                    <p className="text-sm text-red-500">{errors.title}</p>
                                )}
                                <span className="text-xs text-gray-400 ml-auto">
                                    {title.length}/50
                                </span>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción *
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => handleDescriptionChange(e.target.value)}
                                placeholder="Describe tu item..."
                                maxLength={1000}
                                rows={3}
                                className={`w-full px-3 py-3 border-0 border-b-2 bg-transparent resize-none focus:outline-none focus:border-blue-500 placeholder-gray-400 ${
                                    errors.description ? 'border-red-300' : 'border-gray-200'
                                }`}
                            />
                            <div className="flex justify-between mt-1">
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                                <span className="text-xs text-gray-400 ml-auto">
                                    {description.length}/1000
                                </span>
                            </div>
                        </div>

                        {/* Precio - Simplificado para móvil */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Precio (CLP) *
                                </label>
                                <button
                                    type="button"
                                    onClick={() => handlePriceVisibleChange(!priceVisible)}
                                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                                        priceVisible 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-gray-100 text-gray-500'
                                    }`}
                                >
                                    {priceVisible ? (
                                        <EyeIcon className="w-3 h-3" />
                                    ) : (
                                        <EyeSlashIcon className="w-3 h-3" />
                                    )}
                                    <span>{priceVisible ? 'Visible' : 'Oculto'}</span>
                                </button>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                    $
                                </span>
                                <input
                                    type="text"
                                    value={formatPrice(price)}
                                    onChange={(e) => handlePriceChange(e.target.value)}
                                    placeholder="25000"
                                    className={`w-full pl-8 pr-3 py-3 border-0 border-b-2 bg-transparent focus:outline-none focus:border-blue-500 placeholder-gray-400 ${
                                        errors.price ? 'border-red-300' : 'border-gray-200'
                                    }`}
                                />
                            </div>
                            {errors.price && (
                                <p className="text-sm text-red-500 mt-1">{errors.price}</p>
                            )}
                        </div>

                        {/* Link */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enlace *
                            </label>
                            <input
                                type="url"
                                value={paymentLink}
                                onChange={(e) => handlePaymentLinkChange(e.target.value)}
                                placeholder="https://..."
                                className={`w-full px-3 py-3 border-0 border-b-2 bg-transparent focus:outline-none focus:border-blue-500 placeholder-gray-400 ${
                                    errors.paymentLink ? 'border-red-300' : 'border-gray-200'
                                }`}
                            />
                            {errors.paymentLink && (
                                <p className="text-sm text-red-500 mt-1">{errors.paymentLink}</p>
                            )}
                        </div>
                    </div>

                    {/* Configuraciones adicionales - Colapsables en móvil */}
                    <details className="lg:hidden group">
                        <summary className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <span className="text-sm font-medium text-gray-700">
                                Configuraciones adicionales
                            </span>
                            <svg 
                                className="w-4 h-4 transition-transform group-open:rotate-180" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </summary>
                        <div className="mt-3 space-y-4 p-3">
                            {/* Subtítulo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subtítulo
                                </label>
                                <input
                                    type="text"
                                    value={subtitle}
                                    onChange={(e) => handleSubtitleChange(e.target.value)}
                                    placeholder="Subtítulo opcional"
                                    maxLength={150}
                                    className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder-gray-400 ${
                                        errors.subtitle ? 'border-red-300' : ''
                                    }`}
                                />
                                <div className="flex justify-between mt-1">
                                    {errors.subtitle && (
                                        <p className="text-sm text-red-500">{errors.subtitle}</p>
                                    )}
                                    <span className="text-xs text-gray-400 ml-auto">
                                        {subtitle.length}/150
                                    </span>
                                </div>
                            </div>

                            {/* Texto del botón */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Texto del botón
                                </label>
                                <input
                                    type="text"
                                    value={buttonText}
                                    onChange={(e) => handleButtonTextChange(e.target.value)}
                                    placeholder="Ver más"
                                    maxLength={20}
                                    className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 ${
                                        errors.buttonText ? 'border-red-300' : ''
                                    }`}
                                />
                                {errors.buttonText && (
                                    <p className="text-sm text-red-500 mt-1">{errors.buttonText}</p>
                                )}
                            </div>

                            {/* Categorías */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Categorías
                                </label>
                                <CategorySelector
                                    availableCategories={availableCategories}
                                    selectedCategories={categories}
                                    onChange={handleCategoriesChange}
                                    placeholder="Selecciona categorías..."
                                    label=""
                                />
                            </div>
                        </div>
                    </details>

                    {/* Configuraciones adicionales - Siempre visibles en desktop */}
                    <div className="hidden lg:block space-y-6">
                        {/* Categorías */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Categorías
                            </label>
                            <div className="relative">
                                <CategorySelector
                                    availableCategories={availableCategories}
                                    selectedCategories={categories}
                                    onChange={handleCategoriesChange}
                                    placeholder="Selecciona categorías..."
                                    label=""
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Las categorías ayudan a organizar el contenido
                            </p>
                        </div>

                        {/* Subtítulo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subtítulo
                            </label>
                            <input
                                type="text"
                                value={subtitle}
                                onChange={(e) => handleSubtitleChange(e.target.value)}
                                placeholder="Añade un subtítulo (opcional)"
                                maxLength={150}
                                className={`w-full px-0 py-3 border-0 border-b-2 bg-transparent focus:outline-none focus:border-blue-500 placeholder-gray-400 ${
                                    errors.subtitle ? 'border-red-300' : 'border-gray-200'
                                }`}
                            />
                            <div className="flex justify-between mt-1">
                                {errors.subtitle && (
                                    <p className="text-sm text-red-500">{errors.subtitle}</p>
                                )}
                                <span className="text-xs text-gray-400 ml-auto">
                                    {subtitle.length}/150
                                </span>
                            </div>
                        </div>

                        {/* Texto del botón */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Texto del botón
                            </label>
                            <input
                                type="text"
                                value={buttonText}
                                onChange={(e) => handleButtonTextChange(e.target.value)}
                                placeholder="Ver más"
                                maxLength={20}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.buttonText ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                                }`}
                            />
                            <div className="flex justify-between mt-1">
                                {errors.buttonText && (
                                    <p className="text-sm text-red-500">{errors.buttonText}</p>
                                )}
                                <span className="text-xs text-gray-400 ml-auto">
                                    {buttonText.length}/20
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Estado del item - Mobile-friendly */}
                    <div className="mt-6">
                        <div className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                            isComplete 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-yellow-50 border border-yellow-200'
                        }`}>
                            <span className="text-sm font-medium text-gray-700">
                                Estado:
                            </span>
                            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                                isComplete 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {isComplete ? '✅ Listo' : '⚠️ Incompleto'}
                            </span>
                        </div>
                        
                        {!isComplete && (
                            <p className="text-xs text-gray-500 text-center mt-2">
                                Completa los campos obligatorios (*)
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
