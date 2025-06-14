import { getLinksData } from '@/utils/links'
import { SocialIcon } from '@/app/components/SocialIcon'

export default async function Page() {
    const { links, description, profileImage, profileImageType, socialIcons } = await getLinksData()

    // Función para renderizar el avatar según su tipo
    const renderAvatar = () => {
        const commonClasses = "w-32 h-32 rounded-full border-4 border-[var(--color-accent-organic)] mb-4 shadow-lg object-cover"
        
        if (profileImageType === 'video') {
            return (
                <video 
                    src={profileImage}
                    className={commonClasses}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
            )
        } else {
            // Para 'image' y 'gif'
            return (
                <img
                    src={profileImage}
                    alt="Foto de perfil Biomechanics"
                    className={commonClasses}
                />
            )
        }
    }

    // Vista de solo lectura para usuarios comunes
    return (
        <div
            className="flex flex-col items-center min-h-screen px-4 py-10 text-[var(--color-neutral-light)] font-body"
            style={{
                backgroundImage: "url('/bg.png')", // asegúrate de tener esta imagen en /public
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "var(--color-neutral-base)",
            }}
        >
            {/* Avatar dinámico */}
            {renderAvatar()}

            {/* Nombre */}
            <h1
                className="text-[var(--color-secondary)] text-4xl font-display tracking-wide mb-2"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
                biomechanics.wav
            </h1>

            {/* Descripción */}
            <p className="text-center text-lg mb-6 max-w-2xl">
                {description}
            </p>

            {/* Redes sociales con colores personalizables */}
            <div className="flex gap-6 mb-8">
                {socialIcons.instagram && (
                    <SocialIcon 
                        icon="instagram" 
                        url={socialIcons.instagram.url} 
                        color={socialIcons.instagram.color} 
                    />
                )}
                {socialIcons.soundcloud && (
                    <SocialIcon 
                        icon="soundcloud" 
                        url={socialIcons.soundcloud.url} 
                        color={socialIcons.soundcloud.color} 
                    />
                )}
                {socialIcons.youtube && (
                    <SocialIcon 
                        icon="youtube" 
                        url={socialIcons.youtube.url} 
                        color={socialIcons.youtube.color} 
                    />
                )}
                {socialIcons.tiktok && (
                    <SocialIcon 
                        icon="tiktok" 
                        url={socialIcons.tiktok.url} 
                        color={socialIcons.tiktok.color} 
                    />
                )}
            </div>

            {/* Lista de links como tarjetas */}
            <ul className="w-full max-w-md space-y-4">
                {links.map((link: { id: number; url: string; label: string }) => (
                    <li key={link.id}>
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-4 bg-[var(--color-neutral-light)] text-[var(--color-neutral-base)] rounded-lg shadow-md hover:bg-[var(--color-secondary)] hover:text-[var(--color-neutral-base)] transition-colors font-body"
                        >
                            {link.label || link.url}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
