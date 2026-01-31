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
}

type ProductChanges = {
  [key: string]: Partial<Product>
}

export function ProductTable({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [changes, setChanges] = useState<ProductChanges>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [creating, setCreating] = useState(false)
  const [createMessage, setCreateMessage] = useState('')
  const [newProduct, setNewProduct] = useState({
    title: '',
    type: 'ticket',
    price: 0,
    visible: true,
    is_yoga_add_on: false,
    stock: 25,
    payment_link: ''
  })

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

  const canCreate = newProduct.title.trim().length > 0 && newProduct.price > 0

  const createProduct = async () => {
    if (!canCreate) return
    setCreating(true)
    setCreateMessage('')

    try {
      const payload = {
        title: newProduct.title.trim(),
        type: newProduct.type,
        price: Number(newProduct.price),
        visible: newProduct.visible,
        is_yoga_add_on: newProduct.is_yoga_add_on,
        stock: newProduct.is_yoga_add_on ? Number(newProduct.stock || 25) : null,
        payment_link: newProduct.payment_link?.trim() || null
      }

      const res = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error creando producto')

      const created = json.product as Product
      setProducts(prev => [...prev, created])
      setCreateMessage('✅ Producto creado correctamente')
      setNewProduct({
        title: '',
        type: 'ticket',
        price: 0,
        visible: true,
        is_yoga_add_on: false,
        stock: 25,
        payment_link: ''
      })
      setTimeout(() => setCreateMessage(''), 3000)
    } catch (err) {
      setCreateMessage(`❌ Error: ${(err as Error).message}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 16, padding: 12, background: '#222', borderRadius: 6 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Agregar producto</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.7fr 0.7fr 0.7fr 0.7fr 1.5fr auto', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Nombre"
            value={newProduct.title}
            onChange={(e) => setNewProduct(prev => ({ ...prev, title: e.target.value }))}
            style={{ padding: 6 }}
          />
          <select
            value={newProduct.type}
            onChange={(e) => setNewProduct(prev => ({ ...prev, type: e.target.value }))}
            style={{ padding: 6 }}
          >
            <option value="ticket">ticket</option>
            <option value="item">item</option>
          </select>
          <input
            type="number"
            placeholder="Precio"
            value={newProduct.price}
            onChange={(e) => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
            style={{ padding: 6 }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <input
              type="checkbox"
              checked={newProduct.visible}
              onChange={(e) => setNewProduct(prev => ({ ...prev, visible: e.target.checked }))}
            />
            Visible
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <input
              type="checkbox"
              checked={newProduct.is_yoga_add_on}
              onChange={(e) => setNewProduct(prev => ({ ...prev, is_yoga_add_on: e.target.checked }))}
            />
            Yoga add-on
          </label>
          <input
            type="number"
            placeholder="Yoga cap"
            value={newProduct.stock}
            onChange={(e) => setNewProduct(prev => ({ ...prev, stock: Number(e.target.value) }))}
            disabled={!newProduct.is_yoga_add_on}
            style={{ padding: 6, opacity: newProduct.is_yoga_add_on ? 1 : 0.5 }}
          />
          <input
            type="text"
            placeholder="Fintoc link"
            value={newProduct.payment_link}
            onChange={(e) => setNewProduct(prev => ({ ...prev, payment_link: e.target.value }))}
            style={{ padding: 6 }}
          />
          <button
            onClick={createProduct}
            disabled={!canCreate || creating}
            style={{
              padding: '8px 12px',
              background: !canCreate || creating ? '#555' : '#7dff31',
              color: !canCreate || creating ? '#888' : '#000',
              cursor: !canCreate || creating ? 'not-allowed' : 'pointer',
              border: 'none',
              borderRadius: 4,
              fontWeight: 'bold'
            }}
          >
            {creating ? '⏳ Creando...' : '➕ Agregar'}
          </button>
        </div>
        {createMessage && (
          <div style={{ marginTop: 8, fontSize: 13, fontWeight: 'bold', color: createMessage.startsWith('✅') ? '#28a745' : '#dc3545' }}>
            {createMessage}
          </div>
        )}
      </div>

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
                <small>ID: {p.id}</small>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
