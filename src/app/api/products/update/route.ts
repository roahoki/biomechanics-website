import { NextResponse } from 'next/server'
import { checkAdminPermissions } from '@/utils/roles'
import { createAdminClient } from '@/lib/supabase-db'

// POST /api/products/update
// body: { id:number, price?:number, visible?:boolean, stock_value?:number|boolean }
export async function POST(req: Request) {
  try {
    const isAllowed = await checkAdminPermissions()
    if (!isAllowed) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    const payload = await req.json()
    const { id, price, visible, stock_value } = payload
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    const supabase = createAdminClient()
    const updateData: any = {}
    if (price !== undefined) updateData.price = price
    if (visible !== undefined) updateData.visible = visible
    if (stock_value !== undefined) updateData.stock_value = stock_value
    
    const { error } = await supabase.from('products').update(updateData).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
