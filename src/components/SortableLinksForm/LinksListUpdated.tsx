import { LinkCard } from './LinkCard'
import { ProductItem } from '../ProductItem'
import { LinkItem, Product, Link } from '@/types/product'

interface LinksListProps {
    currentLinks: LinkItem[]
    onAddNewLink: () => void
    onAddNewProduct: () => void
    onRemoveLink: (id: number) => void
    onUpdateLink: (id: number, field: 'url' | 'label', value: string) => void
    onUpdateProduct: (id: number, updatedProduct: Partial<Product>) => void
    onReorderLinks: (newOrder: LinkItem[]) => void
    linkCardBackgroundColor: string
    linkCardTextColor: string
}

export function LinksListUpdated({ 
    currentLinks,
    onAddNewLink,
    onAddNewProduct,
    onRemoveLink,
    onUpdateLink,
    onUpdateProduct,
    onReorderLinks,
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
            <div className="flex space-x-4">
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
            </div>

            {/* Lista de elementos con botones de reordenamiento */}
            <div className="space-y-2">
                {currentLinks.map((item, index) => (
                    <div key={item.id} className="flex items-start space-x-3 group">
                        {/* Botones de reordenamiento */}
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
                        </div>

                        {/* Contenido del elemento */}
                        <div className="flex-1 w-full max-w-full overflow-hidden">
                            {item.type === 'link' ? (
                                <LinkCard
                                    key={item.id}
                                    link={item as Link}
                                    onRemove={() => onRemoveLink(item.id)}
                                    onUpdate={(id, field, value) => onUpdateLink(id, field, value)}
                                    linkCardBackgroundColor={linkCardBackgroundColor}
                                    linkCardTextColor={linkCardTextColor}
                                />
                            ) : (
                                <ProductItem
                                    key={item.id}
                                    product={item as Product}
                                    onUpdate={(id, updatedProduct) => onUpdateProduct(id, updatedProduct)}
                                    onRemove={() => onRemoveLink(item.id)}
                                />
                            )}
                        </div>
                    </div>
                ))}
                
                {currentLinks.length === 0 && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-lg mb-2">📄 No hay enlaces o productos configurados</p>
                        <p className="text-sm">Agrega tu primer enlace o producto usando los botones de arriba</p>
                    </div>
                )}
            </div>
        </div>
    )
}
