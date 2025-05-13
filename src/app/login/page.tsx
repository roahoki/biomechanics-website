'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from './actions'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const ok = await login({ username, password })
        if (ok) router.push('/admin')
        else alert('Credenciales incorrectas')
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: 300 }}>
            <input placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)} />
            <input placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit">Entrar</button>
        </form>
    )
}
