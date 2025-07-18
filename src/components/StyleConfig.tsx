interface StyleConfigProps {
    titleColor: string
    setTitleColor: (color: string) => void
    linkCardBackgroundColor: string
    setLinkCardBackgroundColor: (color: string) => void
    linkCardTextColor: string
    setLinkCardTextColor: (color: string) => void
    productBuyButtonColor: string
    setProductBuyButtonColor: (color: string) => void
    itemButtonColor: string
    setItemButtonColor: (color: string) => void
    isValidHexColor: (color: string) => boolean
}

export function StyleConfig({
    titleColor,
    setTitleColor,
    linkCardBackgroundColor,
    setLinkCardBackgroundColor,
    linkCardTextColor,
    setLinkCardTextColor,
    productBuyButtonColor,
    setProductBuyButtonColor,
    itemButtonColor,
    setItemButtonColor,
    isValidHexColor
}: StyleConfigProps) {
    const ColorInput = ({ 
        label, 
        value, 
        onChange, 
        placeholder 
    }: { 
        label: string
        value: string
        onChange: (value: string) => void
        placeholder: string
    }) => (
        <div className="flex items-center space-x-3">
            <label className="flex-1 text-sm font-medium text-gray-200 min-w-[120px]">
                {label}:
            </label>
            <div className="flex items-center space-x-2">
                <div 
                    className="w-8 h-8 rounded-full border-2 border-gray-400 shadow-sm flex-shrink-0"
                    style={{ backgroundColor: isValidHexColor(value) ? value : placeholder }}
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    maxLength={7}
                    className={`w-24 p-2 text-sm border rounded-md focus:outline-none focus:ring-2 bg-gray-700 text-white placeholder-gray-400 ${
                        isValidHexColor(value) 
                            ? 'border-gray-600 focus:ring-blue-500 focus:border-blue-500' 
                            : 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-900'
                    }`}
                />
                <input
                    type="color"
                    value={isValidHexColor(value) ? value : placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer flex-shrink-0"
                    title={`Seleccionar color para ${label.toLowerCase()}`}
                />
            </div>
        </div>
    )

    return (
        <div className="w-full max-w-md bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-600">
            <h3 className="text-xl font-semibold text-orange-400 mb-4 text-center">
                Colores de Elementos
            </h3>
            <div className="space-y-4">
                <ColorInput
                    label="Título principal"
                    value={titleColor}
                    onChange={setTitleColor}
                    placeholder="#ffffff"
                />
                <ColorInput
                    label="Fondo de tarjetas"
                    value={linkCardBackgroundColor}
                    onChange={setLinkCardBackgroundColor}
                    placeholder="#ffffff"
                />
                <ColorInput
                    label="Texto de tarjetas"
                    value={linkCardTextColor}
                    onChange={setLinkCardTextColor}
                    placeholder="#000000"
                />
                <ColorInput
                    label="Botón de productos"
                    value={productBuyButtonColor}
                    onChange={setProductBuyButtonColor}
                    placeholder="#ff6b35"
                />
                <ColorInput
                    label="Botón de items"
                    value={itemButtonColor}
                    onChange={setItemButtonColor}
                    placeholder="#3b82f6"
                />
            </div>
            <div className="mt-4 p-3 bg-orange-900 bg-opacity-30 rounded-md border border-orange-600">
                <p className="text-xs text-orange-300 text-center">
                    🎨 Personaliza los colores del título y las tarjetas de links
                </p>
            </div>
        </div>
    )
}
