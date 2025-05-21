'use client'

import { useEffect, useRef } from 'react'
import Sortable from 'sortablejs'

export function SortableLinksForm({
    links,
}: {
    links: { id: number; url: string; label: string }[]
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
        <form action="/api/update-links" method="POST">
            <h2>Reordenar Links</h2>
            <ul ref={listRef} style={{ listStyle: 'none', padding: 0 }}>
                {links.map((link, index) => (
                    <li key={link.id} style={{ marginBottom: '1rem' }}>
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
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ccc',
                                marginBottom: '0.5rem',
                            }}
                        />
                        <input
                            type="text"
                            name="label"
                            defaultValue={link.label}
                            placeholder="Texto visible (ej: TikTok)"
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ccc',
                            }}
                        />
                    </li>
                ))}
            </ul>

            <h3>Agregar nuevo</h3>
            <input
                type="text"
                name="url"
                placeholder="Nuevo link..."
                style={{
                    marginTop: '1rem',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    width: '100%',
                }}
            />
            <input
                type="text"
                name="label"
                placeholder="Placeholder (ej: TikTok)"
                style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    width: '100%',
                }}
            />

            <button type="submit" style={{ marginTop: '1rem' }}>
                Guardar Cambios
            </button>
        </form>
    )
}
