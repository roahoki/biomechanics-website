'use client'

import { LinkItem, Product, Item, Link } from '@/types/product'
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

interface ListViewProps {
  items: LinkItem[]
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onToggleVisibility: (index: number) => void
  onDelete: (index: number) => void
  onEdit: (index: number) => void
}

export default function ListView({ 
  items, 
  onMoveUp, 
  onMoveDown, 
  onToggleVisibility, 
  onDelete,
  onEdit 
}: ListViewProps) {
  
  const getItemType = (item: LinkItem): string => {
    if (item.type === 'product') return 'Producto'
    if (item.type === 'item') return 'Item'
    return 'Enlace'
  }

  const getItemCharacteristic = (item: LinkItem): string => {
    if (item.type === 'product') {
      const product = item as Product
      return product.price ? `$${product.price.toLocaleString('es-CL')}` : 'Sin precio'
    }
    if (item.type === 'item') {
      const itemData = item as Item
      return itemData.price ? `$${itemData.price.toLocaleString('es-CL')}` : 'Sin precio'
    }
    const link = item as Link
    return link.url ? 'Enlace externo' : 'Sin URL'
  }

  const getItemTitle = (item: LinkItem): string => {
    if (item.type === 'product' || item.type === 'item') {
      return (item as Product | Item).title || 'Sin título'
    }
    return (item as Link).label || 'Sin título'
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header de la tabla */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
          <div className="col-span-1 text-center">Posición</div>
          <div className="col-span-1 text-center">Item</div>
          <div className="col-span-2">Tipo</div>
          <div className="col-span-4">Título</div>
          <div className="col-span-2">Característica</div>
          <div className="col-span-2 text-center">Acciones</div>
        </div>
      </div>

      {/* Filas de datos */}
      <div className="divide-y divide-gray-200">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className="px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="grid grid-cols-12 gap-4 items-center text-sm">
              {/* Posición */}
              <div className="col-span-1 text-center font-medium text-gray-900">
                {index + 1}
              </div>

              {/* Número de item */}
              <div className="col-span-1 text-center text-gray-600">
                {item.id}
              </div>

              {/* Tipo */}
              <div className="col-span-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  item.type === 'product' 
                    ? 'bg-green-100 text-green-800'
                    : item.type === 'item'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {item.type === 'product' && '🛍️'}
                  {item.type === 'item' && '📦'}
                  {item.type === 'link' && '🔗'}
                  {' '}
                  {getItemType(item)}
                </span>
              </div>

              {/* Título */}
              <div className="col-span-4">
                <div className="font-medium text-gray-900 truncate">
                  {getItemTitle(item)}
                </div>
                {(item.type === 'product' || item.type === 'item') && (item as Product | Item).subtitle && (
                  <div className="text-gray-500 text-xs truncate">
                    {(item as Product | Item).subtitle}
                  </div>
                )}
              </div>

              {/* Característica */}
              <div className="col-span-2 text-gray-600">
                {getItemCharacteristic(item)}
              </div>

              {/* Acciones */}
              <div className="col-span-2 flex items-center justify-center space-x-1">
                {/* Subir */}
                <button
                  onClick={() => onMoveUp(index)}
                  disabled={index === 0}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-blue-600'
                  }`}
                  title="Subir"
                >
                  <ArrowUpIcon className="w-4 h-4" />
                </button>

                {/* Bajar */}
                <button
                  onClick={() => onMoveDown(index)}
                  disabled={index === items.length - 1}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    index === items.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-blue-600'
                  }`}
                  title="Bajar"
                >
                  <ArrowDownIcon className="w-4 h-4" />
                </button>

                {/* Visibilidad */}
                <button
                  onClick={() => onToggleVisibility(index)}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    item.visible === false ? 'text-gray-400' : 'text-green-600 hover:text-green-700'
                  }`}
                  title={item.visible === false ? 'Mostrar' : 'Ocultar'}
                >
                  {item.visible === false ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>

                {/* Editar */}
                <button
                  onClick={() => onEdit(index)}
                  className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-blue-600"
                  title="Editar"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>

                {/* Eliminar */}
                <button
                  onClick={() => onDelete(index)}
                  className="p-1 rounded hover:bg-gray-100 text-gray-600 hover:text-red-600"
                  title="Eliminar"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje cuando no hay items */}
      {items.length === 0 && (
        <div className="px-4 py-8 text-center text-gray-500">
          No hay publicaciones para mostrar
        </div>
      )}
    </div>
  )
}
