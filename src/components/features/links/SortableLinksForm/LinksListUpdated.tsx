import { useState, useEffect } from 'react'
import { LinkCard } from './LinkCard'
import { ProductItem } from '../../products/ProductItem'
import { ItemForm } from '../../products/ItemForm'
import ListView from '../../../common/ui/ListView'
import CategoryManagerCompact from '../../categories/CategoryManagerCompact'
import { LinkItem, Product, Item, Link } from '@/types/product'

interface LinksListProps {
    currentLinks: LinkItem[]
    availableCategories: string[]
    onAddNewLink: () => void
    onAddNewProduct: () => void
    onAddNewItem: () => void
    onRemoveLink: (id: number) => void
    onUpdateLink: (id: number, field: 'url' | 'label', value: string) => void
    onUpdateLinkCategories: (id: number, categories: string[]) => void
    onUpdateProduct: (id: number, updatedProduct: Partial<Product>) => void
    onUpdateItem: (id: number, updatedItem: Partial<Item>) => void
    onReorderLinks: (newOrder: LinkItem[]) => void
    onToggleVisibility: (id: number) => void
    onCategoriesChange: (categories: string[]) => void // changed
    linkCardBackgroundColor: string
    linkCardTextColor: string
}

export function LinksListUpdated({ 
    currentLinks,
    availableCategories,
    onAddNewLink,
    onAddNewProduct,
    onAddNewItem,
    onRemoveLink,
    onUpdateLink,
    onUpdateLinkCategories,
    onUpdateProduct,
    onUpdateItem,
    onReorderLinks,
    onToggleVisibility,
    onCategoriesChange,
    linkCardBackgroundColor,
    linkCardTextColor
}: LinksListProps) {
    const [viewMode, setViewMode] = useState<'detail' | 'list'>('detail')

    // Atajo: Ctrl + Shift -> cambiar a vista listado
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey) {
                // Evitar interferir con otros atajos como Ctrl+Shift+C etc. solo si no hay otra tecla distinta a shift/control
                // Si se presiona una letra adicional el keydown será de esa letra, este bloque aún se ejecutará
                setViewMode('list')
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    // Funciones para manejo de reordenamiento
    const handleMoveUp = (index: number) => {
        if (index === 0) return
        const newOrder = [...currentLinks]
        const temp = newOrder[index]
        newOrder[index] = newOrder[index - 1]
        newOrder[index - 1] = temp
        onReorderLinks(newOrder)
    }

    const handleMoveDown = (index: number) => {
        if (index === currentLinks.length - 1) return
        const newOrder = [...currentLinks]
        const temp = newOrder[index]
        newOrder[index] = newOrder[index + 1]
        newOrder[index + 1] = temp
        onReorderLinks(newOrder)
    }

    const handleToggleVisibilityByIndex = (index: number) => {
        const item = currentLinks[index]
        onToggleVisibility(item.id)
    }

    const handleDeleteByIndex = (index: number) => {
        const item = currentLinks[index]
        if (window.confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
            onRemoveLink(item.id)
        }
    }

    const handleEditByIndex = (index: number) => {
        // Para editar, cambiar a vista detalle
        setViewMode('detail')
    }

    return (
        <div className="w-full space-y-6">
            {/* 1. Enlaces y productos - Botones de agregar responsivos */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Enlaces y productos</h3>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <button
                        onClick={onAddNewLink}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                        <span className="sm:hidden">➕ Enlace</span>
                        <span className="hidden sm:inline">➕ Agregar enlace</span>
                    </button>
                    {/* <button
                        onClick={onAddNewProduct}
                        className=""
                    >
                        <span className="sm:hidden">📦 Producto</span>
                        <span className="hidden sm:inline">📦 Agregar producto</span>
                    </button> */}
                    <button
                        onClick={onAddNewItem}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
                    >
                        <span className="sm:hidden">➕ Item</span>
                        <span className="hidden sm:inline">➕ Item</span>
                    </button>
                </div>
            </div>

            {/* 2. Tipos de visualización - Controles responsivos */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Tipos de visualización</h3>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={viewMode === 'list'}
                            onChange={(e) => setViewMode(e.target.checked ? 'list' : 'detail')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Vista de listado</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={viewMode === 'detail'}
                            onChange={(e) => setViewMode(e.target.checked ? 'detail' : 'list')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Vista de detalle</span>
                    </label>
                </div>
            </div>

            {/* 3. Categorías - Gestión de categorías */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Categorías</h3>
                <CategoryManagerCompact 
                    categories={availableCategories}
                    onCategoriesChange={onCategoriesChange}
                />
            </div>

            {/* 4. Listado de items - Contenido según el modo de vista */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700">
                        Listado de items ({currentLinks.length})
                    </h3>
                </div>
                <div className="p-4">
                    {viewMode === 'list' ? (
                        <ListView
                            items={currentLinks}
                            onMoveUp={handleMoveUp}
                            onMoveDown={handleMoveDown}
                            onToggleVisibility={handleToggleVisibilityByIndex}
                            onEdit={handleEditByIndex}
                            onDelete={handleDeleteByIndex}
                        />
                    ) : (
                        /* Vista de detalle - Lista actual con todos los formularios */
                        <div className="space-y-3 sm:space-y-4">
                    {currentLinks.map((item, index) => (
                        <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            {/* Header móvil con controles */}
                            <div className="sm:hidden bg-gray-50 p-3 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        <span className="flex items-center justify-center w-6 h-6 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                                            {index + 1}
                                        </span>
                                        <span className={`text-xs font-medium ${
                                            item.visible !== false ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {item.visible !== false ? 'Visible' : 'Oculto'}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => handleMoveUp(index)}
                                            disabled={index === 0}
                                            className={`p-1.5 rounded text-sm ${
                                                index === 0 
                                                    ? 'text-gray-300 cursor-not-allowed' 
                                                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                            }`}
                                            title="Subir"
                                        >
                                            ⬆️
                                        </button>
                                        <button
                                            onClick={() => handleMoveDown(index)}
                                            disabled={index === currentLinks.length - 1}
                                            className={`p-1.5 rounded text-sm ${
                                                index === currentLinks.length - 1 
                                                    ? 'text-gray-300 cursor-not-allowed' 
                                                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                            }`}
                                            title="Bajar"
                                        >
                                            ⬇️
                                        </button>
                                        <button
                                            onClick={() => onToggleVisibility(item.id)}
                                            className={`p-1.5 rounded text-sm ${
                                                item.visible !== false
                                                    ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                                    : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                            }`}
                                            title={item.visible !== false ? "Ocultar en página pública" : "Mostrar en página pública"}
                                        >
                                            {item.visible !== false ? '👁️' : '🚫'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex">
                                {/* Controles laterales - solo desktop */}
                                <div className="hidden sm:flex flex-col items-center space-y-1 pt-4 px-3 bg-gray-50 border-r border-gray-200">
                                    <button
                                        onClick={() => handleMoveUp(index)}
                                        disabled={index === 0}
                                        className={`p-2 rounded-md text-lg transition-all duration-200 ${
                                            index === 0 
                                                ? 'text-gray-300 cursor-not-allowed' 
                                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:scale-110'
                                        }`}
                                        title="Subir"
                                    >
                                        ⬆️
                                    </button>
                                    
                                    <span className="text-xs text-gray-400 font-mono min-w-[2ch] text-center bg-gray-100 px-2 py-1 rounded">
                                        {index + 1}
                                    </span>
                                    
                                    <button
                                        onClick={() => handleMoveDown(index)}
                                        disabled={index === currentLinks.length - 1}
                                        className={`p-2 rounded-md text-lg transition-all duration-200 ${
                                            index === currentLinks.length - 1 
                                                ? 'text-gray-300 cursor-not-allowed' 
                                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:scale-110'
                                        }`}
                                        title="Bajar"
                                    >
                                        ⬇️
                                    </button>
                                    
                                    {/* Botón de visibilidad */}
                                    <div className="flex flex-col items-center space-y-1 mt-2">
                                        <button
                                            onClick={() => onToggleVisibility(item.id)}
                                            className={`p-2 rounded-md text-lg transition-all duration-200 ${
                                                item.visible !== false
                                                    ? 'text-green-600 hover:text-green-700 hover:bg-green-50 hover:scale-110'
                                                    : 'text-red-600 hover:text-red-700 hover:bg-red-50 hover:scale-110'
                                            }`}
                                            title={item.visible !== false ? "Ocultar en página pública" : "Mostrar en página pública"}
                                        >
                                            {item.visible !== false ? '👁️' : '🚫'}
                                        </button>
                                        <span className={`text-xs font-medium transition-colors duration-200 ${
                                            item.visible !== false ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {item.visible !== false ? 'Visible' : 'Oculto'}
                                        </span>
                                    </div>
                                </div>

                                {/* Contenido del elemento */}
                                <div className={`flex-1 w-full transition-opacity duration-200 ${
                                    item.visible === false ? 'opacity-50' : 'opacity-100'
                                }`}>
                                    {item.type === 'link' ? (
                                        <LinkCard
                                            key={item.id}
                                            link={item as Link}
                                            availableCategories={availableCategories}
                                            onRemove={() => onRemoveLink(item.id)}
                                            onUpdate={(id, field, value) => onUpdateLink(id, field, value)}
                                            onUpdateCategories={(id, categories) => onUpdateLinkCategories(id, categories)}
                                            linkCardBackgroundColor={linkCardBackgroundColor}
                                            linkCardTextColor={linkCardTextColor}
                                        />
                                    ) : item.type === 'product' ? (
                                        <ProductItem
                                            key={item.id}
                                            product={item as Product}
                                            availableCategories={availableCategories}
                                            onUpdate={(id, updatedProduct) => onUpdateProduct(id, updatedProduct)}
                                            onRemove={() => onRemoveLink(item.id)}
                                        />
                                    ) : item.type === 'item' ? (
                                        <ItemForm
                                            key={item.id}
                                            item={item as Item}
                                            availableCategories={availableCategories}
                                            onUpdate={(updatedItem) => onUpdateItem(item.id, updatedItem)}
                                            onRemove={() => onRemoveLink(item.id)}
                                            linkCardBackgroundColor={linkCardBackgroundColor}
                                            linkCardTextColor={linkCardTextColor}
                                        />
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {currentLinks.length === 0 && (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                            <p className="text-lg mb-2">📄 No hay enlaces, productos o items configurados</p>
                            <p className="text-sm">Agrega tu primer elemento usando los botones de arriba</p>
                        </div>
                    )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
