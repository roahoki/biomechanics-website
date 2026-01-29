import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-db'
import { checkAdminPermissions } from '@/utils/roles'

// POST /api/orders/redeem
// body: { orderId:string, items: Array<{ orderItemId:number, quantity:number }> }
export async function POST(req: Request) {
  try {
    const isAllowed = await checkAdminPermissions()
    if (!isAllowed) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    const { orderId, items } = await req.json()
    if (!orderId || !items || items.length === 0) {
      return NextResponse.json({ error: 'payload inválido' }, { status: 400 })
    }
    const supabase = createAdminClient()

    // Obtener items actuales para validar
    const ids = items.map((i: any) => i.orderItemId)
    const { data: current, error: curErr } = await supabase
      .from('order_items')
      .select('id,quantity,redeemed_qty')
      .in('id', ids)
      .eq('order_id', orderId)
    if (curErr) return NextResponse.json({ error: curErr.message }, { status: 500 })

    const map = new Map(current?.map(c => [c.id, c]))
    for (const it of items) {
      const c = map.get(it.orderItemId)
      if (!c) return NextResponse.json({ error: `item ${it.orderItemId} no existe` }, { status: 400 })
      const qty = Math.max(1, Number(it.quantity || 1))
      const next = (c.redeemed_qty || 0) + qty
      if (next > c.quantity) {
        return NextResponse.json({ error: 'cantidad supera lo comprado' }, { status: 400 })
      }
    }

    // Actualizar
    for (const it of items) {
      const c = map.get(it.orderItemId)!
      const qty = Math.max(1, Number(it.quantity || 1))
      const next = (c.redeemed_qty || 0) + qty
      const { error: upErr } = await supabase
        .from('order_items')
        .update({ redeemed_qty: next })
        .eq('id', it.orderItemId)
        .eq('order_id', orderId)
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
