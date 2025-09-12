import { checkRole } from '@/utils/roles'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const isAdmin = await checkRole('admin')
    
    return NextResponse.json({ 
      isAdmin,
      success: true 
    })
  } catch (error) {
    console.error('Error checking admin role:', error)
    return NextResponse.json({ 
      isAdmin: false, 
      success: false,
      error: 'Failed to check admin role'
    }, { status: 500 })
  }
}
