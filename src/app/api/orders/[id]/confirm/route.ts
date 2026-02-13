import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-db'
import { sendOrderStatusEmail } from '@/lib/email'

// POST /api/orders/[id]/confirm
// Confirmar pago y enviar email
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    // Obtener orden completa con items y contacto
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    // Obtener items
    const { data: items, error: itemsErr } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id)

    if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 })

    // Decrementar stock para productos tipo "quantity"
    if (items && items.length > 0) {
      const productIds = items.map(item => item.product_id)
      const { data: products, error: prodErr } = await supabase
        .from('products')
        .select('id,stock_type,stock_value')
        .in('id', productIds)
      
      if (!prodErr && products) {
        for (const item of items) {
          const product = products.find(p => p.id === item.product_id)
          if (product && product.stock_type === 'quantity' && typeof product.stock_value === 'number') {
            const newStock = Math.max(0, product.stock_value - item.quantity)
            await supabase
              .from('products')
              .update({ stock_value: newStock })
              .eq('id', product.id)
          }
        }
      }
    }

    // Actualizar estado a 'paid'
    const { error: updateErr } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', id)

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    // Enviar email si hay contacto
    if (order.buyer_contact) {
      try {
        const emailItems = items?.map(item => ({
          title: item.title_snapshot,
          quantity: item.quantity,
          unit_price: item.unit_price
        })) || []
        await sendOrderStatusEmail(
          order.buyer_contact,
          order.buyer_name || 'Usuario',
          order.id,
          'confirmed',
          emailItems,
          order.amount
        )
      } catch (emailErr) {
        console.error('Error sending confirmation email:', emailErr)
      }
    }

    return NextResponse.json({ success: true, status: 'paid' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
