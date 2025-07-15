'use client'

export default function TestImagePage() {
    const testImageUrl = 'https://jbgwwdtjwagvradijzvy.supabase.co/storage/v1/object/public/products/product-8/image-1752453706846-0-m3ccpm.jpg'
    
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Test de Imágenes</h1>
            
            {/* Test con CSS background-image */}
            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">CSS background-image:</h2>
                <div 
                    className="w-64 h-32 bg-cover bg-center rounded-lg border"
                    style={{
                        backgroundImage: `url("${testImageUrl}")`
                    }}
                />
            </div>
            
            {/* Test con img tag */}
            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">IMG tag:</h2>
                <img 
                    src={testImageUrl}
                    alt="Test image"
                    className="w-64 h-32 object-cover rounded-lg border"
                    onError={(e) => console.error('Error loading img tag:', e)}
                />
            </div>
            
            {/* Test directo de URL */}
            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">URL directa:</h2>
                <a href={testImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                    {testImageUrl}
                </a>
            </div>
        </div>
    )
}
