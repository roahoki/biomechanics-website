import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    const secret = process.env.JWT_SECRET!

    try {
        const decoded = verify(token!, secret)
        return (
            <div>
                <h1>Panel de Administración</h1>
                <p>Bienvenido, {(decoded as any).user}</p>
            </div>
        )
    } catch (err) {
        redirect('/login')
    }
}
