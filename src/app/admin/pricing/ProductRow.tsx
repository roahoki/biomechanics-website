'use client'

import { useState, useEffect } from 'react'

type Product = {
  id: string
  title: string
  type: string
  price: number
  visible: boolean
  is_yoga_add_on: boolean
  stock: number | null
  payment_link: string | null
  mercadopago_link: string | null
}

type ProductChanges = {
  [key: string]: Partial<Product>
}

export function ProductTable({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [changes, setChanges] = useState<ProductChanges>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const hasChanges = Object.keys(changes).length > 0

  const updateField = (id: string, field: keyof Product, value: any) => {
    setChanges(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }))
    
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ))
  }

  const saveChanges = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const updates = Object.entries(changes).map(([id, fields]) => ({
        id,
        ...fields
      }))

      for (const update of updates) {
        const res = await fetch('/api/products/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update)
        })
        
        if (!res.ok) {
          const json = await res.json()
          throw new Error(json.error || 'Error actualizando')
        }
      }

      setChanges({})
      setMessage(`✅ ${updates.length} producto(s) actualizado(s) correctamente`)
      
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(`❌ Error: ${(err as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          onClick={saveChanges}
          disabled={!hasChanges || saving}
          style={{
            padding: '10px 20px',
            fontSize: 16,
            backgroundColor: hasChanges ? '#ff6b35' : '#666',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: hasChanges ? 'pointer' : 'not-allowed',
            fontWeight: 'bold'
          }}
        >
          {saving ? '⏳ Guardando...' : '💾 Guardar cambios'}
        </button>
        
        {hasChanges && (
          <span style={{ color: '#ff6b35', fontSize: 14 }}>
            {Object.keys(changes).length} producto(s) modificado(s)
          </span>
        )}
        
        {message && (
          <span style={{ 
            fontSize: 14, 
            fontWeight: 'bold',
            color: message.startsWith('✅') ? '#28a745' : '#dc3545'
          }}>
            {message}
          </span>
        )}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Precio</th>
            <th>Visible</th>
            <th>Yoga cap</th>
            <th>Fintoc link</th>
            <th>Mercado Pago link</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{ borderTop: '1px solid #555' }}>
              <td>{p.title}</td>
              <td>{p.type}</td>
              <td>
                <input 
                  type="number" 
                  value={p.price} 
                  onChange={(e) => updateField(p.id, 'price', Number(e.target.value))}
                  style={{ width: 80 }}
                />
              </td>
              <td>
                <input 
                  type="checkbox" 
                  checked={p.visible} 
                  onChange={(e) => updateField(p.id, 'visible', e.target.checked)}
                />
              </td>
              <td>
                {p.is_yoga_add_on ? (
                  <input 
                    type="number" 
                    value={p.stock ?? 25} 
                    onChange={(e) => updateField(p.id, 'stock', Number(e.target.value))}
                    style={{ width: 60 }}
                  />
                ) : (
                  <span>-</span>
                )}
              </td>
              <td>
                <input 
                  type="text" 
                  value={p.payment_link ?? ''} 
                  onChange={(e) => updateField(p.id, 'payment_link', e.target.value)}
                  style={{ width: 200 }}
                />
              </td>
              <td>
                <input 
                  type="text" 
                  value={p.mercadopago_link ?? ''} 
                  onChange={(e) => updateField(p.id, 'mercadopago_link', e.target.value)}
                  style={{ width: 200 }}
                  placeholder="https://mpago.la/..."
                />
              </td>
              <td>
                <small>ID: {p.id}</small>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
