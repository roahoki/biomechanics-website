'use client';

import React, { useEffect, useState } from 'react';
import { checkAdminPermissions } from '../../../check-permissions';
import { getLinksData } from '@/utils/links';
import { PostsNavigation } from '@/components';

export default function PostCategories() {
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

  const { categories } = data;

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Categorías de Publicaciones
        </h1>
        <p className="text-gray-600">
          Gestiona las categorías para tus publicaciones
        </p>
      </div>
      
      <PostsNavigation />

      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="mb-4 text-gray-700">Esta sección está en desarrollo. Pronto podrás gestionar categorías de publicaciones aquí.</p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="font-bold text-lg mb-2">Categorías Actuales</h2>
          <div className="flex gap-4 mb-4">
            <div className="bg-green-50 p-4 rounded-lg text-center flex-1">
              <p className="text-sm text-green-500 mb-1">Total Categorías</p>
              <p className="text-2xl font-bold text-gray-800">{categories?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-medium text-lg mb-3">Lista de Categorías</h3>
          <div className="space-y-2">
            {categories && categories.length > 0 ? (
              categories.map((category: any, index: number) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                  </div>
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {category.id}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No hay categorías configuradas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
