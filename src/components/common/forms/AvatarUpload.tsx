import { useRef } from 'react'
import { getFileTypeText, type ProfileImageType } from '@/utils/file-utils'

interface AvatarUploadProps {
    previewUrl: string
    previewType: ProfileImageType
    selectedFile: File | null
    onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function AvatarUpload({ previewUrl, previewType, selectedFile, onFileSelect }: AvatarUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const renderAvatar = () => {
        const commonClasses = "w-32 h-32 rounded-full border-4  mb-4 shadow-lg object-cover"
        
        // Si no hay URL o está vacía, mostrar un placeholder
        if (!previewUrl) {
            return (
                <div className={commonClasses + " bg-gray-600 flex items-center justify-center border-2 border-gray-500"}>
                    <span className="text-gray-300 text-xs text-center">
                        Sin imagen<br/>disponible
                    </span>
                </div>
            )
        }
        
        if (previewType === 'video') {
            return (
                <video 
                    src={previewUrl}
                    className={commonClasses}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
            )
        } else {
            // Para 'image' y 'gif', usamos img estándar para evitar problemas de serialización
            return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={previewUrl}
                    alt="Avatar"
                    className={commonClasses}
                    width={128}
                    height={128}
                />
            )
        }
    }

    return (
        <div className="relative group">
            {renderAvatar()}
            
            {/* Overlay para cambiar archivo */}
            <div 
                className="absolute inset-0 w-32 h-32 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                <span className="text-white text-sm font-medium text-center">
                    {selectedFile ? 'Cambiar' : 'Editar'}
                    <br />
                    <span className="text-xs">
                        {getFileTypeText(previewType)}
                    </span>
                </span>
            </div>
            
            {/* Input de archivo oculto - ahora acepta más tipos */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/mp4,video/webm,video/quicktime"
                onChange={onFileSelect}
                className="hidden"
            />
            
            {/* Indicador de cambio pendiente */}
            {selectedFile && (
                <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                    {getFileTypeText(previewType)}
                </div>
            )}
            
            {/* Indicador del tipo actual */}
            {!selectedFile && previewType !== 'image' && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {getFileTypeText(previewType)}
                </div>
            )}
        </div>
    )
}
