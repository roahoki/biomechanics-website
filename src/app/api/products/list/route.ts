import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase-db'

// GET /api/products/list
export async function GET() {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('products')
      .select('id,title,type,price,visible,category,is_yoga_add_on,stock,payment_link,stock_type,stock_value,max_per_order')
      .eq('visible', true)
      .order('category', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ products: data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
