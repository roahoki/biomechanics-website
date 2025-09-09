import { useState, useRef, useEffect } from 'react'
import { LinkItem, Link, Product, Item } from '@/types/product'

export function useLinksManagement(initialLinks: LinkItem[]) {
    const [currentLinks, setCurrentLinks] = useState<LinkItem[]>(initialLinks)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [linkToDelete, setLinkToDelete] = useState<number | null>(null)
    
    // Ref para mantener el estado más actualizado
    const currentLinksRef = useRef<LinkItem[]>(initialLinks)
    
    // Sincronizar ref con estado
    useEffect(() => {
        currentLinksRef.current = currentLinks
    }, [currentLinks])

    // Función para agregar un nuevo link al principio
    const addNewLink = () => {
        const newId = Math.max(...currentLinks.map(item => item.id), 0) + 1
        const newLink: Link = {
            id: newId,
            type: 'link',
            url: '',
            label: '',
            visible: true
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
            images: [],
            visible: true
        }
        setCurrentLinks([newProduct, ...currentLinks])
    }

    // Función para agregar un nuevo item al principio
    const addNewItem = () => {
        const newId = Math.max(...currentLinks.map(item => item.id), 0) + 1
        const newItem: Item = {
            id: newId,
            type: 'item',
            title: '',
            price: 0,
            priceVisible: true,
            buttonText: 'Ver más',
            paymentLink: '',
            description: '',
            images: [],
            visible: true
        }
        setCurrentLinks([newItem, ...currentLinks])
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
            item.id === id && item.type !== 'product' && item.type !== 'item' ? { ...item, [field]: value } : item
        ))
    }

    // Función para actualizar un producto específico
    const updateProduct = (id: number, updatedProduct: Partial<Product>) => {
        setCurrentLinks(currentLinks.map(item => 
            item.id === id && item.type === 'product' ? { ...item, ...updatedProduct } : item
        ))
    }

    // Función para actualizar un item específico
    const updateItem = (id: number, updatedItem: Partial<Item>) => {
        console.log(`🔧 HOOK updateItem called - ID: ${id}`, updatedItem)
        const newLinks = currentLinks.map(item => 
            item.id === id && item.type === 'item' ? { ...item, ...updatedItem } : item
        )
        
        // Log específico para el item 28
        if (id === 28) {
            const item28 = newLinks.find(item => item.id === 28)
            console.log(`🔧 HOOK - Estado actualizado del item 28:`, {
                id: item28?.id,
                type: item28?.type,
                title: (item28 as any)?.title,
                images: (item28 as any)?.images,
                imagesLength: (item28 as any)?.images?.length || 0,
                firstImagePrefix: (item28 as any)?.images?.[0]?.substring(0, 30) || 'none'
            })
        }
        
        setCurrentLinks(newLinks)
    }

    // Función para reordenar los elementos
    const reorderLinks = (newOrder: LinkItem[]) => {
        setCurrentLinks(newOrder)
    }

    // Función para cambiar la visibilidad de un elemento
    const toggleVisibility = (id: number) => {
        setCurrentLinks(currentLinks.map(item => 
            item.id === id ? { ...item, visible: item.visible !== false ? false : true } : item
        ))
    }

    return {
        currentLinks,
        currentLinksRef,
        setCurrentLinks,
        addNewLink,
        addNewProduct,
        addNewItem,
        removeLink,
        confirmDelete,
        cancelDelete,
        updateLink,
        updateProduct,
        updateItem,
        reorderLinks,
        toggleVisibility,
        showDeleteModal,
        linkToDelete
    }
}
