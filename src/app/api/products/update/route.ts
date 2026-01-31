import { NextResponse } from 'next/server'
import { checkAdminPermissions } from '@/utils/roles'
import { createAdminClient } from '@/lib/supabase-db'

// POST /api/products/update
// body: { id:number, price?:number, visible?:boolean, stock?:number, payment_link?:string, mercadopago_link?:string }
export async function POST(req: Request) {
  try {
    const isAllowed = await checkAdminPermissions()
    if (!isAllowed) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    const payload = await req.json()
    const { id, price, visible, stock, payment_link, mercadopago_link } = payload
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    const supabase = createAdminClient()
    const { error } = await supabase.from('products').update({ price, visible, stock, payment_link, mercadopago_link }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
