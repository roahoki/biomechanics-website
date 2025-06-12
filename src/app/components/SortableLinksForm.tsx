'use client'

import { useEffect, useRef, useState } from 'react'
import Sortable from 'sortablejs'
import { updateAdminLinks } from '@/app/admin/_actions'
import { useRouter } from 'next/navigation'

export function SortableLinksForm({
    links,
    description,
}: {
    links: { id: number; url: string; label: string }[]
    description: string
}) {
    const listRef = useRef<HTMLUListElement>(null)
    const router = useRouter()
    const [status, setStatus] = useState<{ message?: string; error?: string } | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (listRef.current) {
            Sortable.create(listRef.current, {
                animation: 150,
                ghostClass: 'bg-gray-200',
            })
        }
    }, [])

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        setStatus(null)
        
        try {
            const result = await updateAdminLinks(formData)
            if (result.success) {
                setStatus({ message: result.message || 'Enlaces actualizados con éxito' })
                router.refresh()
            } else {
                setStatus({ error: result.error || 'Error al actualizar los enlaces' })
            }
        } catch (error) {
            setStatus({ error: 'Error al procesar la solicitud' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form
            action={handleSubmit}
            method="POST"
            className="flex flex-col items-center min-h-screen px-4 py-10 space-y-6 text-[var(--color-neutral-light)] font-body"
            style={{
                backgroundImage: "url('/bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "var(--color-neutral-base)",
            }}
        >
            {/* Foto de perfil */}
            <img
                src="/profile.jpg"
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

            {/* Descripción editable */}
            <textarea
                name="description"
                defaultValue={description}
                maxLength={300}
                placeholder="Escribe una descripción (máximo 300 caracteres)"
                className="w-full max-w-2xl p-3 text-center text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-6"
            />

            {/* Lista de links como tarjetas editables */}
            <ul ref={listRef} className="w-full max-w-md space-y-4">
                {links.map((link, index) => (
                    <li key={link.id} className="p-4 bg-[var(--color-neutral-light)] text-[var(--color-neutral-base)] rounded-lg shadow-md">
                        <input
                            type="hidden"
                            name="id"
                            defaultValue={link.id}
                        />
                        <input
                            type="text"
                            name="url"
                            defaultValue={link.url}
                            placeholder="URL"
                            className="w-full p-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                            type="text"
                            name="label"
                            defaultValue={link.label}
                            placeholder="Texto visible (ej: TikTok)"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </li>
                ))}
            </ul>

            {/* Mensaje de estado */}
            {status && (
                <div className={`w-full max-w-md p-3 rounded-md text-center ${
                    status.message ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {status.message || status.error}
                </div>
            )}

            {/* Botón para guardar cambios */}
            <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 text-white ${
                    isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                } rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
        </form>
    )
}
