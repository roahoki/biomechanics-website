import { LinkCard } from './LinkCard'
import { ProductItem } from '../ProductItem'
import { ItemForm } from '../ItemForm'
import { LinkItem, Product, Item, Link } from '@/types/product'

interface LinksListProps {
    currentLinks: LinkItem[]
    onAddNewLink: () => void
    onAddNewProduct: () => void
    onAddNewItem: () => void
    onRemoveLink: (id: number) => void
    onUpdateLink: (id: number, field: 'url' | 'label', value: string) => void
    onUpdateProduct: (id: number, updatedProduct: Partial<Product>) => void
    onUpdateItem: (id: number, updatedItem: Partial<Item>) => void
    onReorderLinks: (newOrder: LinkItem[]) => void
    onToggleVisibility: (id: number) => void
    linkCardBackgroundColor: string
    linkCardTextColor: string
}

export function LinksListUpdated({ 
    currentLinks,
    onAddNewLink,
    onAddNewProduct,
    onAddNewItem,
    onRemoveLink,
    onUpdateLink,
    onUpdateProduct,
    onUpdateItem,
    onReorderLinks,
    onToggleVisibility,
    linkCardBackgroundColor,
    linkCardTextColor
}: LinksListProps) {
    // Función para mover un elemento hacia arriba
    const moveUp = (index: number) => {
        if (index > 0) {
            const newOrder = [...currentLinks]
            const [item] = newOrder.splice(index, 1)
            newOrder.splice(index - 1, 0, item)
            onReorderLinks(newOrder)
        }
    }

    // Función para mover un elemento hacia abajo
    const moveDown = (index: number) => {
        if (index < currentLinks.length - 1) {
            const newOrder = [...currentLinks]
            const [item] = newOrder.splice(index, 1)
            newOrder.splice(index + 1, 0, item)
            onReorderLinks(newOrder)
        }
    }

    return (
        <div className="space-y-4">
            {/* Botones para agregar nuevos elementos */}
            <div className="flex flex-wrap gap-3 mb-6">
                <button
                    type="button"
                    onClick={onAddNewLink}
                    className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                    <span>➕</span>
                    <span>Agregar Enlace</span>
                </button>
                <button
                    type="button"
                    onClick={onAddNewProduct}
                    className="flex items-center space-x-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                    <span>🛍️</span>
                    <span>Agregar Producto</span>
                </button>
                <button
                    type="button"
                    onClick={onAddNewItem}
                    className="flex items-center space-x-2 px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                >
                    <span>📦</span>
                    <span>Agregar Item</span>
                </button>
            </div>

            {/* Lista de elementos con botones de reordenamiento */}
            <div className="space-y-2">
                {currentLinks.map((item, index) => (
                    <div key={item.id} className="flex items-start space-x-3 group">
                        {/* Botones de reordenamiento y visibilidad */}
                        <div className="flex flex-col items-center space-y-1 pt-4">
                            <button
                                onClick={() => moveUp(index)}
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
                                onClick={() => moveDown(index)}
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
                                    onRemove={() => onRemoveLink(item.id)}
                                    onUpdate={(id, field, value) => onUpdateLink(id, field, value)}
                                    linkCardBackgroundColor={linkCardBackgroundColor}
                                    linkCardTextColor={linkCardTextColor}
                                />
                            ) : item.type === 'product' ? (
                                <ProductItem
                                    key={item.id}
                                    product={item as Product}
                                    onUpdate={(id, updatedProduct) => onUpdateProduct(id, updatedProduct)}
                                    onRemove={() => onRemoveLink(item.id)}
                                />
                            ) : item.type === 'item' ? (
                                <ItemForm
                                    key={item.id}
                                    item={item as Item}
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
        </div>
    )
}
