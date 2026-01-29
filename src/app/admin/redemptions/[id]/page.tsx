import { checkAdminPermissions } from '@/utils/roles'
import { createAdminClient } from '@/lib/supabase-db'

export default async function RedemptionAdminPage({ params }: { params: Promise<{ id: string }> }) {
  await checkAdminPermissions()
  const supabase = createAdminClient()
  const { id: orderId } = await params
  const { data: order } = await supabase
    .from('orders')
    .select('id,amount,status,created_at')
    .eq('id', orderId)
    .single()

  const { data: items } = await supabase
    .from('order_items')
    .select('id,title_snapshot,unit_price,quantity,redeemed_qty')
    .eq('order_id', orderId)

  async function redeem(id: number) {
    'use server'
    const res = await fetch('/api/orders/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, items: [{ orderItemId: id, quantity: 1 }] })
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Error al canjear')
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h1>Canje de orden</h1>
      {!order ? (
        <p>Orden no encontrada</p>
      ) : (
        <>
          <p><strong>ID:</strong> {order.id} | <strong>Monto:</strong> ${order.amount}</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Precio</th>
                <th>Comprado</th>
                <th>Canjeado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {(items ?? []).map(it => (
                <tr key={it.id} style={{ borderTop: '1px solid #555' }}>
                  <td>{it.title_snapshot}</td>
                  <td>${it.unit_price}</td>
                  <td>{it.quantity}</td>
                  <td>{it.redeemed_qty}</td>
                  <td>
                    {it.redeemed_qty < it.quantity ? (
                      <form action={async () => { await redeem(it.id) }}>
                        <button style={{ padding: '6px 10px', background: '#7dff31' }}>Entregar 1</button>
                      </form>
                    ) : (
                      <span>Completo</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
