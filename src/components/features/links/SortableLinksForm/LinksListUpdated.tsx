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
    const [viewMode, setViewMode] = useState<'detail' | 'list'>('list') // Cambiado a 'list' por defecto
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set()) // Nuevo estado para items expandidos

    // Función para toggle individual de expansión
    const toggleItemExpansion = (itemId: number) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev)
            if (newSet.has(itemId)) {
                newSet.delete(itemId)
            } else {
                newSet.add(itemId)
            }
            return newSet
        })
    }

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

            {/* 3. Categorías - Gestión de categorías */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Categorías</h3>
                <CategoryManagerCompact 
                    categories={availableCategories}
                    onCategoriesChange={onCategoriesChange}
                />
            </div>

            {/* 4. Listado de items - Vista de listado con expansión individual */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700">
                        Listado de items ({currentLinks.length})
                    </h3>
                </div>
                <div className="p-4">
                    {/* Vista de listado con expansión individual */}
                    <div className="space-y-2">
                        {currentLinks.map((item, index) => (
                            <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Fila del ListView con botón de expansión */}
                                <div className="bg-gray-50 p-3 flex items-center justify-between hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center space-x-4 flex-1">
                                        {/* Posición */}
                                        <span className="text-sm font-mono text-gray-500 min-w-[2ch]">
                                            {index + 1}
                                        </span>
                                        
                                        {/* Información del item */}
                                        <div className="flex items-center space-x-2 flex-1">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                item.type === 'link' ? 'bg-blue-100 text-blue-800' :
                                                item.type === 'product' ? 'bg-purple-100 text-purple-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {item.type === 'link' ? '🔗 Link' :
                                                 item.type === 'product' ? '📦 Product' : 
                                                 '📄 Item'}
                                            </span>
                                            
                                            <span className="text-sm font-medium text-gray-900 truncate">
                                                {item.type === 'link' ? (item as Link).label :
                                                 item.type === 'product' ? (item as Product).title :
                                                 (item as Item).title || 'Sin título'}
                                            </span>
                                            
                                            {/* Características */}
                                            <div className="flex items-center space-x-1">
                                                {item.visible === false && (
                                                    <span className="text-xs text-red-600 bg-red-100 px-1 py-0.5 rounded">
                                                        Oculto
                                                    </span>
                                                )}
                                                {item.type === 'product' && !(item as Product).price && (
                                                    <span className="text-xs text-gray-600 bg-gray-100 px-1 py-0.5 rounded">
                                                        Sin precio
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Controles de acción */}
                                    <div className="flex items-center space-x-1">
                                        {/* Controles de movimiento */}
                                        <button
                                            onClick={() => handleMoveUp(index)}
                                            disabled={index === 0}
                                            className={`p-1 rounded text-sm ${
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
                                            className={`p-1 rounded text-sm ${
                                                index === currentLinks.length - 1 
                                                    ? 'text-gray-300 cursor-not-allowed' 
                                                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                            }`}
                                            title="Bajar"
                                        >
                                            ⬇️
                                        </button>
                                        
                                        {/* Control de visibilidad */}
                                        <button
                                            onClick={() => handleToggleVisibilityByIndex(index)}
                                            className={`p-1 rounded text-sm ${
                                                item.visible !== false
                                                    ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                                    : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                            }`}
                                            title={item.visible !== false ? "Ocultar" : "Mostrar"}
                                        >
                                            {item.visible !== false ? '👁️' : '🚫'}
                                        </button>
                                        
                                        {/* Botón de eliminación */}
                                        <button
                                            onClick={() => handleDeleteByIndex(index)}
                                            className="p-1 rounded text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                            title="Eliminar"
                                        >
                                            🗑️
                                        </button>
                                        
                                        {/* Botón de expansión */}
                                        <button
                                            onClick={() => toggleItemExpansion(item.id)}
                                            className="p-1 rounded text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 ml-2"
                                            title={expandedItems.has(item.id) ? "Contraer" : "Expandir"}
                                        >
                                            {expandedItems.has(item.id) ? '▼' : '▶️'}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Formulario de detalle expandible */}
                                {expandedItems.has(item.id) && (
                                    <div className="bg-white border-t border-gray-200">
                                        {item.type === 'link' ? (
                                            <LinkCard
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
                                                product={item as Product}
                                                availableCategories={availableCategories}
                                                onUpdate={(id, updatedProduct) => onUpdateProduct(id, updatedProduct)}
                                                onRemove={() => onRemoveLink(item.id)}
                                            />
                                        ) : item.type === 'item' ? (
                                            <ItemForm
                                                item={item as Item}
                                                availableCategories={availableCategories}
                                                onUpdate={(updatedItem) => onUpdateItem(item.id, updatedItem)}
                                                onRemove={() => onRemoveLink(item.id)}
                                                linkCardBackgroundColor={linkCardBackgroundColor}
                                                linkCardTextColor={linkCardTextColor}
                                            />
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {currentLinks.length === 0 && (
                            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                                <p className="text-lg mb-2">📄 No hay enlaces, productos o items configurados</p>
                                <p className="text-sm">Agrega tu primer elemento usando los botones de arriba</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
