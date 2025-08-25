'use client';

import React, { useEffect, useState, useRef } from 'react';
import { checkAdminPermissions } from '../../check-permissions';
import { getLinksData } from '@/utils/links';
import { updateAdminLinksWithProducts } from '@/app/admin/_actions';
import { useFileUpload } from '@/hooks';
import { SortableLinksFormWithProducts as SortableLinksForm } from "@/components";

export default function AdminLinksProfile() {
  // Declaramos TODOS los estados al inicio del componente
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [localTitle, setLocalTitle] = useState("biomechanics.wav");
  const [localDescription, setLocalDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewType, setPreviewType] = useState<any>("image");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{message?: string; error?: string} | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  
  // Usar hook para la carga de archivos
  const { uploadFileToSupabase } = useFileUpload({
    onStatusChange: setStatus
  });

  useEffect(() => {
    async function loadData() {
      try {
        // Verificar permisos primero
        const isAdmin = await checkAdminPermissions();
        if (!isAdmin) {
          // La función ya redirige automáticamente
          return;
        }
        
        setHasPermissions(true);
        const result = await getLinksData();
        setData(result);
        
        // Actualizamos los estados con los datos cargados
        if (result) {
          const { title, description, profileImage, profileImageType } = result;
          setLocalTitle(title || "biomechanics.wav");
          setLocalDescription(description || "");
          setPreviewUrl(profileImage || "");
          setPreviewType(profileImageType || "image");
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Función para manejar la selección de archivos
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Crear URL para previsualización
    const fileURL = URL.createObjectURL(file);
    setPreviewUrl(fileURL);

    // Determinar el tipo
    if (file.type.startsWith('video/')) {
      setPreviewType('video');
    } else if (file.type === 'image/gif') {
      setPreviewType('gif');
    } else {
      setPreviewType('image');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: 'Guardando cambios...' });

    try {
      // Subir imagen de perfil si es necesaria
      let finalProfileImage = previewUrl;
      let finalProfileImageType = previewType;

      if (selectedFile) {
        setStatus({ message: 'Subiendo imagen de perfil...' });
        try {
          console.log('🔄 Intentando subir imagen de perfil...');
          const uploadedUrl = await uploadFileToSupabase(selectedFile);
          if (uploadedUrl) {
            finalProfileImage = uploadedUrl;
            finalProfileImageType = previewType;
            console.log('✅ Imagen de perfil subida:', uploadedUrl);
          } else {
            console.warn('⚠️ La subida devolvió null');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          console.error('❌ Error subiendo imagen de perfil:', error);
          setStatus({ error: `Error al subir imagen: ${errorMessage}` });
          setIsSubmitting(false);
          return;
        }
      }

      // Preparar datos para actualizar
      const updatedData = {
        title: localTitle,
        description: localDescription,
        profileImage: finalProfileImage,
        profileImageType: finalProfileImageType
      };

      // Mantener los datos que no queremos modificar desde este componente
      const result = await updateAdminLinksWithProducts(data.links || [], updatedData);

      if (result.success) {
        setStatus({ message: 'Cambios guardados correctamente' });
        // Actualizar los datos locales
        setData({
          ...data,
          ...updatedData
        });
        
        // Limpiar después de 3 segundos
        setTimeout(() => {
          setStatus(null);
        }, 3000);
      } else {
        setStatus({ error: result.error || 'Error al guardar los cambios' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error al guardar cambios:', error);
      setStatus({ error: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Renderizado condicional para estados de carga y error
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!hasPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-red-600">No tienes permisos de administrador</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-red-600">Error al cargar datos</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Configuración del Perfil
        </h1>
        <p className="text-gray-600">
          Administra la información de tu perfil y enlaces sociales
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Foto/Video de Perfil
                </label>
                <div className="flex flex-col items-center">
                  {/* Importamos el componente AvatarUpload */}
                  <div className="relative group">
                    {previewUrl ? (
                      previewType === 'video' ? (
                        <video 
                          src={previewUrl}
                          className="w-32 h-32 rounded-full border-4 border-green-500 mb-4 shadow-lg object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewUrl}
                          alt="Avatar"
                          className="w-32 h-32 rounded-full border-4 border-green-500 mb-4 shadow-lg object-cover"
                          width={128}
                          height={128}
                        />
                      )
                    ) : (
                      <div className="w-32 h-32 rounded-full border-4 border-gray-300 mb-4 shadow-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-xs text-center">
                          Sin imagen<br/>disponible
                        </span>
                      </div>
                    )}
                    
                    {/* Overlay para cambiar archivo */}
                    <div 
                      className="absolute inset-0 w-32 h-32 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      <span className="text-white text-sm font-medium text-center">
                        {selectedFile ? 'Cambiar' : 'Editar'}
                        <br />
                        <span className="text-xs">
                          Imagen/Video
                        </span>
                      </span>
                    </div>
                    
                    {/* Input de archivo oculto */}
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*,video/mp4,video/webm,video/quicktime"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {/* Indicador de cambio pendiente */}
                    {selectedFile && (
                      <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                        Nuevo
                      </div>
                    )}
                  </div>
                  
                  {/* Información del archivo */}
                  {selectedFile && (
                    <div className="w-full max-w-md p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm mt-2">
                      <p><strong>Nuevo archivo:</strong> {selectedFile.name}</p>
                      <p><strong>Tamaño:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p className="text-xs mt-1">
                        El archivo se guardará al presionar "Guardar Cambios"
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 space-y-4 w-full">
                {/* Título */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Título de la página
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value.slice(0, 65))}
                    maxLength={65}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="biomechanics.wav"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {localTitle.length}/65 caracteres
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción/Subtítulo
                  </label>
                  <input
                    type="text"
                    id="description"
                    value={localDescription}
                    onChange={(e) => setLocalDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tu nombre o descripción"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
          
          {/* Mensaje de estado */}
          {status && (
            <div className={`p-3 rounded-lg ${status.error ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
              {status.error || status.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
