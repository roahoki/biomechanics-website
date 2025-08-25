'use client';

import React, { useEffect, useState } from 'react';
import { SortableLinksFormWithProducts as SortableLinksForm } from "@/components";
import { checkAdminPermissions } from './check-permissions';
import { getLinksData } from '@/utils/links';

export default function AdminHome() {
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

  const handleCategoriesChange = () => {
    // Recargar los datos cuando las categorías cambien
    getLinksData().then(setData);
  };

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

  const { links, title, description, profileImage, profileImageType, socialIcons, backgroundColor, backgroundSettings, styleSettings, categories } = data;

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Panel de Administración
        </h1>
        <p className="text-gray-600">
          Gestiona y visualiza tu página de enlaces
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <p className='text-gray-600 bg-red-50'>Página en desarrollo</p>
      </div>
    </div>
  );
}