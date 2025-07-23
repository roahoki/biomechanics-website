import { getSupabaseClient } from '@/lib/supabase-db'

export default async function TestSupabase() {
    let connectionStatus = 'error'
    let bucketsStatus = 'error'
    let bucketsList: any[] = []
    
    try {
        // Probar conexión básica
        const supabase = getSupabaseClient({ admin: true })
        
        // Intentar listar buckets
        const { data: buckets, error } = await supabase.storage.listBuckets()
        
        if (error) {
            throw new Error(`Error listando buckets: ${error.message}`)
        }
        
        connectionStatus = 'success'
        bucketsStatus = 'success'
        bucketsList = buckets || []
        
    } catch (error) {
        console.error('Error probando Supabase:', error)
    }
    
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Prueba de Conexión Supabase</h1>
            
            <div className="space-y-4">
                <div className={`p-4 rounded ${connectionStatus === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <h2 className="font-bold">Conexión a Supabase:</h2>
                    <p>{connectionStatus === 'success' ? '✅ Conectado' : '❌ Error de conexión'}</p>
                </div>
                
                <div className={`p-4 rounded ${bucketsStatus === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <h2 className="font-bold">Storage Buckets:</h2>
                    <p>{bucketsStatus === 'success' ? '✅ Acceso correcto' : '❌ Error accediendo a storage'}</p>
                    
                    {bucketsList.length > 0 && (
                        <div className="mt-2">
                            <p className="font-medium">Buckets encontrados:</p>
                            <ul className="list-disc list-inside">
                                {bucketsList.map((bucket: any) => (
                                    <li key={bucket.id} className="text-sm">
                                        {bucket.name} ({bucket.public ? 'público' : 'privado'})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="mt-6">
                <a href="/admin/links" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Ir a Admin Links
                </a>
            </div>
        </div>
    )
}
