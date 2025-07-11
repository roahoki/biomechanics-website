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
            {/* Botones de acción */}
            <div className="flex space-x-4">
                {/* Botón de vista previa */}
                <button
                    type="button"
                    onClick={onPreview}
                    className="px-6 py-3 text-blue-600 bg-white rounded-md shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    👁️ Vista Previa
                </button>

                {/* Botón para guardar cambios */}
                <button
                    type="submit"
                    disabled={isSubmitting || uploadingImage}
                    className={`px-6 py-3 text-white rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isSubmitting || uploadingImage 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
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

            {/* Información adicional */}
            <div className="text-sm text-gray-400 max-w-md text-center">
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
