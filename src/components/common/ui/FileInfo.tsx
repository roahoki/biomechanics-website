import { getFileTypeText } from '@/utils/file-utils'

interface FileInfoProps {
    selectedFile: File | null
    previewType: string
}

export function FileInfo({ selectedFile, previewType }: FileInfoProps) {
    if (!selectedFile) return null

    return (
        <div className="w-full max-w-md p-3 bg-yellow-900 bg-opacity-50 border border-yellow-600 rounded-md text-yellow-200 text-sm">
            <p><strong>Nuevo {getFileTypeText(previewType as any).toLowerCase()}:</strong> {selectedFile.name}</p>
            <p><strong>Tamaño:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            <p><strong>Tipo:</strong> {selectedFile.type}</p>
            <p className="text-xs mt-1">
                El {getFileTypeText(previewType as any).toLowerCase()} se guardará al presionar "Guardar Cambios" o "Ctrl + Enter".
            </p>
        </div>
    )
}
