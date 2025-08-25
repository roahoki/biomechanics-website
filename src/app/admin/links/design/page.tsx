'use client';

import React, { useEffect, useState } from 'react';
import { checkAdminPermissions } from '../../check-permissions';
import { getLinksData } from '@/utils/links';

export default function AdminLinksDesign() {
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

  // Sección de diseño: colores y configuración visual
  const { backgroundColor, backgroundSettings, styleSettings } = data;

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
        <p className="mb-4 text-gray-700">Esta sección está en desarrollo. Pronto podrás editar el diseño de tu página aquí.</p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="font-bold text-lg mb-2">Configuración Actual</h2>
          <p><strong>Color de fondo:</strong> {backgroundColor || '#1a1a1a'}</p>
          <p><strong>Tipo de fondo:</strong> {backgroundSettings?.type || 'color'}</p>
          <p><strong>Color del título:</strong> {styleSettings?.titleColor || '#ffffff'}</p>
          <p><strong>Color de tarjetas:</strong> {styleSettings?.linkCardBackgroundColor || '#ffffff'}</p>
          <p><strong>Color de texto en tarjetas:</strong> {styleSettings?.linkCardTextColor || '#000000'}</p>
          <p><strong>Color de botón de compra:</strong> {styleSettings?.productBuyButtonColor || '#ff6b35'}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded flex flex-col items-center" style={{backgroundColor: backgroundColor || '#1a1a1a'}}>
            <div className="w-full h-16 mb-2 rounded" style={{backgroundColor: styleSettings?.linkCardBackgroundColor || '#ffffff'}}></div>
            <div className="w-full h-8 rounded" style={{backgroundColor: styleSettings?.productBuyButtonColor || '#ff6b35'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
