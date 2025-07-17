import { useState } from 'react'
import { LinkItem, Link, Product } from '@/types/product'

export function useLinksManagement(initialLinks: LinkItem[]) {
    const [currentLinks, setCurrentLinks] = useState<LinkItem[]>(initialLinks)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [linkToDelete, setLinkToDelete] = useState<number | null>(null)

    // Función para agregar un nuevo link al principio
    const addNewLink = () => {
        const newId = Math.max(...currentLinks.map(item => item.id), 0) + 1
        const newLink: Link = {
            id: newId,
            type: 'link',
            url: '',
            label: ''
        }
        setCurrentLinks([newLink, ...currentLinks])
    }

    // Función para agregar un nuevo producto al principio
    const addNewProduct = () => {
        const newId = Math.max(...currentLinks.map(item => item.id), 0) + 1
        const newProduct: Product = {
            id: newId,
            type: 'product',
            title: '',
            price: 0,
            paymentLink: '',
            description: '',
            images: []
        }
        setCurrentLinks([newProduct, ...currentLinks])
    }

    // Función para eliminar un item
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
        setCurrentLinks(currentLinks.map(item => 
            item.id === id && item.type !== 'product' ? { ...item, [field]: value } : item
        ))
    }

    // Función para actualizar un producto específico
    const updateProduct = (id: number, updatedProduct: Partial<Product>) => {
        setCurrentLinks(currentLinks.map(item => 
            item.id === id && item.type === 'product' ? { ...item, ...updatedProduct } : item
        ))
    }

    // Función para reordenar los elementos
    const reorderLinks = (newOrder: LinkItem[]) => {
        setCurrentLinks(newOrder)
    }

    return {
        currentLinks,
        setCurrentLinks,
        addNewLink,
        addNewProduct,
        removeLink,
        confirmDelete,
        cancelDelete,
        updateLink,
        updateProduct,
        reorderLinks,
        showDeleteModal,
        linkToDelete
    }
}
