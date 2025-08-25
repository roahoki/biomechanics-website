'use client';

import React, { useEffect, useState } from 'react';
import { checkAdminPermissions } from '../check-permissions';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [hasPermissions, setHasPermissions] = useState(false);

  useEffect(() => {
    async function checkPermission() {
      try {
        const isAdmin = await checkAdminPermissions();
        if (!isAdmin) {
          return;
        }
        
        setHasPermissions(true);
      } catch (error) {
        console.error('Error checking permissions:', error);
      } finally {
        setLoading(false);
      }
    }

    checkPermission();
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

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Configuración
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-800">
          Aquí estará la configuración del perfil de admin
        </p>
      </div>
    </div>
  );
}
