'use client'

import { ImageCarousel } from '../../common/media/ImageCarousel'
import CategorySelector from '../categories/CategorySelector'
import { Product } from '@/types/product'

interface ProductItemProps {
    product: Product
    availableCategories: string[]
    onUpdate: (id: number, updatedProduct: Partial<Product>) => void
    onRemove: (id: number) => void
}

export function ProductItem({ product, availableCategories, onUpdate, onRemove }: ProductItemProps) {
    // Formatear precio para input
    const formatPriceForInput = (price: number) => {
        return price === 0 ? '' : price.toString()
    }

    // Manejar cambio de precio
    const handlePriceChange = (value: string) => {
        const numericValue = value.replace(/[^\d]/g, '')
        const price = numericValue === '' ? 0 : parseInt(numericValue)
        onUpdate(product.id, { price })
    }

    // Formatear precio para mostrar
    const formatPriceDisplay = (price: number) => {
        return price > 0 ? `$${price.toLocaleString('es-CL')}` : ''
    }

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-600 p-4 space-y-4 w-full max-w-full overflow-hidden">
            {/* Header del producto */}
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h3 className="font-semibold text-white">Producto</h3>
                </div>
                <button
                    type="button"
                    onClick={() => onRemove(product.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-900 hover:bg-opacity-50 text-red-400 hover:text-red-300 transition-colors"
                    title="Eliminar producto"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {/* Carrusel de imágenes */}
            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imágenes del producto
                </label>
                <div className="w-full overflow-hidden">
                    <ImageCarousel
                        images={product.images}
                        onImagesChange={(images) => onUpdate(product.id, { images })}
                        maxImages={10}
                        maxSizeInMB={10}
                    />
                </div>
            </div>

            {/* Título */}
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                    Título del producto *
                </label>
                <input
                    type="text"
                    value={product.title}
                    onChange={(e) => onUpdate(product.id, { title: e.target.value })}
                    placeholder="Ej: Proteína Premium Chocolate"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Subtítulo */}
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                    Subtítulo *
                </label>
                <textarea
                    value={product.subtitle || ''}
                    onChange={(e) => onUpdate(product.id, { subtitle: e.target.value.slice(0, 150) })}
                    placeholder="Descripción breve del producto..."
                    rows={2}
                    maxLength={150}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="text-xs text-gray-400 mt-1">
                    {(product.subtitle || '').length}/150 caracteres
                </div>
            </div>

            {/* Precio */}
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                    Precio (CLP) *
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={formatPriceForInput(product.price)}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        placeholder="25000"
                        className="w-full px-3 py-2 pr-20 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute right-3 top-2 text-gray-300 text-sm">
                        {formatPriceDisplay(product.price)}
                    </div>
                </div>
            </div>

            {/* Link de pago */}
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                    Link de pago *
                </label>
                <input
                    type="url"
                    value={product.paymentLink}
                    onChange={(e) => onUpdate(product.id, { paymentLink: e.target.value })}
                    placeholder="https://ejemplo.com/pago/producto"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Descripción */}
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                    Descripción completa
                </label>
                <textarea
                    value={product.description}
                    onChange={(e) => onUpdate(product.id, { description: e.target.value.slice(0, 1000) })}
                    placeholder="Descripción detallada del producto..."
                    rows={4}
                    maxLength={1000}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="text-xs text-gray-400 mt-1">
                    {product.description.length}/1000 caracteres
                </div>
            </div>

            {/* Categorías */}
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                    Categorías
                </label>
                <CategorySelector
                    availableCategories={availableCategories}
                    selectedCategories={product.categories || []}
                    onChange={(categories) => onUpdate(product.id, { categories })}
                    placeholder="Seleccionar categorías..."
                />
                <p className="text-xs text-gray-400 mt-1">
                    Las categorías permiten filtrar el contenido en la página principal
                </p>
            </div>

            {/* Validación visual */}
            <div className="pt-2 border-t border-gray-600">
                <div className="text-xs text-gray-400">
                    {!product.title && <span className="text-red-400">• Título requerido</span>}
                    {!(product.subtitle || '').trim() && <span className="text-red-400 block">• Subtítulo requerido</span>}
                    {product.price === 0 && <span className="text-red-400 block">• Precio requerido</span>}
                    {!product.paymentLink && <span className="text-red-400 block">• Link de pago requerido</span>}
                    {product.images.length === 0 && <span className="text-amber-400 block">• Se recomienda al menos 1 imagen</span>}
                </div>
            </div>
        </div>
    )
}
