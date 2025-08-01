interface BackgroundConfigProps {
    backgroundType: 'color' | 'image'
    setBackgroundType: (type: 'color' | 'image') => void
    bgColor: string
    setBgColor: (color: string) => void
    backgroundPreviewUrl: string
    backgroundImageOpacity: number
    setBackgroundImageOpacity: (opacity: number) => void
    onBackgroundFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
    isValidHexColor: (color: string) => boolean
}

export function BackgroundConfig({ 
    backgroundType,
    setBackgroundType,
    bgColor,
    setBgColor,
    backgroundPreviewUrl,
    backgroundImageOpacity,
    setBackgroundImageOpacity,
    onBackgroundFileSelect,
    isValidHexColor
}: BackgroundConfigProps) {
    return (
        <div className="w-full max-w-md bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-600">
            <h3 className="text-xl font-semibold text-green-400 mb-4 text-center">
                Fondo de Pantalla
            </h3>
            
            {/* Selector de tipo de fondo */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                    Tipo de fondo:
                </label>
                <div className="flex space-x-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="color"
                            checked={backgroundType === 'color'}
                            onChange={(e) => setBackgroundType(e.target.value as 'color' | 'image')}
                            className="mr-2"
                        />
                        <span className="text-gray-200">Color sólido</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="image"
                            checked={backgroundType === 'image'}
                            onChange={(e) => setBackgroundType(e.target.value as 'color' | 'image')}
                            className="mr-2"
                        />
                        <span className="text-gray-200">Imagen</span>
                    </label>
                </div>
            </div>

            {/* Configuración de color */}
            {backgroundType === 'color' && (
                <div className="flex items-center justify-center space-x-3">
                    <label className="text-sm font-medium text-gray-200">
                        Color:
                    </label>
                    <div className="flex items-center space-x-2">
                        <div 
                            className="w-12 h-12 rounded-lg border-2 border-gray-400 shadow-sm"
                            style={{ backgroundColor: bgColor }}
                        />
                        <input
                            type="text"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            placeholder="#1a1a1a"
                            maxLength={7}
                            className={`w-28 p-2 text-sm border rounded-md focus:outline-none focus:ring-2 bg-gray-700 text-white placeholder-gray-400 ${
                                isValidHexColor(bgColor) 
                                    ? 'border-gray-600 focus:ring-blue-500 focus:border-blue-500' 
                                    : 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            }`}
                        />
                        <input
                            type="color"
                            value={isValidHexColor(bgColor) ? bgColor : '#1a1a1a'}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                            title="Seleccionar color de fondo"
                        />
                    </div>
                </div>
            )}

            {/* Configuración de imagen */}
            {backgroundType === 'image' && (
                <div className="space-y-4">
                    {/* Subir imagen */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Imagen de fondo:
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onBackgroundFileSelect}
                                className="text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                            />
                            {backgroundPreviewUrl && (
                                <div 
                                    className="w-12 h-12 rounded border-2 border-white bg-cover bg-center"
                                    style={{ backgroundImage: `url(${backgroundPreviewUrl})` }}
                                    title="Vista previa de la imagen"
                                />
                            )}
                        </div>
                    </div>

                    {/* Control de opacidad */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Opacidad: {Math.round(backgroundImageOpacity * 100)}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={backgroundImageOpacity}
                            onChange={(e) => setBackgroundImageOpacity(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            )}

            <div className="mt-4 p-3 bg-purple-500/10 rounded-md border border-purple-500/20">
                <p className="text-xs text-purple-200 text-center">
                    🎨 {backgroundType === 'color' 
                        ? 'Este color se aplicará como fondo de la página pública' 
                        : 'La imagen se aplicará como fondo con la opacidad seleccionada'}
                </p>
            </div>
        </div>
    )
}
