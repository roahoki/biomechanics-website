import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-db'

// POST /api/orders/[id]/status
// Actualizar estado de orden (ej: 'paid', 'redeemed')
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status } = await req.json()

    if (!status) {
      return NextResponse.json({ error: 'status requerido' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, status })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
