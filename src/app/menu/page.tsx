"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Product = {
  id: number
  title: string
  type: 'ticket' | 'item'
  price: number
  visible: boolean
  category: string | null
  is_yoga_add_on?: boolean
  stock?: number | null
  payment_link?: string | null
  mercadopago_link?: string | null
}

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qty, setQty] = useState<Record<number, number>>({})

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/products/list', { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Error cargando productos')
        setProducts(json.products || [])
      } catch (e: any) {
        setError(e.message)
        console.error('Error:', e)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const tickets = products.filter(p => p.type === 'ticket')
  const barItems = products.filter(p => p.type === 'item')

  const crearOrden = async (productId: number) => {
    try {
      const quantity = qty[productId] ?? 1
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ product_id: productId, quantity }] })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error creando orden')
      if (json.order_id) {
        location.href = `/orders/${json.order_id}`
      }
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <h1>Menú del Evento</h1>
      {loading && <p>Cargando…</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && products.length === 0 && (
        <p style={{ color: '#999' }}>
          No hay productos. Verifica que las tablas en Supabase estén creadas y ejecuta el seed.
        </p>
      )}

      {products.length > 0 && (
        <>
          <section>
            <h2>Entradas</h2>
            <p>Compra sin login. Yoga tiene cupo limitado (25).</p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {tickets.map(t => (
                <li key={t.id} style={{ marginBottom: 12, border: '1px solid #333', padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{t.title}</span>
                    <strong>${t.price}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => crearOrden(t.id)} style={{ padding: '8px 12px', background: '#C23B22', color: '#fff', cursor: 'pointer' }}>
                      Obtener código
                    </button>
                    {t.payment_link ? (
                      <a href={t.payment_link} target="_blank" rel="noopener noreferrer">
                        <button style={{ padding: '8px 12px', background: '#7dff31', color: '#000', cursor: 'pointer' }}>
                          Pagar con Fintoc
                        </button>
                      </a>
                    ) : null}
                    {t.mercadopago_link ? (
                      <a href={t.mercadopago_link} target="_blank" rel="noopener noreferrer">
                        <button style={{ padding: '8px 12px', background: '#009ee3', color: '#fff', cursor: 'pointer' }}>
                          Pagar con Mercado Pago
                        </button>
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Barra (presencial)</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {barItems.map(b => (
                <li key={b.id} style={{ marginBottom: 12, border: '1px solid #333', padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{b.title}</span>
                    <strong>${b.price}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    <label>Cantidad:</label>
                    <input
                      type="number"
                      min={1}
                      value={qty[b.id] ?? 1}
                      onChange={e => setQty(prev => ({ ...prev, [b.id]: Math.max(1, parseInt(e.target.value, 10)) }))}
                      style={{ width: 60 }}
                    />
                    <button onClick={() => crearOrden(b.id)} style={{ padding: '8px 12px', background: '#C23B22', color: '#fff', cursor: 'pointer' }}>
                      Obtener código
                    </button>
                    {b.payment_link ? (
                      <a href={b.payment_link} target="_blank" rel="noopener noreferrer">
                        <button style={{ padding: '8px 12px', background: '#7dff31', color: '#000', cursor: 'pointer' }}>
                          Pagar con Fintoc
                        </button>
                      </a>
                    ) : null}
                    {b.mercadopago_link ? (
                      <a href={b.mercadopago_link} target="_blank" rel="noopener noreferrer">
                        <button style={{ padding: '8px 12px', background: '#009ee3', color: '#fff', cursor: 'pointer' }}>
                          Pagar con Mercado Pago
                        </button>
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <hr style={{ margin: '24px 0' }} />
      <Link href="/">← Volver</Link>
    </div>
  )
}
