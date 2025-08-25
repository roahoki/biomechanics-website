'use client';

import React, { useEffect, useState } from 'react';
import { checkAdminPermissions } from '../../../check-permissions';
import { getLinksData } from '@/utils/links';
import { PostsNavigation } from '@/components';

export default function CreatePost() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasPermissions, setHasPermissions] = useState(false);

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
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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
          Crear Publicación
        </h1>
        <p className="text-gray-600">
          Crea una nueva publicación para tu sitio
        </p>
      </div>
      
      <PostsNavigation />

      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="mb-4 text-gray-700">Esta sección está en desarrollo. Pronto podrás crear publicaciones aquí.</p>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="font-bold text-blue-800 mb-2">Próximamente</h2>
          <p className="text-blue-600">
            El formulario para crear publicaciones estará disponible en breve.
          </p>
        </div>
      </div>
    </div>
  );
}
