import CategorySelector from '../../categories/CategorySelector'

interface Link {
    id: number
    url: string
    label: string
    categories?: string[]
}

interface LinkCardProps {
    link: Link
    availableCategories: string[]
    onRemove: (id: number) => void
    onUpdate: (id: number, field: 'url' | 'label', value: string) => void
    onUpdateCategories: (id: number, categories: string[]) => void
    linkCardBackgroundColor: string
    linkCardTextColor: string
}

export function LinkCard({ 
    link, 
    availableCategories,
    onRemove, 
    onUpdate,
    onUpdateCategories, 
    linkCardBackgroundColor, 
    linkCardTextColor 
}: LinkCardProps) {
    return (
        <li 
            className="relative p-4 rounded-lg shadow-md" 
            style={{
                backgroundColor: linkCardBackgroundColor,
                color: linkCardTextColor
            }}
        >
            {/* Botón de eliminar */}
            <button
                type="button"
                onClick={() => onRemove(link.id)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                title="Eliminar link"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <input
                type="hidden"
                name="id"
                value={link.id}
                readOnly
            />
            <input
                type="text"
                name="url"
                value={link.url}
                onChange={(e) => onUpdate(link.id, 'url', e.target.value)}
                placeholder="URL"
                className="w-full p-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
                type="text"
                name="label"
                value={link.label}
                onChange={(e) => onUpdate(link.id, 'label', e.target.value)}
                placeholder="Texto visible (ej: TikTok)"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            {/* Categorías */}
            <div className="mt-3">
                <label className="block text-sm font-medium mb-1" style={{ color: linkCardTextColor }}>
                    Categorías
                </label>
                <CategorySelector
                    availableCategories={availableCategories}
                    selectedCategories={link.categories || []}
                    onChange={(categories) => onUpdateCategories(link.id, categories)}
                    placeholder="Seleccionar categorías..."
                />
            </div>
        </li>
    )
}
