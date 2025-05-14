import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
    const formData = await request.formData()
    const urls = formData.getAll('url') as string[]

    const newLinks = urls
        .map((url, i) => url.trim())
        .filter(Boolean)
        .map((url, i) => ({ id: i + 1, url }))

    const filePath = path.resolve(process.cwd(), 'src/data/links.json')
    await fs.writeFile(filePath, JSON.stringify(newLinks, null, 2))

    revalidatePath('/links')

    return NextResponse.redirect(new URL('/links', request.url))
}
