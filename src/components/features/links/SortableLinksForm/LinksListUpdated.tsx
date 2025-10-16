import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Bars3Icon, EyeIcon, EyeSlashIcon, TrashIcon } from '@heroicons/react/24/outline'
import { LinkCard } from './LinkCard'
import { ProductItem } from '../../products/ProductItem'
import { ItemForm } from '../../products/ItemForm'
import ListView from '../../../common/ui/ListView'
import CategoryManagerCompact from '../../categories/CategoryManagerCompact'
import { LinkItem, Product, Item, Link, SortMode } from '@/types/product'
import { isItemDraft, validateItemForPublic } from '@/utils/validation-utils'

interface LinksListProps {
    currentLinks: LinkItem[]
    availableCategories: string[]
    sortMode: SortMode
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
    sortMode,
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

    // Función para toggle individual de expansión - Memoizada para evitar re-renders
    const toggleItemExpansion = useCallback((itemId: number) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev)
            if (newSet.has(itemId)) {
                newSet.delete(itemId)
            } else {
                newSet.add(itemId)
            }
            return newSet
        })
    }, []) // Sin dependencias para aislar completamente este estado

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

    // Funciones para manejo de reordenamiento - Memoizadas para evitar re-renders
    const handleMoveUp = useCallback((index: number) => {
        if (index === 0) return
        const newOrder = [...currentLinks]
        const temp = newOrder[index]
        newOrder[index] = newOrder[index - 1]
        newOrder[index - 1] = temp
        onReorderLinks(newOrder)
    }, [currentLinks, onReorderLinks])

    const handleMoveDown = useCallback((index: number) => {
        if (index === currentLinks.length - 1) return
        const newOrder = [...currentLinks]
        const temp = newOrder[index]
        newOrder[index] = newOrder[index + 1]
        newOrder[index + 1] = temp
        onReorderLinks(newOrder)
    }, [currentLinks, onReorderLinks])

    const handleToggleVisibilityByIndex = useCallback((index: number) => {
        const item = currentLinks[index]
        onToggleVisibility(item.id)
    }, [currentLinks, onToggleVisibility])

    // Alias para compatibilidad con el código del listado
    const handleToggleVisibility = handleToggleVisibilityByIndex
    const toggleExpand = toggleItemExpansion
    const handleRowClick = (index: number) => {
        const item = currentLinks[index]
        toggleItemExpansion(item.id)
    }

    const handleDeleteByIndex = useCallback((index: number) => {
        const item = currentLinks[index]
        if (window.confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
            onRemoveLink(item.id)
        }
    }, [currentLinks, onRemoveLink])

    const handleEditByIndex = useCallback((index: number) => {
        // Para editar, cambiar a vista detalle
        setViewMode('detail')
    }, [])

    // Función para manejar el drag & drop
    const handleDragEnd = useCallback((result: DropResult) => {
        if (!result.destination) return
        if (result.source.index === result.destination.index) return

        const items = Array.from(currentLinks)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        onReorderLinks(items)
    }, [currentLinks, onReorderLinks])

    // Función para renderizar el formulario según el tipo de item
    const renderItemForm = (item: LinkItem, index: number) => {
        if (item.type === 'link') {
            return (
                <LinkCard
                    link={item as Link}
                    onUpdate={(id, field, value) => onUpdateLink(id, field, value)}
                    onUpdateCategories={(id, categories) => onUpdateLinkCategories(id, categories)}
                    onRemove={(id) => onRemoveLink(id)}
                    availableCategories={availableCategories}
                    linkCardBackgroundColor={linkCardBackgroundColor}
                    linkCardTextColor={linkCardTextColor}
                />
            )
        }
        
        if (item.type === 'product') {
            return (
                <ProductItem
                    product={item as Product}
                    onUpdate={(id, updatedProduct) => onUpdateProduct(id, updatedProduct)}
                    onRemove={(id) => onRemoveLink(id)}
                    availableCategories={availableCategories}
                />
            )
        }
        
        if (item.type === 'item') {
            return (
                <ItemForm
                    item={item as Item}
                    onUpdate={(updatedItem) => onUpdateItem(item.id, updatedItem)}
                    onRemove={() => onRemoveLink(item.id)}
                    onCategoriesChange={onCategoriesChange}
                    availableCategories={availableCategories}
                    linkCardBackgroundColor={linkCardBackgroundColor}
                    linkCardTextColor={linkCardTextColor}
                />
            )
        }
        
        return null
    }

    // Verificar si el drag & drop está habilitado
    const isDragEnabled = sortMode === 'manual'

    return (
        <div className="w-full space-y-6">


            {/* Categorías - Gestión de categorías */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Categorías</h3>
                <CategoryManagerCompact 
                    categories={availableCategories}
                    onCategoriesChange={onCategoriesChange}
                />
            </div>

            {/* Enlaces y productos - Botones de agregar responsivos */}
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

            {/* 4. Listado de items - Vista de listado con expansión individual */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700">
                        Listado de items ({currentLinks.length})
                    </h3>
                    {!isDragEnabled && (
                        <p className="text-xs text-gray-500 mt-1">
                            💡 Cambia a ordenamiento manual para poder arrastrar items
                        </p>
                    )}
                </div>
                <div className="p-4">
                    {/* Vista de listado con expansión individual y drag & drop */}
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="links-list" isDropDisabled={!isDragEnabled}>
                            {(provided) => (
                                <div 
                                    {...provided.droppableProps} 
                                    ref={provided.innerRef}
                                    className="space-y-2"
                                >
                                    {currentLinks.map((item, index) => (
                                        <Draggable 
                                            key={item.id} 
                                            draggableId={`link-${item.id}`} 
                                            index={index}
                                            isDragDisabled={!isDragEnabled}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    onClick={() => handleRowClick(index)}
                                                    className={`bg-white border rounded-lg transition-all cursor-pointer hover:shadow-md ${
                                                        expandedItems.has(item.id) 
                                                            ? 'border-blue-500 shadow-sm' 
                                                            : 'border-gray-200'
                                                    } ${!isDragEnabled ? 'opacity-75' : ''}`}
                                                >
                                                    <div className="p-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                                {/* Drag handle - Solo visible cuando está enabled */}
                                                                {isDragEnabled && (
                                                                    <div 
                                                                        {...provided.dragHandleProps}
                                                                        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                                                                    >
                                                                        <Bars3Icon className="w-5 h-5" />
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Indicador de expansión */}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        toggleExpand(item.id)
                                                                    }}
                                                                    className="text-sm text-gray-400 hover:text-gray-600 min-w-[1.5ch] flex-shrink-0"
                                                                >
                                                                    {expandedItems.has(item.id) ? '▼' : '▶️'}
                                                                </button>
                                                                
                                                                {/* Posición */}
                                                                <span className="text-sm font-mono text-gray-500 min-w-[2ch] flex-shrink-0">
                                                                    {index + 1}
                                                                </span>
                                                                
                                                                {/* Información del item - Permitir truncado */}
                                                                <div className="flex items-center space-x-2 flex-1 min-w-0 overflow-hidden">
                                                                    {/* Indicador de estado borrador */}
                                                                    {isItemDraft(item) && (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 flex-shrink-0">
                                                                            📝 Borrador
                                                                        </span>
                                                                    )}
                                                                    
                                                                    <span className={`text-sm font-medium truncate ${isItemDraft(item) ? 'text-gray-500' : 'text-gray-900'}`}>
                                                                        {item.type === 'link' ? (item as Link).label :
                                                                         item.type === 'product' ? (item as Product).title :
                                                                         (item as Item).title || 'Sin título'}
                                                                    </span>
                                                                    
                                                                    {/* Fechas para items - Compacto */}
                                                                    {item.type === 'item' && (
                                                                        <div className="hidden lg:flex items-center space-x-2 flex-shrink-0 text-xs text-gray-500">
                                                                            {(item as Item).publicationDate && (
                                                                                <span className="whitespace-nowrap">
                                                                                    📅 {(item as Item).publicationDate}
                                                                                </span>
                                                                            )}
                                                                            {(item as Item).activityDate && (
                                                                                <span className="whitespace-nowrap text-blue-600">
                                                                                    🎯 {(item as Item).activityDate}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* Características - Solo mostrar en pantallas más grandes */}
                                                                    <div className="hidden sm:flex items-center space-x-1 flex-shrink-0">
                                                                        {item.visible === false && (
                                                                            <span className="text-xs text-red-600 bg-red-100 px-1 py-0.5 rounded whitespace-nowrap">
                                                                                Oculto
                                                                            </span>
                                                                        )}
                                                                        {item.type === 'product' && !(item as Product).price && (
                                                                            <span className="text-xs text-gray-600 bg-gray-100 px-1 py-0.5 rounded whitespace-nowrap">
                                                                                Sin precio
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Botones de acción - Compactos */}
                                                            <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleToggleVisibility(index)
                                                                    }}
                                                                    className={`p-1.5 rounded transition-colors ${
                                                                        item.visible !== false
                                                                            ? 'text-green-600 hover:bg-green-50'
                                                                            : 'text-gray-400 hover:bg-gray-100'
                                                                    }`}
                                                                    title={item.visible !== false ? 'Visible' : 'Oculto'}
                                                                >
                                                                    {item.visible !== false ? (
                                                                        <EyeIcon className="w-4 h-4" />
                                                                    ) : (
                                                                        <EyeSlashIcon className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                                
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleDeleteByIndex(index)
                                                                    }}
                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                    title="Eliminar"
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Contenido expandido */}
                                                        {expandedItems.has(item.id) && (
                                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                                {renderItemForm(item, index)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    
                                    {currentLinks.length === 0 && (
                                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                                            <p className="text-lg mb-2">📄 No hay enlaces, productos o items configurados</p>
                                            <p className="text-sm">Agrega tu primer elemento usando los botones de arriba</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>
        </div>
    )
}
