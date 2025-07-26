import { useState } from 'react'
import { LinkCard } from './LinkCard'
import { ProductItem } from '../ProductItem'
import { ItemForm } from '../ItemForm'
import ListView from '../ListView'
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
    linkCardBackgroundColor,
    linkCardTextColor
}: LinksListProps) {
    const [viewMode, setViewMode] = useState<'detail' | 'list'>('detail')

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
        <div className="space-y-4">
            {/* Botones de agregar */}
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={onAddNewLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    ➕ Agregar enlace
                </button>
                <button
                    onClick={onAddNewProduct}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                    📦 Agregar producto
                </button>
                <button
                    onClick={onAddNewItem}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                    ⭐ Agregar presionable
                </button>
            </div>

            {/* Controles de visualización - justo después de los botones de agregar */}
            <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Tipo de visualización</h3>
                <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={viewMode === 'list'}
                            onChange={(e) => setViewMode(e.target.checked ? 'list' : 'detail')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Vista de listado</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={viewMode === 'detail'}
                            onChange={(e) => setViewMode(e.target.checked ? 'detail' : 'list')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Vista de detalle</span>
                    </label>
                </div>
            </div>

            {/* Contenido según el modo de vista */}
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
                <div className="space-y-2">
                    {currentLinks.map((item, index) => (
                        <div key={item.id} className="flex items-start space-x-3 group">
                            {/* Botones de reordenamiento y visibilidad */}
                            <div className="flex flex-col items-center space-y-1 pt-4">
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
                                <div className="flex flex-col items-center space-y-1">
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
                            <div className={`flex-1 w-full max-w-full overflow-hidden transition-opacity duration-200 ${
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
                                    />
                                ) : null}
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
    )
}
