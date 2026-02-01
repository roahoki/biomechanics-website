import { NextResponse } from 'next/server'
import { checkAdminPermissions } from '@/utils/roles'
import { createAdminClient } from '@/lib/supabase-db'

// POST /api/products/create
// body: { title:string, type:'ticket'|'item', price:number, visible?:boolean, stock_type?:'quantity'|'boolean', stock_value?:number|boolean, stock_initial?:number|null, max_per_order?:number|null }
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
      stock_type = 'quantity',
      stock_value = 10,
      stock_initial = null,
      max_per_order = null
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
        stock_type,
        stock_value: stock_type === 'quantity' ? stock_value : (stock_value === true || stock_value === 1 ? 1 : 0),
        stock_initial: stock_type === 'quantity' ? stock_initial : null,
        max_per_order: typeof max_per_order === 'number' && max_per_order > 0 ? max_per_order : null
      })
      .select('id,title,type,price,visible,stock_type,stock_value,stock_initial,max_per_order')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, product: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
