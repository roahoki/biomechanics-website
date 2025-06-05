'use client'

import { useEffect, useRef } from 'react'
import Sortable from 'sortablejs'

export function SortableLinksForm({
    links,
    description,
}: {
    links: { id: number; url: string; label: string }[]
    description: string
}) {
    const listRef = useRef<HTMLUListElement>(null)

    useEffect(() => {
        if (listRef.current) {
            Sortable.create(listRef.current, {
                animation: 150,
                ghostClass: 'bg-gray-200',
            })
        }
    }, [])

    return (
        <form
            action="/api/update-links"
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

            {/* Botón para guardar cambios */}
            <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Guardar Cambios
            </button>
        </form>
    )
}
