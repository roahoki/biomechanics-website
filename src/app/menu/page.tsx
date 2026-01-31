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

type CartItem = {
  product_id: number
  quantity: number
  product: Product
}

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qty, setQty] = useState<Record<number, number>>({})
  const [cart, setCart] = useState<CartItem[]>([])
  const [paying, setPaying] = useState(false)
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')

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

  const addToCart = (productId: number) => {
    const quantity = qty[productId] ?? 1
    const product = products.find(p => p.id === productId)
    if (!product) return

    const existing = cart.find(item => item.product_id === productId)
    if (existing) {
      setCart(cart.map(item =>
        item.product_id === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      setCart([...cart, { product_id: productId, quantity, product }])
    }
    setQty(prev => ({ ...prev, [productId]: 1 }))
  }

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product_id !== productId))
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío')
      return
    }
    if (!buyerName.trim()) {
      alert('Por favor ingresa tu nombre')
      return
    }
    if (!buyerEmail.trim()) {
      alert('Por favor ingresa tu email')
      return
    }
    if (!buyerEmail.includes('@')) {
      alert('Por favor ingresa un email válido')
      return
    }

    setPaying(true)
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName,
          buyerContact: buyerEmail,
          items: cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
          }))
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error creando orden')
      if (json.payment_link && json.orderId) {
        // Guardar ID de orden en sessionStorage para referencia después de Fintoc
        sessionStorage.setItem('lastOrderId', json.orderId)
        // Redirigir directamente a Fintoc TPP para el pago
        window.location.href = json.payment_link
      } else {
        alert('Error: no se pudo generar link de pago')
      }
    } catch (e: any) {
      alert(e.message)
      setPaying(false)
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div>{t.title}</div>
                      <strong>${t.price}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <label>Cantidad:</label>
                      <input
                        type="number"
                        min={1}
                        value={qty[t.id] ?? 1}
                        onChange={e => setQty(prev => ({ ...prev, [t.id]: Math.max(1, parseInt(e.target.value, 10)) }))}
                        style={{ width: 60 }}
                      />
                      <button
                        onClick={() => addToCart(t.id)}
                        style={{ padding: '8px 12px', background: '#C23B22', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        + Carrito
                      </button>
                    </div>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div>{b.title}</div>
                      <strong>${b.price}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <label>Cantidad:</label>
                      <input
                        type="number"
                        min={1}
                        value={qty[b.id] ?? 1}
                        onChange={e => setQty(prev => ({ ...prev, [b.id]: Math.max(1, parseInt(e.target.value, 10)) }))}
                        style={{ width: 60 }}
                      />
                      <button
                        onClick={() => addToCart(b.id)}
                        style={{ padding: '8px 12px', background: '#C23B22', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        + Carrito
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {cart.length > 0 && (
            <section style={{ marginTop: 24, padding: 16, background: '#222', borderRadius: 8 }}>
              <h2>Carrito ({cartItemsCount} items)</h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {cart.map(item => (
                  <li key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #444' }}>
                    <div>
                      <strong>{item.product.title}</strong> x {item.quantity}
                      <br />
                      <small>${(item.product.price * item.quantity).toLocaleString('es-CL')}</small>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      style={{ padding: '4px 8px', background: '#C23B22', color: '#fff', cursor: 'pointer', fontSize: 12 }}
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '2px solid #7dff31' }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Nombre</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Tu nombre completo"
                    style={{ width: '100%', padding: '8px', marginBottom: 12, boxSizing: 'border-box' }}
                  />
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Email</label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="tu@email.com"
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <strong style={{ fontSize: 18 }}>Total:</strong>
                  <strong style={{ fontSize: 20, color: '#7dff31' }}>${cartTotal.toLocaleString('es-CL')}</strong>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={paying}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: paying ? '#666' : '#7dff31',
                    color: '#000',
                    cursor: paying ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: 16,
                    border: 'none',
                    borderRadius: 4
                  }}
                >
                  {paying ? 'Procesando…' : 'Pagar con Fintoc'}
                </button>
              </div>
            </section>
          )}
        </>
      )}

      <hr style={{ margin: '24px 0' }} />
      <Link href="/">← Volver</Link>
    </div>
  )
}
