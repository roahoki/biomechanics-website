import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_KEY!

if (!url || !serviceKey) {
  console.error('Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

type ProductInput = {
  title: string
  type: 'ticket' | 'item'
  price: number
  visible?: boolean
  category?: string
  is_yoga_add_on?: boolean
  stock?: number
  payment_link?: string | null
}

async function upsertByTitle(p: ProductInput) {
  const { data: existing, error: readErr } = await supabase
    .from('products')
    .select('id,title')
    .eq('title', p.title)
    .limit(1)
    .maybeSingle()
  if (readErr) throw readErr

  if (existing?.id) {
    const { error: updErr } = await supabase.from('products').update(p).eq('id', existing.id)
    if (updErr) throw updErr
    console.log('Actualizado:', p.title)
  } else {
    const { error: insErr } = await supabase.from('products').insert(p)
    if (insErr) throw insErr
    console.log('Insertado:', p.title)
  }
}

async function run() {
  const products: ProductInput[] = [
    { title: 'Early bird $8.000', type: 'ticket', price: 8000, visible: true, category: 'tickets', payment_link: 'https://fintoc.me/tpp/8000' },
    { title: 'General $10.000',   type: 'ticket', price: 10000, visible: true, category: 'tickets', payment_link: 'https://fintoc.me/tpp/10000' },
    { title: 'Puerta $15.000',    type: 'ticket', price: 15000, visible: true, category: 'tickets', payment_link: 'https://fintoc.me/tpp/15000' },
    { title: 'Clase de yoga (limitado)', type: 'ticket', price: 0, visible: true, category: 'tickets', is_yoga_add_on: true, stock: 25, payment_link: null },
    { title: 'Cerveza 743cc', type: 'item', price: 2000, visible: true, category: 'bar', payment_link: 'https://fintoc.me/tpp/2000' },
    { title: 'Cerveza 743cc premium', type: 'item', price: 3000, visible: true, category: 'bar', payment_link: 'https://fintoc.me/tpp/3000' },
    { title: 'Agua 600cc', type: 'item', price: 1500, visible: true, category: 'bar', payment_link: 'https://fintoc.me/tpp/1500' },
  ]

  for (const p of products) {
    await upsertByTitle(p)
  }
  console.log('Seed completado.')
}

run().catch(err => { console.error(err); process.exit(1) })
