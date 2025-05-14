import fs from 'fs/promises'
import path from 'path'
import { SortableLinksForm } from '@/components/SortableLinksForm'
import { getUserFromCookie } from '@/lib/auth'

export default async function Page() {
    const filePath = path.resolve(process.cwd(), 'src/data/links.json')
    const file = await fs.readFile(filePath, 'utf-8')
    const links = JSON.parse(file)

    const user = await getUserFromCookie()
    const isAdmin = user === process.env.ADMIN_USER

    if (isAdmin) {
        return <SortableLinksForm links={links} />
    }

    // Vista de solo lectura para usuarios comunes
    return (
        <div>
            <h1>Links</h1>
            <ul>
                {links.map((link: { id: number; url: string }) => (
                    <li key={link.id}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                            {link.url}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}
