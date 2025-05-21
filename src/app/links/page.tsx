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
        <div className="flex flex-col items-center min-h-screen px-4 py-10 bg-[var(--color-neutral-base)] text-[var(--color-neutral-light)] font-body">
            {/* Foto de perfil */}
            <img
                src="/profile.jpg" // asegúrate de tener esta imagen en /public
                alt="Foto de perfil Biomechanics"
                className="w-32 h-32 rounded-full border-4 border-[var(--color-accent-organic)] mb-4 shadow-lg"
            />

            {/* Nombre */}
            <h1
                className="text-[var(--color-secondary)] text-4xl font-display tracking-wide mb-2"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
                biomechanics.wav
            </h1>

            {/* Redes sociales */}
            <div className="flex gap-6 mb-8">
                <a href="https://www.instagram.com/biomechanics.wav" target="_blank" rel="noopener noreferrer">
                    <img src="/icons/instagram.svg" alt="Instagram" className="w-6 h-6 hover:scale-110 transition-transform" />
                </a>
                <a href="https://www.soundcloud.com/biomechanics-wav" target="_blank" rel="noopener noreferrer">
                    <img src="/icons/soundcloud.svg" alt="SoundCloud" className="w-6 h-6 hover:scale-110 transition-transform" />
                </a>
                <a href="https://youtube.com/@biomechanics-wav" target="_blank" rel="noopener noreferrer">
                    <img src="/icons/youtube.svg" alt="YouTube" className="w-6 h-6 hover:scale-110 transition-transform" />
                </a>
                <a href="https://www.tiktok.com/@biomechanics.wav" target="_blank" rel="noopener noreferrer">
                    <img src="/icons/tiktok.svg" alt="TikTok" className="w-6 h-6 hover:scale-110 transition-transform" />
                </a>
            </div>

            {/* Lista de links como tarjetas */}
            <ul className="w-full max-w-md space-y-4">
                {links.map((link: { id: number; url: string }) => (
                    <li key={link.id}>
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-4 bg-[var(--color-neutral-light)] text-[var(--color-neutral-base)] rounded-lg shadow-md hover:bg-[var(--color-secondary)] hover:text-[var(--color-neutral-base)] transition-colors font-body"
                        >
                            {link.url}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
      
}
