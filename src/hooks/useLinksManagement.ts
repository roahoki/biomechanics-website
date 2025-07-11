import { useState } from 'react'

interface Link {
    id: number
    url: string
    label: string
}

export function useLinksManagement(initialLinks: Link[]) {
    const [currentLinks, setCurrentLinks] = useState<Link[]>(initialLinks)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [linkToDelete, setLinkToDelete] = useState<number | null>(null)

    // Función para agregar un nuevo link
    const addNewLink = () => {
        const newId = Math.max(...currentLinks.map(link => link.id), 0) + 1
        const newLink = {
            id: newId,
            url: '',
            label: ''
        }
        setCurrentLinks([...currentLinks, newLink])
    }

    // Función para eliminar un link
    const removeLink = (id: number) => {
        setLinkToDelete(id)
        setShowDeleteModal(true)
    }

    // Confirmar eliminación
    const confirmDelete = () => {
        if (linkToDelete !== null) {
            setCurrentLinks(currentLinks.filter(link => link.id !== linkToDelete))
            setShowDeleteModal(false)
            setLinkToDelete(null)
        }
    }

    // Cancelar eliminación
    const cancelDelete = () => {
        setShowDeleteModal(false)
        setLinkToDelete(null)
    }

    // Función para actualizar un link específico
    const updateLink = (id: number, field: 'url' | 'label', value: string) => {
        setCurrentLinks(currentLinks.map(link => 
            link.id === id ? { ...link, [field]: value } : link
        ))
    }

    return {
        currentLinks,
        setCurrentLinks,
        addNewLink,
        removeLink,
        confirmDelete,
        cancelDelete,
        updateLink,
        showDeleteModal,
        linkToDelete
    }
}
