import OrderVoucherClient from './OrderVoucherClient'

export default async function OrderVoucherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <OrderVoucherClient id={id} />
}
