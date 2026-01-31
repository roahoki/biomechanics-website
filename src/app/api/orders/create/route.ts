import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-db'
import { sendOrderEmail } from '@/lib/email'

// POST /api/orders/create
// body: { buyerName?:string, buyerContact?:string, items: Array<{ productId:number, quantity:number }> }
export async function POST(req: Request) {
  try {
    const { buyerName, buyerContact, items } = await req.json()
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items requeridos' }, { status: 400 })
    }

    const supabase = createAdminClient()
    // Obtener productos para validar precios/stock
    // Aceptar tanto productId como product_id desde el cliente
    const productIds = items.map((i: any) => {
      const pid = i.productId ?? i.product_id
      if (!pid) {
        throw new Error('Cada item debe incluir productId o product_id')
      }
      return Number(pid)
    })
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('id,title,price,type,is_yoga_add_on,stock,payment_link')
      .in('id', productIds)
    if (prodErr) return NextResponse.json({ error: prodErr.message }, { status: 500 })

    // Mapear por id
    const byId = new Map(products?.map(p => [p.id, p]))

    // Calcular total y validar yoga cap
    let total = 0
    let yogaRequested = 0
    let yogaStock = 0
    const orderItemsPayload: Array<{ product_id:number, title_snapshot:string, unit_price:number, quantity:number, redeemed_qty:number }> = []
    for (const it of items) {
      const pid = it.productId ?? it.product_id
      const p = byId.get(Number(pid))
      if (!p) return NextResponse.json({ error: `Producto ${it.productId} no existe` }, { status: 400 })
      const qty = Math.max(1, Number(it.quantity || 1))
      total += p.price * qty
      orderItemsPayload.push({ product_id: p.id, title_snapshot: p.title, unit_price: p.price, quantity: qty, redeemed_qty: 0 })
      if (p.is_yoga_add_on) {
        yogaRequested += qty
        yogaStock = p.stock ?? 0
      }
    }

    // Validar stock de yoga con órdenes existentes
    if (yogaRequested > 0) {
      const { data: yogaOrders, error: yoErr } = await supabase
        .from('order_items')
        .select('quantity,product_id')
        .eq('product_id', products?.find(p => p.is_yoga_add_on)?.id)
      if (yoErr) return NextResponse.json({ error: yoErr.message }, { status: 500 })
      const yogaCommitted = yogaOrders?.reduce((acc, oi) => acc + (oi.quantity || 0), 0) ?? 0
      if (yogaCommitted + yogaRequested > yogaStock) {
        return NextResponse.json({ error: 'Stock yoga agotado o insuficiente (cap=25)' }, { status: 400 })
      }
    }

    // Crear orden
    const redemption_code = crypto.randomUUID()
    const fintocLink = `https://fintoc.me/tpp/${total}`
    const { data: order, error: oErr } = await supabase
      .from('orders')
      .insert({ buyer_name: buyerName ?? null, buyer_contact: buyerContact ?? null, status: 'created', amount: total, payment_method: 'fintoc_tpp', redemption_code })
      .select()
      .single()
    if (oErr || !order) return NextResponse.json({ error: oErr?.message ?? 'no se pudo crear orden' }, { status: 500 })

    // Crear items
    const withOrderId = orderItemsPayload.map(oi => ({ ...oi, order_id: order.id }))
    const { error: oiErr } = await supabase.from('order_items').insert(withOrderId)
    if (oiErr) return NextResponse.json({ error: oiErr.message }, { status: 500 })

    // Enviar email si hay contacto
    if (buyerContact && buyerContact.includes('@')) {
      try {
        await sendOrderEmail(buyerContact, buyerName || 'Usuario', order.id, orderItemsPayload, total)
      } catch (emailErr) {
        console.error('Error enviando email:', emailErr)
        // No fallar la orden si falla el email
      }
    }

    return NextResponse.json({ orderId: order.id, amount: total, redemption_code, payment_link: fintocLink })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
