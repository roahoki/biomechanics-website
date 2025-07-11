interface StyleConfigProps {
    titleColor: string
    setTitleColor: (color: string) => void
    linkCardBackgroundColor: string
    setLinkCardBackgroundColor: (color: string) => void
    linkCardTextColor: string
    setLinkCardTextColor: (color: string) => void
    isValidHexColor: (color: string) => boolean
}

export function StyleConfig({
    titleColor,
    setTitleColor,
    linkCardBackgroundColor,
    setLinkCardBackgroundColor,
    linkCardTextColor,
    setLinkCardTextColor,
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
            <label className="flex-1 text-sm font-medium text-white min-w-[120px]">
                {label}:
            </label>
            <div className="flex items-center space-x-2">
                <div 
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                    style={{ backgroundColor: isValidHexColor(value) ? value : placeholder }}
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    maxLength={7}
                    className={`w-24 p-2 text-sm border rounded-md focus:outline-none focus:ring-2 text-black ${
                        isValidHexColor(value) 
                            ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' 
                            : 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
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
        <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6 border border-white/20">
            <h3 className="text-xl font-semibold text-[var(--color-secondary)] mb-4 text-center">
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
            </div>
            <div className="mt-4 p-3 bg-orange-500/10 rounded-md border border-orange-500/20">
                <p className="text-xs text-orange-200 text-center">
                    🎨 Personaliza los colores del título y las tarjetas de links
                </p>
            </div>
        </div>
    )
}
