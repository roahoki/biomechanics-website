"use client"

import { useEffect, useState } from 'react'

type OrderItem = {
  id: number
  order_id: string
  product_id: number
  title_snapshot: string
  unit_price: number
  quantity: number
  redeemed_qty: number
}

type Order = {
  id: string
  buyer_name: string | null
  buyer_contact: string | null
  amount: number
  status: string
  redemption_code: string
  created_at: string
  items: OrderItem[]
}

export default function OrdersValidationPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('created') // created, paid, redeemed

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/orders/list', { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Error cargando órdenes')
        setOrders(json.orders || [])
      } catch (e: any) {
        setError(e.message)
        console.error('Error:', e)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const updateOrderStatus = async (orderId: string, action: 'confirm' | 'cancel') => {
    try {
      const endpoint = action === 'confirm' ? 'confirm' : 'cancel'
      const res = await fetch(`/api/orders/${orderId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error actualizando orden')
      
      const newStatus = action === 'confirm' ? 'paid' : 'cancelled'
      // Actualizar estado local
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      alert(action === 'confirm' ? 'Pago confirmado y email enviado' : 'Orden anulada y email enviado')
    } catch (e: any) {
      alert(`Error: ${e.message}`)
    }
  }

  const filteredOrders = orders.filter(o => o.status === filter)

  if (loading) return <div style={{ padding: 16 }}><p>Cargando órdenes…</p></div>
  if (error) return <div style={{ padding: 16 }}><p style={{ color: 'red' }}>Error: {error}</p></div>

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
      <h1>Validación de Pagos</h1>
      <p style={{ color: '#999' }}>Total de órdenes: {orders.length}</p>

      <div style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
        {['created', 'paid', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              background: filter === status ? '#7dff31' : '#333',
              color: filter === status ? '#000' : '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderRadius: 4,
              border: 'none'
            }}
          >
            {status === 'created' ? 'Pendiente' : status === 'paid' ? 'Pagado' : 'Anulado'} ({orders.filter(o => o.status === status).length})
          </button>
        ))}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#222' }}>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #444' }}>Orden ID</th>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #444' }}>Comprador</th>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #444' }}>Contacto</th>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #444' }}>Items</th>
            <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #444' }}>Total</th>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #444' }}>Fecha</th>
            <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #444' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => (
            <tr key={order.id} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: 12, fontFamily: 'monospace', fontSize: 10 }}>
                <strong>{order.id.substring(0, 8)}…</strong>
              </td>
              <td style={{ padding: 12 }}>{order.buyer_name || '—'}</td>
              <td style={{ padding: 12, fontSize: 11 }}>
                <a href={`mailto:${order.buyer_contact}`} style={{ color: '#7dff31', textDecoration: 'none' }}>
                  {order.buyer_contact || '—'}
                </a>
              </td>
              <td style={{ padding: 12 }}>
                <details style={{ cursor: 'pointer' }}>
                  <summary style={{ fontWeight: 'bold' }}>
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </summary>
                  <ul style={{ marginTop: 8, marginLeft: 16, fontSize: 11 }}>
                    {order.items.map(item => (
                      <li key={item.id}>
                        {item.title_snapshot} × {item.quantity} (${item.unit_price * item.quantity})
                      </li>
                    ))}
                  </ul>
                </details>
              </td>
              <td style={{ padding: 12, textAlign: 'right', fontWeight: 'bold' }}>
                ${order.amount.toLocaleString('es-CL')}
              </td>
              <td style={{ padding: 12, fontSize: 11 }}>
                {new Date(order.created_at).toLocaleDateString('es-CL')} {new Date(order.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
              </td>
              <td style={{ padding: 12, display: 'flex', gap: 8 }}>
                <button
                  onClick={() => updateOrderStatus(order.id, 'confirm')}
                  disabled={order.status === 'paid' || order.status === 'cancelled'}
                  style={{
                    padding: '4px 8px',
                    background: order.status === 'paid' || order.status === 'cancelled' ? '#333' : '#7dff31',
                    color: order.status === 'paid' || order.status === 'cancelled' ? '#666' : '#000',
                    cursor: order.status === 'paid' || order.status === 'cancelled' ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: 2,
                    fontSize: 11
                  }}
                >
                  Confirmar pago
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres anular esta orden?')) {
                      updateOrderStatus(order.id, 'cancel')
                    }
                  }}
                  disabled={order.status === 'cancelled'}
                  style={{
                    padding: '4px 8px',
                    background: order.status === 'cancelled' ? '#333' : '#C23B22',
                    color: order.status === 'cancelled' ? '#666' : '#fff',
                    cursor: order.status === 'cancelled' ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: 2,
                    fontSize: 11
                  }}
                >
                  Anular orden
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredOrders.length === 0 && (
        <p style={{ textAlign: 'center', color: '#999', marginTop: 24 }}>
          No hay órdenes en estado "{filter}"
        </p>
      )}
    </div>
  )
}
