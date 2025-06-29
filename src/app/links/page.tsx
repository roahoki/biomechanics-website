import { getLinksData } from '@/utils/links'
import { SocialIcon } from '@/app/components/SocialIcon'
import Image from 'next/image'

export default async function Page() {
    const { links, description, profileImage, profileImageType, socialIcons, backgroundColor, backgroundSettings, styleSettings } = await getLinksData()

    // Función para renderizar el avatar según su tipo
    const renderAvatar = () => {
        const commonClasses = "w-32 h-32 rounded-full border-4 border-[var(--color-neutral-base)] mb-4 shadow-lg object-cover"
        
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
                <Image
                    src={profileImage}
                    alt="Foto de perfil Biomechanics"
                    className={commonClasses}
                    width={128}
                    height={128}
                />
            )
        }
    }

    // Configurar el estilo de fondo basado en la configuración
    const getBackgroundStyle = () => {
        const settings = backgroundSettings || { type: 'color', color: backgroundColor }
        
        if (settings.type === 'image' && settings.imageUrl) {
            return {
                backgroundImage: `url(${settings.imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                position: "relative" as const,
            }
        } else {
            return {
                backgroundColor: settings.color || backgroundColor || "var(--color-neutral-base)",
            }
        }
    }

    const backgroundStyle = getBackgroundStyle()
    const hasImageBackground = backgroundSettings?.type === 'image' && backgroundSettings.imageUrl

    // Vista de solo lectura para usuarios comunes
    return (
        <div
            className="flex flex-col items-center min-h-screen px-4 py-10 text-[var(--color-neutral-light)] font-body"
            style={backgroundStyle}
        >
            {/* Overlay de opacidad para imagen de fondo */}
            {hasImageBackground && (
                <div 
                    className="absolute inset-0 bg-black"
                    style={{ 
                        opacity: 1 - (backgroundSettings?.imageOpacity || 0.5),
                        zIndex: 0
                    }}
                />
            )}
            
            {/* Contenido principal */}
            <div className={`relative ${hasImageBackground ? 'z-10' : ''} flex flex-col items-center`}>
                {/* Avatar dinámico */}
                {renderAvatar()}

                {/* Nombre */}
                <h1
                    className="text-4xl font-display tracking-wide mb-2"
                    style={{ 
                        fontFamily: 'Space Grotesk, sans-serif',
                        color: styleSettings?.titleColor || '#ffffff'
                    }}
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
                            url={socialIcons.instagram.url || '#'} 
                            color={socialIcons.instagram.color} 
                        />
                    )}
                    {socialIcons.soundcloud && (
                        <SocialIcon 
                            icon="soundcloud" 
                            url={socialIcons.soundcloud.url || '#'} 
                            color={socialIcons.soundcloud.color} 
                        />
                    )}
                    {socialIcons.youtube && (
                        <SocialIcon 
                            icon="youtube" 
                            url={socialIcons.youtube.url || '#'} 
                            color={socialIcons.youtube.color} 
                        />
                    )}
                    {socialIcons.tiktok && (
                        <SocialIcon 
                            icon="tiktok" 
                            url={socialIcons.tiktok.url || '#'} 
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
                                className="block p-4 rounded-lg shadow-md hover:opacity-80 transition-opacity font-body"
                                style={{
                                    backgroundColor: styleSettings?.linkCardBackgroundColor || '#ffffff',
                                    color: styleSettings?.linkCardTextColor || '#000000'
                                }}
                            >
                                {link.label || link.url}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
