import { getUserFromCookie } from '@/lib/auth'

export default async function AdminBadge() {
    const user = await getUserFromCookie()
    const isAdmin = user === process.env.ADMIN_USER

    if (!isAdmin) return null

    return (
        <div style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            background: '#000',
            color: '#fff',
            padding: '0.5rem 1rem',
            borderRadius: '999px',
            fontSize: '0.875rem',
            opacity: 0.8,
            zIndex: 50,
        }}>
            Tomás 🎧
        </div>
    )
}
