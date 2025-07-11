import { useEffect, useRef } from 'react'
import Sortable from 'sortablejs'
import { LinkCard } from './LinkCard'

interface Link {
    id: number
    url: string
    label: string
}

interface LinksListProps {
    currentLinks: Link[]
    onAddNewLink: () => void
    onRemoveLink: (id: number) => void
    onUpdateLink: (id: number, field: 'url' | 'label', value: string) => void
    linkCardBackgroundColor: string
    linkCardTextColor: string
}

export function LinksList({ 
    currentLinks,
    onAddNewLink,
    onRemoveLink,
    onUpdateLink,
    linkCardBackgroundColor,
    linkCardTextColor
}: LinksListProps) {
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
        <div className="w-full max-w-md">
            {/* Botón para agregar nuevo link */}
            <div className="mb-4 flex justify-center">
                <button
                    type="button"
                    onClick={onAddNewLink}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Agregar Link</span>
                </button>
            </div>

            <ul ref={listRef} className="space-y-4">
                {currentLinks.map((link) => (
                    <LinkCard
                        key={link.id}
                        link={link}
                        onRemove={onRemoveLink}
                        onUpdate={onUpdateLink}
                        linkCardBackgroundColor={linkCardBackgroundColor}
                        linkCardTextColor={linkCardTextColor}
                    />
                ))}
            </ul>
        </div>
    )
}
