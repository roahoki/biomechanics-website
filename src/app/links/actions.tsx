'use server'

import fs from 'fs/promises'
import path from 'path'
import { revalidatePath } from 'next/cache'

const filePath = path.resolve(process.cwd(), 'src/data/links.json')

export async function updateLinks(newLinks: { id: number; url: string }[]) {
    await fs.writeFile(filePath, JSON.stringify(newLinks, null, 2))
    revalidatePath('/links') // actualiza el caché de la página
}
