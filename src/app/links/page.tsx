import { getUserFromCookie } from '@/lib/auth'
import { updateLinks } from './actions'
import fs from 'fs/promises'
import path from 'path'

export default async function LinksPage() {
    const user = await getUserFromCookie()
    const isAdmin = user === process.env.ADMIN_USER

    const filePath = path.resolve(process.cwd(), 'src/data/links.json')
    const file = await fs.readFile(filePath, 'utf-8')
    const links: { id: number; url: string }[] = JSON.parse(file)

    return (
        <div>
            <h1>Links Públicos</h1>
            <ul>
                {links.map(link => (
                    <li key={link.id}>
                        <a href={link.url} target="_blank">{link.url}</a>
                    </li>
                ))}
            </ul>

            {isAdmin && (
                <form
                    action={async (formData) => {
                        'use server'
                        const urls = formData.getAll('url') as string[]
                        const newLinks = urls
                            .map((url, idx) => url.trim())
                            .filter(Boolean)
                            .map((url, i) => ({ id: i + 1, url }))
                        await updateLinks(newLinks)
                    }}
                    style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                >
                    <h2>Editar Links</h2>
                    {links.map((link, index) => (
                        <input
                            key={index}
                            name="url"
                            defaultValue={link.url}
                            placeholder="Nuevo link"
                        />
                    ))}
                    <button type="submit">Guardar Cambios</button>
                </form>
            )}
        </div>
    )
}
