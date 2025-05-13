import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { redirect } from 'next/navigation'
import { logout } from './logout'

export default async function AdminPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    const secret = process.env.JWT_SECRET!

    try {
        const decoded = verify(token!, secret)

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h1>Panel de Administración</h1>
                <p>Bienvenido, {(decoded as any).user}</p>
                <form action={logout}>
                    <button type="submit">Cerrar sesión</button>
                </form>
            </div>
        )
    } catch (err) {
        redirect('/login')
    }
}
