import { clerkClient } from '@clerk/nextjs/server'
import { currentUser } from '@clerk/nextjs/server'

export default async function MakeAdmin() {
    const user = await currentUser()
    
    if (!user) {
        return (
            <div className="p-6 bg-gray-100 min-h-screen">
                <h1 className="text-2xl font-bold mb-6">Asignar Rol Admin</h1>
                <p className="bg-red-100 p-4 rounded">
                    ❌ Debes estar logueado para usar esta página
                </p>
                <div className="mt-4">
                    <a href="/sign-in" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Iniciar Sesión
                    </a>
                </div>
            </div>
        )
    }

    // Información del usuario actual
    const userInfo = {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        currentRole: user.publicMetadata?.role || 'sin rol'
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen text-black">
            <h1 className="text-2xl font-bold mb-6">Asignar Rol Admin</h1>
            
            <div className="space-y-4">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-bold text-lg mb-2">Usuario Actual:</h2>
                    <p><strong>ID:</strong> {userInfo.id}</p>
                    <p><strong>Email:</strong> {userInfo.email}</p>
                    <p><strong>Rol actual:</strong> {userInfo.currentRole as string}</p>
                </div>

                {userInfo.currentRole !== 'admin' ? (
                    <form action="/api/make-admin" method="POST" className="bg-white p-4 rounded shadow">
                        <h3 className="font-bold mb-2">Asignar Rol Admin</h3>
                        <input type="hidden" name="userId" value={userInfo.id} />
                        <button 
                            type="submit"
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            🔑 Hacerme Admin
                        </button>
                        <p className="text-sm text-gray-600 mt-2">
                            ⚠️ Esto te dará acceso completo al panel de administración
                        </p>
                    </form>
                ) : (
                    <div className="bg-green-100 p-4 rounded">
                        <p>✅ Ya eres admin. Puedes acceder a todas las funciones.</p>
                        <div className="mt-4">
                            <a href="/admin/links" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                Ir a Admin Links
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
