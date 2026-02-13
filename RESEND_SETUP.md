// Este archivo es solo para recordatorio de configuración
// IMPORTANTE: Agregar RESEND_API_KEY a las variables de entorno de Vercel
// 
// Pasos:
// 1. Ir a Resend.com y crear una API key
// 2. En Vercel dashboard, ir a Settings > Environment Variables
// 3. Agregar: RESEND_API_KEY=re_xxxxx
// 4. Re-deployar
//
// Sin esta key, los emails no se enviarán (pero la orden se creará igual)

export const RESEND_CONFIG_REMINDER = `
Set RESEND_API_KEY in Vercel environment variables
`
