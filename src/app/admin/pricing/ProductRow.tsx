'use client'

import { useState, useEffect } from 'react'

type Product = {
  id: string
  title: string
  type: string
  price: number
  visible: boolean
  stock_type?: 'quantity' | 'boolean' | null
  stock_value?: number | boolean | null
  max_per_order?: number | null
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
  const [newProduct, setNewProduct] = useState<any>({
    title: '',
    type: 'ticket',
    price: 0,
    visible: true,
    stock_type: 'quantity',
    stock_value: 10,
    max_per_order: 0
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
      const maxPerOrder = Number(newProduct.max_per_order)
      const payload = {
        title: newProduct.title.trim(),
        type: newProduct.type,
        price: Number(newProduct.price),
        visible: newProduct.visible,
        stock_type: newProduct.stock_type,
        stock_value: newProduct.stock_type === 'quantity' ? Number(newProduct.stock_value) : true,
        max_per_order: Number.isFinite(maxPerOrder) && maxPerOrder > 0 ? maxPerOrder : null
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
        stock_type: 'quantity',
        stock_value: 10,
        max_per_order: 0
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
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#1a1a1a' }}>
                <th style={{ padding: 8, textAlign: 'left' }}>Nombre</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Tipo</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Precio</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Stock</th>
                <th style={{ padding: 8, textAlign: 'center' }}>Disponible</th>
                <th style={{ padding: 8, textAlign: 'center' }}>Max/orden</th>
                <th style={{ padding: 8, textAlign: 'center' }}>Visible</th>
                <th style={{ padding: 8 }}></th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderTop: '1px solid #555' }}>
                <td style={{ padding: 8 }}>
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct((prev: any) => ({ ...prev, title: e.target.value }))}
                    style={{ padding: 6, width: '100%' }}
                  />
                </td>
                <td style={{ padding: 8 }}>
                  <select
                    value={newProduct.type}
                    onChange={(e) => setNewProduct((prev: any) => ({ ...prev, type: e.target.value }))}
                    style={{ padding: 6, width: '100%' }}
                  >
                    <option value="ticket">ticket</option>
                    <option value="item">item</option>
                  </select>
                </td>
                <td style={{ padding: 8 }}>
                  <input
                    type="number"
                    placeholder="Precio"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct((prev: any) => ({ ...prev, price: Number(e.target.value) }))}
                    style={{ padding: 6, width: '100%' }}
                  />
                </td>
                <td style={{ padding: 8 }}>
                  <select
                    value={newProduct.stock_type}
                    onChange={(e) => setNewProduct((prev: any) => ({ ...prev, stock_type: e.target.value as 'quantity' | 'boolean' }))}
                    style={{ padding: 6, width: '100%' }}
                  >
                    <option value="quantity">Cantidad</option>
                    <option value="boolean">Disponible</option>
                  </select>
                </td>
                <td style={{ padding: 8, textAlign: 'center' }}>
                  {newProduct.stock_type === 'quantity' ? (
                    <input
                      type="number"
                      placeholder="Stock inicial"
                      value={newProduct.stock_value}
                      onChange={(e) => setNewProduct((prev: any) => ({ ...prev, stock_value: Number(e.target.value) }))}
                      style={{ padding: 6, width: 90 }}
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={newProduct.stock_value === true}
                      onChange={(e) => setNewProduct((prev: any) => ({ ...prev, stock_value: e.target.checked }))}
                    />
                  )}
                </td>
                <td style={{ padding: 8, textAlign: 'center' }}>
                  <input
                    type="number"
                    placeholder="Max/orden"
                    value={newProduct.max_per_order}
                    onChange={(e) => setNewProduct((prev: any) => ({ ...prev, max_per_order: Number(e.target.value) }))}
                    style={{ padding: 6, width: 90 }}
                  />
                </td>
                <td style={{ padding: 8, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={newProduct.visible}
                    onChange={(e) => setNewProduct((prev: any) => ({ ...prev, visible: e.target.checked }))}
                  />
                </td>
                <td style={{ padding: 8, textAlign: 'right' }}>
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
                      fontWeight: 'bold',
                      fontSize: 12
                    }}
                  >
                    {creating ? '⏳' : '➕'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#1a1a1a' }}>
              <th style={{ padding: 8, textAlign: 'left' }}>Nombre</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Tipo</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Precio</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Stock</th>
              <th style={{ padding: 8, textAlign: 'center' }}>Disponible</th>
              <th style={{ padding: 8, textAlign: 'center' }}>Max/orden</th>
              <th style={{ padding: 8, textAlign: 'center' }}>Visible</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid #555' }}>
                <td style={{ padding: 8 }}>{p.title}</td>
                <td style={{ padding: 8, fontSize: 12 }}>{p.type}</td>
                <td style={{ padding: 8 }}>
                  <input 
                    type="number" 
                    value={p.price} 
                    onChange={(e) => updateField(p.id, 'price', Number(e.target.value))}
                    style={{ width: 70, padding: 4 }}
                  />
                </td>
                <td style={{ padding: 8, fontSize: 12 }}>{p.stock_type ? (p.stock_type === 'quantity' ? 'Cantidad' : 'Booleano') : '-'}</td>
                <td style={{ padding: 8, textAlign: 'center' }}>
                  {p.stock_type === 'quantity' ? (
                    <input 
                      type="number" 
                      value={typeof p.stock_value === 'number' ? p.stock_value : 0}
                      onChange={(e) => updateField(p.id, 'stock_value', Number(e.target.value))}
                      style={{ width: 60, padding: 4 }}
                    />
                  ) : (
                    <input 
                      type="checkbox" 
                      checked={p.stock_value === true || p.stock_value === 1}
                      onChange={(e) => updateField(p.id, 'stock_value', e.target.checked)}
                    />
                  )}
                </td>
                <td style={{ padding: 8, textAlign: 'center' }}>
                  <input 
                    type="number" 
                    value={typeof p.max_per_order === 'number' ? p.max_per_order : 0}
                    onChange={(e) => updateField(p.id, 'max_per_order', Number(e.target.value))}
                    style={{ width: 70, padding: 4 }}
                  />
                </td>
                <td style={{ padding: 8, textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={p.visible} 
                    onChange={(e) => updateField(p.id, 'visible', e.target.checked)}
                  />
                </td>
                <td style={{ padding: 8, fontSize: 11, color: '#999' }}>
                  ID: {p.id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
