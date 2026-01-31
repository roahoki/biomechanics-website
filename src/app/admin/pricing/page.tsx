import { checkAdminPermissions } from '@/utils/roles'
import { createPublicClient } from '@/lib/supabase-db'
import { ProductTable } from './ProductRow'

export default async function AdminPricingPage() {
  await checkAdminPermissions()
  const supabase = createPublicClient()
  const { data: products } = await supabase
    .from('products')
    .select('id,title,type,price,visible')
    .order('type', { ascending: true })

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h1>Admin: Precios y cupos</h1>
      <p>Editar precios de 3 ítems de barra y tickets. Yoga cap: 25.</p>
      <ProductTable initialProducts={products ?? []} />
    </div>
  )
}
