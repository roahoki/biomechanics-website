'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useRef} from 'react'
import { useSupabaseClient } from '@/lib/supabase-auth'

export default function PerfilPage() {
    const { user } = useUser()
    const supabase = useSupabaseClient() // Cliente autenticado con Clerk
    const [file, setFile] = useState<File | null>(null)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.imageUrl || null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async () => {
        if (!file || !user) {
            setError('Por favor selecciona un archivo e inicia sesión')
            return
        }

        setUploading(true)
        setError(null)
        setSuccess(null)

        try {
            // Generar un nombre único para el archivo
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Date.now()}.${fileExt}`
            const filePath = fileName // Sin subfolder, directamente en el bucket

            console.log('🔄 Iniciando subida...')
            console.log('📁 Archivo:', filePath)
            console.log('📏 Tamaño:', file.size)
            console.log('🎭 Tipo:', file.type)
            console.log('👤 User ID:', user.id)

            // Verificar que tenemos el cliente de Supabase
            if (!supabase) {
                throw new Error('Cliente de Supabase no disponible')
            }

            // Subir el archivo con configuración específica
            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: file.type
                })

            if (error) {
                console.error('❌ Error detallado:', error)
                
                // Mensajes de error más específicos
                if (error.message.includes('unauthorized') || error.message.includes('403')) {
                    setError('Error de autenticación. Verifica la configuración de Clerk-Supabase.')
                } else if (error.message.includes('alg')) {
                    setError('Error de configuración JWT. Verifica el JWKS endpoint.')
                } else {
                    setError(`Error al subir: ${error.message}`)
                }
                return
            }

            console.log('✅ Archivo subido exitosamente:', data)

            // Obtener URL pública
            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            if (publicUrlData?.publicUrl) {
                setAvatarUrl(publicUrlData.publicUrl)
                setSuccess('¡Imagen subida exitosamente!')
                console.log('🔗 URL pública:', publicUrlData.publicUrl)
            }

        } catch (err) {
            console.error('💥 Error inesperado:', err)
            setError(`Error inesperado: ${err instanceof Error ? err.message : 'Error desconocido'}`)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="p-8 max-w-md mx-auto">
            <h1 className="text-xl mb-4">Foto de perfil</h1>
            
            {/* Mostrar errores */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            {/* Mostrar éxito */}
            {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}
            
            <img
                src={avatarUrl ?? '/default-avatar.png'}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover mb-4"
            />
            
            {/* Mostrar información del archivo seleccionado */}
            {file && (
                <div className="mb-4 p-2 bg-gray-100 rounded">
                    <p><strong>Archivo:</strong> {file.name}</p>
                    <p><strong>Tamaño:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>Tipo:</strong> {file.type}</p>
                </div>
            )}
            
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => {
                    const selectedFile = e.target.files?.[0] || null
                    setFile(selectedFile)
                    setError(null)
                    setSuccess(null)
                }}
                className='hidden'
            />
            
            <div className="flex flex-col items-center gap-2">
                <button
                    className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
                    onClick={() => {
                        if (fileInputRef.current) {
                            fileInputRef.current.click()
                        }
                    }}
                    disabled={uploading}
                >
                    Seleccionar imagen
                </button>
                
                <button
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    onClick={handleUpload}
                    disabled={!file || uploading}
                >
                    {uploading ? 'Subiendo...' : 'Subir imagen'}
                </button>
            </div>
            
            {/* Debug info */}
            <div className="mt-6 p-4 bg-gray-50 rounded text-sm">
                <h3 className="font-bold mb-2">Debug Info:</h3>
                <p><strong>Usuario ID:</strong> {user?.id || 'No disponible'}</p>
                <p><strong>Archivo seleccionado:</strong> {file ? 'Sí' : 'No'}</p>
                <p><strong>Subiendo:</strong> {uploading ? 'Sí' : 'No'}</p>
            </div>
        </div>
    )
}
