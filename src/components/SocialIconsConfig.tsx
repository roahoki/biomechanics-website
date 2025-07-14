interface SocialIconsConfigProps {
    socialIconColors: {
        instagram: string
        soundcloud: string
        youtube: string
        tiktok: string
    }
    onColorChange: (platform: string, color: string) => void
    isValidHexColor: (color: string) => boolean
}

export function SocialIconsConfig({ 
    socialIconColors, 
    onColorChange, 
    isValidHexColor 
}: SocialIconsConfigProps) {
    return (
        <div className="w-full max-w-md bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-600">
            <h3 className="text-xl font-semibold text-blue-400 mb-4 text-center">
                Colores de Iconos Sociales
            </h3>
            <div className="space-y-4">
                {Object.entries(socialIconColors).map(([platform, color]) => (
                    <div key={platform} className="flex items-center space-x-3">
                        <label className="flex-1 text-sm font-medium text-gray-200 capitalize min-w-[80px]">
                            {platform}:
                        </label>
                        <div className="flex items-center space-x-2">
                            {/* Vista previa del color */}
                            <div 
                                className="w-8 h-8 rounded-full border-2 border-gray-400 shadow-sm flex-shrink-0"
                                style={{ backgroundColor: isValidHexColor(color) ? color : '#000000' }}
                            />
                            {/* Input de color hex */}
                            <input
                                type="text"
                                value={color}
                                onChange={(e) => onColorChange(platform, e.target.value)}
                                placeholder="#000000"
                                maxLength={7}
                                className={`w-24 p-2 text-sm border rounded-md focus:outline-none focus:ring-2 bg-gray-700 text-white placeholder-gray-400 ${
                                    isValidHexColor(color) 
                                        ? 'border-gray-600 focus:ring-blue-500 focus:border-blue-500' 
                                        : 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-900'
                                }`}
                            />
                            {/* Input de color nativo como respaldo */}
                            <input
                                type="color"
                                value={isValidHexColor(color) ? color : '#000000'}
                                onChange={(e) => onColorChange(platform, e.target.value)}
                                className="w-8 h-8 border border-gray-300 rounded cursor-pointer flex-shrink-0"
                                title={`Seleccionar color para ${platform}`}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 rounded-md border border-blue-600">
                <p className="text-xs text-blue-300 text-center">
                    💡 Usa formato hex (#000000) o selecciona con el selector de color
                </p>
            </div>
        </div>
    )
}
