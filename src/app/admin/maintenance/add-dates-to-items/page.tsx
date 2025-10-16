'use client'

import { useState } from 'react'
import { addDatesToExistingItems } from '../add-dates-to-items'

export default function AddDatesToItemsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    itemsUpdated?: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleMigration = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const migrationResult = await addDatesToExistingItems()
      setResult(migrationResult)
    } catch (err: any) {
      setError(err.message || 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🗓️ Migración: Agregar Fechas a Items
          </h1>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              ¿Qué hace esta migración?
            </h2>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>Agrega <code className="bg-blue-100 px-1 rounded">publicationDate</code> (fecha de hoy) a todos los items que no lo tengan</li>
              <li>Mantiene <code className="bg-blue-100 px-1 rounded">activityDate</code> como <code className="bg-blue-100 px-1 rounded">null</code> (opcional)</li>
              <li>No afecta items que ya tengan fechas</li>
              <li>Es seguro ejecutarla múltiples veces</li>
            </ul>
          </div>

          <button
            onClick={handleMigration}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Ejecutando migración...' : 'Ejecutar Migración'}
          </button>

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                ✅ Migración Exitosa
              </h3>
              <p className="text-green-800">{result.message}</p>
              {result.itemsUpdated !== undefined && (
                <p className="text-green-700 mt-2">
                  <strong>Items actualizados:</strong> {result.itemsUpdated}
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                ❌ Error en la Migración
              </h3>
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              💡 Información Técnica
            </h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Formato de fecha: ISO 8601 (YYYY-MM-DD)</li>
              <li>• Campo <code className="bg-gray-200 px-1 rounded">publicationDate</code>: obligatorio</li>
              <li>• Campo <code className="bg-gray-200 px-1 rounded">activityDate</code>: opcional</li>
              <li>• Los usuarios pueden editar estas fechas después desde el admin</li>
            </ul>
          </div>

          <div className="mt-6">
            <a
              href="/admin/links"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Volver al admin de links
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
