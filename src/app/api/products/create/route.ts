import { NextResponse } from 'next/server'
import { checkAdminPermissions } from '@/utils/roles'
import { createAdminClient } from '@/lib/supabase-db'

// POST /api/products/create
// body: { title:string, type:'ticket'|'item', price:number, visible?:boolean, is_yoga_add_on?:boolean, stock?:number|null, payment_link?:string|null }
export async function POST(req: Request) {
  try {
    const isAllowed = await checkAdminPermissions()
    if (!isAllowed) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    const payload = await req.json()
    const {
      title,
      type,
      price,
      visible = true,
      is_yoga_add_on = false,
      stock = null,
      payment_link = null
    } = payload

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'title requerido' }, { status: 400 })
    }
    if (!type || !['ticket', 'item'].includes(type)) {
      return NextResponse.json({ error: 'type inválido' }, { status: 400 })
    }
    if (typeof price !== 'number' || Number.isNaN(price)) {
      return NextResponse.json({ error: 'price inválido' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('products')
      .insert({
        title: title.trim(),
        type,
        price,
        visible,
        is_yoga_add_on,
        stock: is_yoga_add_on ? (stock ?? 25) : null,
        payment_link: payment_link || null
      })
      .select('id,title,type,price,visible,is_yoga_add_on,stock,payment_link')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, product: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
