'use client'

import { useState } from 'react'

export default function TestUpload() {
    const [status, setStatus] = useState<string>('')
    const [result, setResult] = useState<any>(null)

    const testProductUpload = async () => {
        setStatus('Iniciando prueba de productos...')
        
        try {
            const canvas = document.createElement('canvas')
            canvas.width = 100
            canvas.height = 100
            const ctx = canvas.getContext('2d')!
            ctx.fillStyle = '#ff0000'
            ctx.fillRect(0, 0, 100, 100)
            
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8)
            })
            
            const testFile = new File([blob], 'test-product.jpg', { type: 'image/jpeg' })
            
            const formData = new FormData()
            formData.append('images', testFile)
            formData.append('productId', '999')
            
            setStatus('Enviando producto...')
            
            const response = await fetch('/api/upload-product-images', {
                method: 'POST',
                body: formData
            })
            
            const result = await response.json()
            
            setStatus(response.ok ? 'Producto: ✅ Éxito' : 'Producto: ❌ Error')
            setResult({ type: 'product', status: response.status, ok: response.ok, data: result })
            
        } catch (error) {
            setStatus('Producto: ❌ Error')
            setResult({ type: 'product', error: error instanceof Error ? error.message : 'Error desconocido' })
        }
    }

    const testItemUpload = async () => {
        setStatus('Iniciando prueba de items...')
        
        try {
            const canvas = document.createElement('canvas')
            canvas.width = 100
            canvas.height = 100
            const ctx = canvas.getContext('2d')!
            ctx.fillStyle = '#00ff00'
            ctx.fillRect(0, 0, 100, 100)
            
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8)
            })
            
            const testFile = new File([blob], 'test-item.jpg', { type: 'image/jpeg' })
            
            const formData = new FormData()
            formData.append('images', testFile)
            formData.append('itemId', '888')
            
            setStatus('Enviando item...')
            
            const response = await fetch('/api/upload-item-images', {
                method: 'POST',
                body: formData
            })
            
            const result = await response.json()
            
            setStatus(response.ok ? 'Item: ✅ Éxito' : 'Item: ❌ Error')
            setResult({ type: 'item', status: response.status, ok: response.ok, data: result })
            
        } catch (error) {
            setStatus('Item: ❌ Error')
            setResult({ type: 'item', error: error instanceof Error ? error.message : 'Error desconocido' })
        }
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">🧪 Pruebas de Subida</h1>
            
            <div className="space-y-4">
                <div className="flex gap-4">
                    <button 
                        onClick={testProductUpload}
                        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
                    >
                        📦 Probar Productos
                    </button>
                    
                    <button 
                        onClick={testItemUpload}
                        className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600"
                    >
                        🎯 Probar Items
                    </button>
                </div>
                
                {status && (
                    <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                        <h3 className="font-bold">Estado:</h3>
                        <p>{status}</p>
                    </div>
                )}
                
                {result && (
                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="font-bold">Resultado:</h3>
                        <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
            
            <div className="mt-6">
                <a href="/admin/links" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                    ← Volver a Admin Links
                </a>
            </div>
        </div>
    )
}
