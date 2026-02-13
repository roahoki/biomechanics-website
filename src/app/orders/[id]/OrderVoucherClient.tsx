"use client"

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

type Order = { id: string, amount: number, status: string, redemption_code: string }
type Item = { id:number, title_snapshot:string, unit_price:number, quantity:number, redeemed_qty:number }

interface OrderVoucherClientProps {
  id: string
}

export default function OrderVoucherClient({ id }: OrderVoucherClientProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [qr, setQr] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`, { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Orden no encontrada')
        setOrder(json.order)
        setItems(json.items)
        const qrUrl = `${location.origin}/admin/redemptions/${id}`
        const dataUrl = await QRCode.toDataURL(qrUrl, { width: 256 })
        setQr(dataUrl)
      } catch (e: any) {
        setError(e.message)
      }
    }
    run()
  }, [id])

  if (error) return <div style={{ padding: 16 }}><p style={{ color: 'red' }}>{error}</p></div>
  if (!order) return <div style={{ padding: 16 }}><p>Cargando…</p></div>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <h1>Comprobante de compra</h1>
      <p><strong>Orden:</strong> {order.id}</p>
      <p><strong>Monto:</strong> ${order.amount}</p>
      <p><strong>Estado:</strong> {order.status}</p>
      <h2>Items</h2>
      <ul>
        {items.map(it => (
          <li key={it.id}>
            {it.title_snapshot} — {it.quantity} × ${it.unit_price}
          </li>
        ))}
      </ul>
      <h3>Presenta este QR en la barra/entrada</h3>
      {qr && <img src={qr} alt="QR de canje" />}
      <p style={{ marginTop: 12 }}>Si el QR falla, muestra el ID: <strong>{order.id}</strong></p>
    </div>
  )
}
