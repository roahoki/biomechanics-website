'use client';

import React, { useEffect, useState, useRef } from 'react';
import { checkAdminPermissions } from '../../check-permissions';
import { getLinksData } from '@/utils/links';
import { updateAdminLinksWithProducts } from '@/app/admin/_actions';
import { useColorConfig, useFileUpload, useFormState } from '@/hooks';
import { BackgroundConfig, SocialIconsConfig, StyleConfig } from '@/components/features/profile';

export default function AdminLinksDesign() {
  // Estados básicos
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasPermissions, setHasPermissions] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  // Estado del formulario
  const {
    status,
    setStatus,
    isSubmitting,
    setIsSubmitting,
    selectedBackgroundFile,
    setSelectedBackgroundFile,
    backgroundPreviewUrl,
    setBackgroundPreviewUrl
  } = useFormState();

  // File upload
  const { handleFileSelect, uploadBackgroundImage } = useFileUpload({
    onStatusChange: setStatus
  });
  
  // Estados adicionales para el fondo
  const [backgroundType, setBackgroundType] = useState<'color' | 'image'>('color');
  const [backgroundImageOpacity, setBackgroundImageOpacity] = useState(0.5);
  
  // Configuración de colores
  const {
    socialIconColors,
    setSocialIconColors,
    bgColor,
    setBgColor,
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
    isValidHexColor,
    handleSocialIconColorChange
  } = useColorConfig({
    initialSocialIconColors: {
      instagram: '#E4405F',
      soundcloud: '#FF5500',
      youtube: '#FF0000',
      tiktok: '#000000',
      mixcloud: '#52ADE9'
    },
    initialBgColor: '#1a1a1a',
    initialTitleColor: '#ffffff',
    initialLinkCardBackgroundColor: '#ffffff',
    initialLinkCardTextColor: '#000000',
    initialProductBuyButtonColor: '#ff6b35',
    initialItemButtonColor: '#3b82f6'
  });

  // Manejador para la subida de archivos de fondo
  const onBackgroundFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file, setSelectedBackgroundFile, setBackgroundPreviewUrl, () => {});
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: 'Guardando cambios...' });

    try {
      if (!data) {
        throw new Error("No hay datos para guardar");
      }
      
      // Subir imagen de fondo si es necesaria
      let finalBackgroundImageUrl = data.backgroundSettings?.imageUrl || '';

      if (selectedBackgroundFile) {
        setStatus({ message: 'Subiendo imagen de fondo...' });
        try {
          console.log('🔄 Intentando subir imagen de fondo...');
          const uploadedUrl = await uploadBackgroundImage(selectedBackgroundFile);
          if (uploadedUrl) {
            finalBackgroundImageUrl = uploadedUrl;
            console.log('✅ Imagen de fondo subida:', uploadedUrl);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          console.error('❌ Error subiendo imagen de fondo:', error);
          setStatus({ error: `Error al subir imagen: ${errorMessage}` });
          setIsSubmitting(false);
          return;
        }
      }

      // Preparar datos para actualizar
      const updatedData = {
        socialIcons: {
          instagram: { url: data.socialIcons?.instagram?.url, color: socialIconColors.instagram },
          soundcloud: { url: data.socialIcons?.soundcloud?.url, color: socialIconColors.soundcloud },
          youtube: { url: data.socialIcons?.youtube?.url, color: socialIconColors.youtube },
          tiktok: { url: data.socialIcons?.tiktok?.url, color: socialIconColors.tiktok },
          mixcloud: { url: data.socialIcons?.mixcloud?.url || 'https://www.mixcloud.com/biomechanics-wav/', color: socialIconColors.mixcloud }
        },
        backgroundColor: bgColor,
        backgroundSettings: {
          type: backgroundType,
          color: bgColor,
          imageUrl: finalBackgroundImageUrl,
          imageOpacity: backgroundImageOpacity
        },
        styleSettings: {
          titleColor,
          linkCardBackgroundColor,
          linkCardTextColor,
          productBuyButtonColor,
          itemButtonColor
        }
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

  // Cargar datos iniciales
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

        // Inicializar los valores una vez que tengamos los datos
        if (result) {
          // Actualizar configuración de fondo
          setBackgroundType(result.backgroundSettings?.type || 'color');
          setBackgroundImageOpacity(result.backgroundSettings?.imageOpacity || 0.5);
          if (result.backgroundSettings?.imageUrl) {
            setBackgroundPreviewUrl(result.backgroundSettings.imageUrl);
          }
          
          // Actualizar colores
          setBgColor(result.backgroundColor || '#1a1a1a');
          setTitleColor(result.styleSettings?.titleColor || '#ffffff');
          setLinkCardBackgroundColor(result.styleSettings?.linkCardBackgroundColor || '#ffffff');
          setLinkCardTextColor(result.styleSettings?.linkCardTextColor || '#000000');
          setProductBuyButtonColor(result.styleSettings?.productBuyButtonColor || '#ff6b35');
          setItemButtonColor(result.styleSettings?.itemButtonColor || '#3b82f6');
          
          // Actualizar colores de iconos sociales
          setSocialIconColors({
            instagram: result.socialIcons?.instagram?.color || '#E4405F',
            soundcloud: result.socialIcons?.soundcloud?.color || '#FF5500',
            youtube: result.socialIcons?.youtube?.color || '#FF0000',
            tiktok: result.socialIcons?.tiktok?.color || '#000000',
            mixcloud: result.socialIcons?.mixcloud?.color || '#52ADE9'
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [setBgColor, setTitleColor, setLinkCardBackgroundColor, setLinkCardTextColor, 
      setProductBuyButtonColor, setItemButtonColor, setSocialIconColors, 
      setBackgroundPreviewUrl, setBackgroundType, setBackgroundImageOpacity]);

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
          Configuración de Diseño
        </h1>
        <p className="text-gray-600">
          Personaliza los colores y el estilo de tu página
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sección de Fondo */}
            <div className="col-span-1">
              <BackgroundConfig
                backgroundType={backgroundType}
                setBackgroundType={setBackgroundType}
                bgColor={bgColor}
                setBgColor={setBgColor}
                backgroundPreviewUrl={backgroundPreviewUrl}
                backgroundImageOpacity={backgroundImageOpacity}
                setBackgroundImageOpacity={setBackgroundImageOpacity}
                onBackgroundFileSelect={onBackgroundFileSelect}
                isValidHexColor={isValidHexColor}
              />
            </div>

            {/* Sección de Iconos Sociales */}
            <div className="col-span-1">
              <SocialIconsConfig
                socialIconColors={socialIconColors}
                onColorChange={handleSocialIconColorChange}
                isValidHexColor={isValidHexColor}
              />
            </div>

            {/* Sección de Colores de Elementos */}
            <div className="col-span-1">
              <StyleConfig
                titleColor={titleColor}
                setTitleColor={setTitleColor}
                linkCardBackgroundColor={linkCardBackgroundColor}
                setLinkCardBackgroundColor={setLinkCardBackgroundColor}
                linkCardTextColor={linkCardTextColor}
                setLinkCardTextColor={setLinkCardTextColor}
                productBuyButtonColor={productBuyButtonColor}
                setProductBuyButtonColor={setProductBuyButtonColor}
                itemButtonColor={itemButtonColor}
                setItemButtonColor={setItemButtonColor}
                isValidHexColor={isValidHexColor}
              />
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
