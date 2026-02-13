import { checkAdminPermissions } from '@/utils/roles'
import { createPublicClient } from '@/lib/supabase-db'
import { ProductTable } from './ProductRow'

export default async function AdminPricingPage() {
  await checkAdminPermissions()
  const supabase = createPublicClient()
  // Select all columns to avoid schema cache errors with missing columns
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('type', { ascending: true })
  
  if (error) {
    console.error('Error fetching products:', error)
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h1>Admin: Precios y cupos</h1>
      <p>Editar precios de 3 ítems de barra y tickets. Yoga cap: 25.</p>
      <ProductTable initialProducts={products ?? []} />
    </div>
  )
}
