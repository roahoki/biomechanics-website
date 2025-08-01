'use client'

import { useState, useEffect } from 'react'
import { Item } from '@/types/product'
import { ImageCarousel } from '../../common/media/ImageCarousel'
import { TrashIcon, PlusIcon, PhotoIcon } from '@heroicons/react/24/outline'
import CategorySelector from '../categories/CategorySelector'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

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
        <div 
            className="rounded-lg shadow-md border border-gray-200"
            style={{
                backgroundColor: linkCardBackgroundColor,
                color: linkCardTextColor
            }}
        >
            {/* Header */}
            <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <h3 
                        className="text-lg font-semibold"
                        style={{ color: linkCardTextColor }}
                    >
                        📦 {item ? `Editando Item #${item.id}` : 'Nuevo Item'}
                    </h3>
                    <button
                        onClick={onRemove}
                        className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                        Eliminar
                    </button>
                </div>
            </div>

            {/* Carrusel de imágenes */}
            <div className="p-4 border-b border-gray-200">
                <ImageCarousel
                    images={images}
                    onImagesChange={handleImagesChange}
                    bucketName="items"
                    folderPrefix={item?.id ? `item-${item.id}` : undefined}
                    error={errors.images}
                />
            </div>

            {/* Formulario */}
            <div className="p-6 space-y-4">
                {/* Título */}
                <div>
                    <label 
                        className="block text-sm font-medium mb-1"
                        style={{ color: linkCardTextColor }}
                    >
                        Título *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Ej: Consultora Personalizada"
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

                {/* Subtítulo */}
                <div>
                    <label 
                        className="block text-sm font-medium mb-1"
                        style={{ color: linkCardTextColor }}
                    >
                        Subtítulo
                    </label>
                    <input
                        type="text"
                        value={subtitle}
                        onChange={(e) => handleSubtitleChange(e.target.value)}
                        placeholder="Ej: Sesión de 1 hora para análisis biomecánico"
                        maxLength={150}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.subtitle ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                        }`}
                    />
                    <div className="flex justify-between mt-1">
                        {errors.subtitle && (
                            <p className="text-sm text-red-600">{errors.subtitle}</p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">{subtitle.length}/150</p>
                    </div>
                </div>

                {/* Precio con toggle de visibilidad */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label 
                            className="block text-sm font-medium"
                            style={{ color: linkCardTextColor }}
                        >
                            Precio (CLP) *
                        </label>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Visible:</span>
                            <button
                                type="button"
                                onClick={() => handlePriceVisibleChange(!priceVisible)}
                                className={`p-1 rounded-md transition-colors ${
                                    priceVisible 
                                        ? 'text-green-600 hover:bg-green-50' 
                                        : 'text-gray-400 hover:bg-gray-50'
                                }`}
                                title={priceVisible ? 'Precio visible' : 'Precio oculto'}
                            >
                                {priceVisible ? (
                                    <EyeIcon className="w-5 h-5" />
                                ) : (
                                    <EyeSlashIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                            type="text"
                            value={formatPrice(price)}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            placeholder="25000"
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
                            Se mostrará como: {priceVisible ? `$${formatPrice(price)}` : 'Precio oculto'}
                        </p>
                    )}
                </div>

                {/* Texto del botón */}
                <div>
                    <label 
                        className="block text-sm font-medium mb-1"
                        style={{ color: linkCardTextColor }}
                    >
                        Texto del botón *
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
                            <p className="text-sm text-red-600">{errors.buttonText}</p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">{buttonText.length}/20</p>
                    </div>
                </div>

                {/* Link */}
                <div>
                    <label 
                        className="block text-sm font-medium mb-1"
                        style={{ color: linkCardTextColor }}
                    >
                        Link *
                    </label>
                    <input
                        type="url"
                        value={paymentLink}
                        onChange={(e) => handlePaymentLinkChange(e.target.value)}
                        placeholder="https://ejemplo.com/contacto"
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
                    <label 
                        className="block text-sm font-medium mb-1"
                        style={{ color: linkCardTextColor }}
                    >
                        Descripción *
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => handleDescriptionChange(e.target.value)}
                        placeholder="Describe tu item en detalle..."
                        maxLength={1000}
                        rows={5}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                            errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                        }`}
                    />
                    <div className="flex justify-between mt-1">
                        {errors.description && (
                            <p className="text-sm text-red-600">{errors.description}</p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">{description.length}/1000</p>
                    </div>
                </div>

                {/* Categorías */}
                <div>
                    <label 
                        className="block text-sm font-medium mb-1"
                        style={{ color: linkCardTextColor }}
                    >
                        Categorías
                    </label>
                    <CategorySelector
                        availableCategories={availableCategories}
                        selectedCategories={categories}
                        onChange={handleCategoriesChange}
                        placeholder="Seleccionar categorías..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Las categorías permiten filtrar el contenido en la página principal
                    </p>
                </div>
            </div>

            {/* Estado del item */}
            <div className="mt-4 p-3 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                    <span 
                        className="text-sm font-medium"
                        style={{ color: linkCardTextColor }}
                    >
                        Estado del item:
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
