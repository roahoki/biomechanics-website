'use server'

import { checkRole } from '@/utils/roles'
import { clerkClient } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { getLinksData } from '@/utils/links'
import { useSupabaseClient } from '@/lib/supabase-auth'
import { createClient } from '@supabase/supabase-js'
const fs = require('fs/promises')
const path = require('path')
const filePath = path.resolve(process.cwd(), 'src/data/links.json')

// Cliente de Supabase para operaciones del servidor
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function setRole(formData: FormData): Promise<void> {
    const client = await clerkClient()

    // Check that the user trying to set the role is an admin
    if (!checkRole('admin')) {
        throw new Error('Not Authorized')
    }

    try {
        await client.users.updateUserMetadata(formData.get('id') as string, {
            publicMetadata: { role: formData.get('role') },
        })
    } catch (err) {
        console.error(err)
        throw new Error('Failed to set role')
    }
}

export async function removeRole(formData: FormData): Promise<void> {
    const client = await clerkClient()

    try {
        await client.users.updateUserMetadata(formData.get('id') as string, {
            publicMetadata: { role: null },
        })
    } catch (err) {
        console.error(err)
        throw new Error('Failed to remove role')
    }
}

export async function updateAdminLinks(formData: FormData) {
  try {
    // Verificar permisos
    if (!checkRole('admin')) {
      throw new Error('No tienes autorización para esta acción')
    }
    
    // Obtener los datos actuales para mantener la estructura
    const currentData = await getLinksData()
    
    // Obtener la descripción del formulario
    const description = formData.get('description')?.toString() || currentData.description || ''
    
    // Manejar la imagen de perfil si se proporciona una nueva
    let profileImage = currentData.profileImage
    const newProfileImage = formData.get('newProfileImage')?.toString()
    if (newProfileImage && newProfileImage.trim() !== '') {
      profileImage = newProfileImage.trim()
    }
    
    // Procesar los enlaces
    const ids = formData.getAll('id').map(id => Number(id))
    const urls = formData.getAll('url').map(url => url.toString())
    const labels = formData.getAll('label').map(label => label.toString())
    
    // Crear el nuevo array de enlaces
    const newItems = ids.map((id, index) => ({
      id: id,
      url: urls[index],
      label: labels[index]
    }))
    
    // Crear el nuevo objeto de datos
    const newData = {
      description,
      profileImage,
      items: newItems
    }
    
    // Guardar los datos
    await fs.writeFile(filePath, JSON.stringify(newData, null, 2))
    
    // Revalidar todas las rutas que pueden usar estos datos
    revalidatePath('/links')
    revalidatePath('/admin/links')
    
    return { success: true, message: 'Enlaces actualizados con éxito' }
  } catch (error) {
    console.error('Error al actualizar enlaces:', error)
    return { success: false, error: (error as Error).message }
  }
}