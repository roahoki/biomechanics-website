'use server'

import { checkRole } from '@/utils/roles'
import { redirect } from 'next/navigation'

export async function checkAdminPermissions() {
  if (!checkRole('admin')) {
    redirect('/')
    return false
  }
  return true
}
