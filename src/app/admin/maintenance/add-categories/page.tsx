'use client'

import { useState } from 'react'
import { addCategoriesToExistingData } from '../add-categories'
import { diagnoseDatabaseStructure } from '../diagnose-db'

export default function AddCategoriesPage() {
  const [status, setStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
    error?: string;
  }>({ loading: false })

  const [diagnoseStatus, setDiagnoseStatus] = useState<{
    loading: boolean;
    data?: any;
    error?: string;
  }>({ loading: false })

  const handleDiagnose = async () => {
    if (diagnoseStatus.loading) return

    setDiagnoseStatus({ loading: true })
    
    try {
      const result = await diagnoseDatabaseStructure()
      
      if (result.success) {
        setDiagnoseStatus({
          loading: false,
          data: result.data
        })
      } else {
        setDiagnoseStatus({
          loading: false,
          error: result.error
        })
      }
    } catch (error) {
      setDiagnoseStatus({
        loading: false,
        error: (error as Error).message
      })
    }
  }

  const handleAddCategories = async () => {
    if (status.loading) return

    setStatus({ loading: true })
    
    try {
      const result = await addCategoriesToExistingData()
      
      if (result.success) {
        setStatus({
          loading: false,
          success: true,
          message: result.message
        })
      } else {
        setStatus({
          loading: false,
          success: false,
          error: result.error
        })
      }
    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        error: (error as Error).message
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Agregar Categorías a Datos Existentes</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Paso 1: Diagnosticar estructura de datos</h2>
          <p className="text-gray-300 mb-4">
            Primero vamos a verificar la estructura actual de tu base de datos.
          </p>
          
          <button
            onClick={handleDiagnose}
            disabled={diagnoseStatus.loading}
            className={`px-6 py-3 rounded-lg font-semibold mr-4 ${diagnoseStatus.loading 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
          >
            {diagnoseStatus.loading ? 'Diagnosticando...' : 'Diagnosticar Base de Datos'}
          </button>
        </div>

        {diagnoseStatus.data && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Estructura detectada:</h3>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-green-400 mb-2"><strong>Filas en la tabla:</strong> {diagnoseStatus.data.totalRows}</p>
              <p className="text-blue-400 mb-2"><strong>Columnas:</strong> {diagnoseStatus.data.columns.join(', ')}</p>
              <details className="mt-4">
                <summary className="text-yellow-400 cursor-pointer hover:text-yellow-300 mb-2">
                  Ver datos completos (hacer clic para expandir)
                </summary>
                <pre className="text-xs text-gray-300 bg-black p-3 rounded overflow-auto max-h-96">
                  {JSON.stringify(diagnoseStatus.data.allData, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}

        {diagnoseStatus.error && (
          <div className="p-4 bg-red-900 border border-red-600 text-red-200 rounded-lg mb-6">
            <strong>❌ Error en diagnóstico:</strong> {diagnoseStatus.error}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Paso 2: Agregar categorías</h2>
          <p className="text-gray-300 mb-4">
            Esta herramienta agregará las categorías predeterminadas a tus datos existentes en Supabase.
          </p>
          <p className="text-yellow-400 mb-6">
            <strong>Importante:</strong> Solo ejecuta esto una vez para agregar las categorías a tus datos existentes.
          </p>
          
          <button
            onClick={handleAddCategories}
            disabled={status.loading}
            className={`px-6 py-3 rounded-lg font-semibold ${status.loading 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            {status.loading ? 'Agregando categorías...' : 'Agregar Categorías'}
          </button>
        </div>
        
        {status.success && (
          <div className="p-4 bg-green-900 border border-green-600 text-green-200 rounded-lg mb-6">
            <strong>✅ Éxito:</strong> {status.message}
          </div>
        )}
        
        {status.error && (
          <div className="p-4 bg-red-900 border border-red-600 text-red-200 rounded-lg mb-6">
            <strong>❌ Error:</strong> {status.error}
          </div>
        )}
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">¿Qué hace esta operación?</h2>
          <ul className="list-disc pl-6 text-gray-300 space-y-2">
            <li>Lee tus datos actuales de Supabase</li>
            <li>Agrega la propiedad <code className="bg-gray-700 px-2 py-1 rounded">categories</code> con las categorías predeterminadas</li>
            <li>Mantiene todos tus datos existentes (links, configuración, etc.)</li>
            <li>Las categorías predeterminadas son: <strong>["Música", "Tienda", "Eventos", "Prensa", "Posts"]</strong></li>
          </ul>
          
          <div className="mt-6 p-4 bg-blue-900 border border-blue-600 rounded-lg">
            <h3 className="text-blue-200 font-semibold mb-2">Después de ejecutar esta migración:</h3>
            <ol className="list-decimal pl-6 text-blue-200 space-y-1">
              <li>Ve a <code>/admin/links</code> para gestionar categorías</li>
              <li>Asigna categorías a tus items existentes</li>
              <li>Ve a <code>/links</code> para ver el filtro funcionando</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
