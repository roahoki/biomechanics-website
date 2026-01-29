'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useClerk } from '@clerk/nextjs'

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const { signOut } = useClerk()

  const handleMakeAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/make-admin', {
        method: 'POST',
      })
      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setMessage('✅ ' + data.message)
      } else {
        setMessage('❌ ' + (data.error || 'Error'))
      }
    } catch (error) {
      setMessage('❌ Error en la solicitud')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ maxWidth: 600, margin: '50px auto', padding: 20 }}>
        <h1>✅ Admin activado</h1>
        <p style={{ fontSize: 16, marginBottom: 20 }}>
          Se te ha asignado el rol de admin correctamente.
        </p>
        <p style={{ fontSize: 16, marginBottom: 20, color: '#666' }}>
          <strong>Ahora debes cerrar sesión y volver a iniciar</strong> para que los cambios se reflejen:
        </p>
        
        <button
          onClick={() => signOut({ redirectUrl: '/' })}
          style={{
            padding: '12px 24px',
            fontSize: 16,
            backgroundColor: '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 'bold',
            marginRight: 10
          }}
        >
          🚪 Cerrar sesión y volver a iniciar
        </button>

        <p style={{ marginTop: 30, fontSize: 14, color: '#666' }}>
          Una vez hayas reiniciado sesión, podrás acceder a{' '}
          <Link href="/admin/pricing" style={{ color: '#ff6b35', fontWeight: 'bold' }}>
            /admin/pricing
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '50px auto', padding: 20 }}>
      <h1>🔐 Configuración Admin</h1>
      <p>Haz clic en el botón abajo para asignarte el rol de admin:</p>
      
      <form onSubmit={handleMakeAdmin}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 24px',
            fontSize: 16,
            backgroundColor: loading ? '#ccc' : '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? '⏳ Procesando...' : '👑 Hacerme Admin'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: 20, fontSize: 16, fontWeight: 'bold', color: success ? '#28a745' : '#dc3545' }}>
          {message}
        </p>
      )}
    </div>
  )
}
