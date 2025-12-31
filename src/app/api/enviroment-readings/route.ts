import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-db'

type AirBuffer = {
  device_id: string
  location: string | null
  air_temperature: number | null
  air_humidity: number | null
}

const deviceBuffer: Record<string, AirBuffer> = {}
const lastSave: Record<string, number> = {}
const SAVE_INTERVAL = 60000 // 60s
const lastTouchStatus: Record<string, string> = {}

// Parse body: { topic, payload } o { deviceId, sensorType, value, location }
function parseShiftr(body: any) {
  if (body?.deviceId && body?.sensorType) {
    return {
      deviceId: String(body.deviceId),
      sensorType: String(body.sensorType),
      value: body.value,
      location: body.location ?? null,
    }
  }

  const topic = String(body?.topic ?? '')
  const payload = String(body?.payload ?? '')
  const parts = topic.split('/').filter(Boolean)

  // location = primeros 2 segmentos (ej: casa/taller)
  const location = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : null

  // deviceId = después de "plantas" (ej: monstera). Si no hay, usa "environment"
  let deviceId = 'environment'
  const i = parts.indexOf('plantas')
  if (i >= 0 && parts[i + 1]) deviceId = parts[i + 1]

  // último segmento define sensor
  const last = (parts[parts.length - 1] ?? '').toLowerCase()
  let sensorType: 'temperature' | 'humidity' | 'ec' | 'touched' | undefined
  if (last === 'temperatura' || last === 'temperature') sensorType = 'temperature'
  else if (last === 'humedad' || last === 'humidity') sensorType = 'humidity'
  else if (last === 'ec' || last === 'raw') sensorType = 'ec'
  else if (last === 'estado' || last === 'touch') sensorType = 'touched'

  // payload → valor
  let value: any = payload
  if (sensorType === 'temperature' || sensorType === 'humidity' || sensorType === 'ec') {
    const num = parseFloat(payload)
    value = Number.isFinite(num) ? num : null // "nan" → null
  } else if (sensorType === 'touched') {
    const p = payload.toLowerCase()
    value = p === 'tocada' || p === 'touched' || p === 'true' || p === '1' ? 'touched' : 'idle'
  }

  return { deviceId, sensorType, value, location }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { deviceId, sensorType, value, location } = parseShiftr(body)

    if (!deviceId || !sensorType) {
      return NextResponse.json({ error: 'Missing deviceId or sensorType' }, { status: 400 })
    }

    // Touch: guarda solo si cambia
    if (sensorType === 'touched') {
      if (value == null) return NextResponse.json({ ok: true, ignored: 'empty touch' })
      const v = String(value)
      if (lastTouchStatus[deviceId] !== v) {
        lastTouchStatus[deviceId] = v
        await saveTouchEvent(deviceId, v, location)
      }
      return NextResponse.json({ ok: true, saved: 'touch' })
    }

    // EC: guarda cada valor inmediatamente
    if (sensorType === 'ec') {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return NextResponse.json({ ok: true, ignored: 'invalid ec' })
      }
      await saveECReading(deviceId, value, location)
      return NextResponse.json({ ok: true, saved: 'ec' })
    }

    // Aire: buffer y guarda cada 60s
    if (sensorType === 'temperature' || sensorType === 'humidity') {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return NextResponse.json({ ok: true, ignored: 'invalid air value' })
      }

      if (!deviceBuffer[deviceId]) {
        deviceBuffer[deviceId] = { device_id: deviceId, location, air_temperature: null, air_humidity: null }
        lastSave[deviceId] = Date.now()
      } else if (location) {
        // actualiza location si llega
        deviceBuffer[deviceId].location = location
      }

      if (sensorType === 'temperature') deviceBuffer[deviceId].air_temperature = value
      else deviceBuffer[deviceId].air_humidity = value

      const now = Date.now()
      if (now - lastSave[deviceId] >= SAVE_INTERVAL) {
        await saveAirReadings(deviceId)
        // reinicia buffer
        deviceBuffer[deviceId] = { device_id: deviceId, location: deviceBuffer[deviceId].location, air_temperature: null, air_humidity: null }
        lastSave[deviceId] = now
      }
      return NextResponse.json({ ok: true, buffered: true })
    }

    return NextResponse.json({ error: 'Unknown sensorType' }, { status: 400 })
  } catch (e) {
    console.error('enviroment-readings POST error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function saveAirReadings(deviceId: string) {
  const supabase = getSupabaseClient({ admin: true })
  const data = { ...deviceBuffer[deviceId], recorded_at: new Date().toISOString() }
  const { error } = await supabase.from('environment_readings').insert([data])
  if (error) console.error('DB error (air):', error)
}

async function saveECReading(deviceId: string, ecValue: number, location: string | null) {
  const supabase = getSupabaseClient({ admin: true })
  const data = { device_id: deviceId, location, soil_ec: ecValue, recorded_at: new Date().toISOString() }
  const { error } = await supabase.from('environment_readings').insert([data])
  if (error) console.error('DB error (EC):', error)
}

async function saveTouchEvent(deviceId: string, touchStatus: string, location: string | null) {
  const supabase = getSupabaseClient({ admin: true })
  const data = { device_id: deviceId, location, touch_status: touchStatus, recorded_at: new Date().toISOString() }
  const { error } = await supabase.from('environment_readings').insert([data])
  if (error) console.error('DB error (touch):', error)
}