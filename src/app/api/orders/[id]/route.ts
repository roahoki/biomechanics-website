import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase-db'

// GET /api/orders/:id
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createPublicClient()
    const { data: order, error: oErr } = await supabase
      .from('orders')
      .select('id,amount,status,redemption_code,created_at')
      .eq('id', id)
      .single()
    if (oErr || !order) return NextResponse.json({ error: oErr?.message ?? 'orden no encontrada' }, { status: 404 })

    const { data: items, error: iErr } = await supabase
      .from('order_items')
      .select('id,product_id,title_snapshot,unit_price,quantity,redeemed_qty')
      .eq('order_id', id)
    if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 })

    return NextResponse.json({ order, items })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
