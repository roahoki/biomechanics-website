import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-db'

// GET /api/orders/list
// Listar todas las órdenes con sus items
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data: orders, error: oErr } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (oErr) return NextResponse.json({ error: oErr.message }, { status: 500 })

    // Obtener items para cada orden
    const orderIds = orders?.map(o => o.id) || []
    let items: any[] = []
    if (orderIds.length > 0) {
      const { data: orderItems, error: iErr } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds)
      
      if (!iErr) items = orderItems || []
    }

    // Agrupar items por orden
    const itemsByOrder = new Map()
    items.forEach(item => {
      if (!itemsByOrder.has(item.order_id)) {
        itemsByOrder.set(item.order_id, [])
      }
      itemsByOrder.get(item.order_id).push(item)
    })

    const ordersWithItems = orders?.map(o => ({
      ...o,
      items: itemsByOrder.get(o.id) || []
    })) || []

    return NextResponse.json({ orders: ordersWithItems })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
