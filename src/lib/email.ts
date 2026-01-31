import { Resend } from 'resend'

// Initialize Resend only when needed (lazy load)
let resend: InstanceType<typeof Resend> | null = null

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

export async function sendOrderEmail(
  email: string,
  buyerName: string,
  orderId: string,
  items: Array<{ title: string; quantity: number; unit_price: number }>,
  total: number
) {
  const resendClient = getResendClient()
  if (!resendClient) {
    console.warn('Resend API key not configured. Email not sent.')
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const itemsHtml = items
      .map(
        (item) =>
          `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.unit_price * item.quantity).toLocaleString('es-CL')}</td>
      </tr>`
      )
      .join('')

    const html = `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 24px; border-radius: 8px; }
          .header { border-bottom: 2px solid #7dff31; padding-bottom: 16px; margin-bottom: 24px; }
          h1 { margin: 0; color: #000; font-size: 24px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 16px 0; border-radius: 4px; }
          .warning strong { color: #856404; }
          p { margin: 8px 0; color: #333; }
          table { width: 100%; margin: 16px 0; }
          .total { font-size: 18px; font-weight: bold; text-align: right; padding-top: 16px; border-top: 2px solid #7dff31; }
          .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
          .status { background: #f0f0f0; padding: 12px; border-radius: 4px; margin: 16px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Resumen de tu Pedido</h1>
          </div>
          
          <p><strong>Hola ${buyerName},</strong></p>
          <p>Tu pedido ha sido registrado. Aquí está el resumen:</p>
          
          <div class="status">
            <strong>Estado del Pedido:</strong> ⏳ PAGO PENDIENTE
          </div>
          
          <div class="warning">
            <strong>⚠️ IMPORTANTE:</strong> Este es tu comprobante de pedido. Debes completar el pago en Fintoc para validar tu compra. El personal de barra verificará tu pago antes de entregar los productos.
          </div>
          
          <p><strong>ID de Pedido:</strong> ${orderId}</p>
          
          <table>
            <thead style="background: #f9f9f9;">
              <tr>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">Producto</th>
                <th style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">Cantidad</th>
                <th style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="total">Total: $${total.toLocaleString('es-CL')}</div>
          
          <p style="margin-top: 24px; color: #666;"><strong>Próximos pasos:</strong></p>
          <ol style="color: #666;">
            <li>Completa el pago en Fintoc con este monto: <strong>$${total.toLocaleString('es-CL')}</strong></li>
            <li>Presenta este ID en la entrada/barra: <strong>${orderId.substring(0, 8)}</strong></li>
            <li>El personal verificará tu pago antes de entregar</li>
          </ol>
          
          <div class="footer">
            <p>¿Preguntas? Contáctanos respondiendo este email.</p>
            <p>Biomechanics Event | ${new Date().getFullYear()}</p>
          </div>
        </div>
      </body>
    </html>
    `

    const result = await resendClient.emails.send({
      from: 'ventas@biomechanics.cl',
      to: email,
      subject: `Confirmación de compra - Orden ${orderId.substring(0, 8)}`,
      html
    })

    return result
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}
