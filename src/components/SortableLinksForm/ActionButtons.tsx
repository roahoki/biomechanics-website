import { getFileTypeText, type ProfileImageType } from '@/utils/file-utils'

interface ActionButtonsProps {
    onPreview: () => void
    onSubmit: () => void
    isSubmitting: boolean
    uploadingImage: boolean
    previewType: ProfileImageType
    selectedFile: File | null
}

export function ActionButtons({ 
    onPreview, 
    onSubmit, 
    isSubmitting, 
    uploadingImage, 
    previewType,
    selectedFile
}: ActionButtonsProps) {
    return (
        <>
            {/* Botones de acción centrados */}
            <div className="flex justify-center space-x-4 mt-8">
                {/* Botón de vista previa */}
                <button
                    type="button"
                    onClick={onPreview}
                    className="px-6 py-3 text-blue-600 bg-white border border-blue-600 rounded-lg shadow hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                >
                    👁️ Vista Previa
                </button>

                {/* Botón para guardar cambios */}
                <button
                    type="submit"
                    disabled={isSubmitting || uploadingImage}
                    className={`px-6 py-3 text-white rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-all duration-200 ${
                        isSubmitting || uploadingImage 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
                    }`}
                >
                    {uploadingImage 
                        ? `Subiendo ${getFileTypeText(previewType).toLowerCase()}...` 
                        : isSubmitting 
                            ? 'Guardando...' 
                            : 'Guardar Cambios'
                    }
                </button>
            </div>

            {/* Información adicional centrada */}
            <div className="text-sm text-gray-400 max-w-md mx-auto text-center mt-4">
                {selectedFile && (
                    <p>Se subirá un nuevo {getFileTypeText(previewType).toLowerCase()} al guardar los cambios.</p>
                )}
                <p>Formatos soportados: JPG, PNG, WebP, GIF, MP4, WebM. Tamaño máximo: 50MB</p>
                <p className="mt-1 text-xs">
                    Los videos se reproducen automáticamente en bucle y sin sonido.
                </p>
            </div>
        </>
    )
}
