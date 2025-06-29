'use client'

import { useState } from 'react'
import { migrateJsonToSupabase } from '../migration'

export default function MigrationPage() {
  const [status, setStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
    error?: string;
  }>({ loading: false })

  const handleMigration = async () => {
    if (status.loading) return

    setStatus({ loading: true })
    
    try {
      const result = await migrateJsonToSupabase()
      
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Migrar datos a Supabase</h1>
      
      <div className="mb-6">
        <p className="mb-2">
          Esta herramienta migrará todos los datos del archivo local <code>links.json</code> a la base de datos Supabase.
        </p>
        <p className="mb-4 text-yellow-600">
          Nota: Es recomendable hacer una copia de seguridad de tus datos antes de realizar esta operación.
        </p>
        
        <button
          onClick={handleMigration}
          disabled={status.loading}
          className={`px-4 py-2 rounded ${status.loading 
            ? 'bg-gray-400' 
            : 'bg-blue-600 hover:bg-blue-700'} text-white`}
        >
          {status.loading ? 'Migrando...' : 'Iniciar migración'}
        </button>
      </div>
      
      {status.success && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {status.message}
        </div>
      )}
      
      {status.error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {status.error}
        </div>
      )}
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Instrucciones:</h2>
        <ol className="list-decimal pl-6">
          <li className="mb-2">Verifica que la tabla <code>site_settings</code> exista en tu base de datos Supabase.</li>
          <li className="mb-2">Asegúrate de tener configuradas correctamente las variables de entorno:</li>
          <ul className="list-disc pl-6 mb-2">
            <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
            <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
            <li><code>SUPABASE_SERVICE_KEY</code> (para operaciones del servidor)</li>
          </ul>
          <li className="mb-2">Haz clic en &ldquo;Iniciar migración&rdquo; para transferir los datos.</li>
          <li>Después de la migración, los datos se leerán primero desde Supabase y, solo en caso de error, se usará el archivo local.</li>
        </ol>
      </div>
    </div>
  )
}
