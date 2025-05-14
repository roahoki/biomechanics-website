import { getUserFromCookie } from '@/lib/auth'

export default async function LinksPage() {
    const user = await getUserFromCookie()
    const isAdmin = user === process.env.ADMIN_USER

    return (
        <div>
            <h1>Links Públicos</h1>

            <ul>
                <li>https://ejemplo.com</li>
                <li>https://otro-link.com</li>
            </ul>

            {isAdmin && (
                <div style={{ marginTop: '1rem' }}>
                    <h2>Acciones de administrador</h2>
                    <button>Editar Links</button>
                </div>
            )}
        </div>
    )
}
