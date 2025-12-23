'use client'

import { useEffect, useState } from 'react'
import { SortableLinksFormWithProducts as SortableLinksForm } from "@/components"
import { checkClientAdminPermissionsWithRedirect } from "@/utils/client-roles"
import { getLinksData } from '@/utils/links'

export default function AdminSortableLinks() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [hasPermissions, setHasPermissions] = useState(false)

    useEffect(() => {
        async function loadData() {
            try {
                const isAdmin = await checkClientAdminPermissionsWithRedirect()
                if (!isAdmin) {
                    return // Ya se redirigió automáticamente
                }
                
                setHasPermissions(true)
                // Cargar datos incluyendo items inválidos/borradores para que el admin pueda editarlos
                const result = await getLinksData({ includeInvalid: true })
                setData(result)
            } catch (error) {
                console.error('Error loading data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-white">cargando...</div>
            </div>
        )
    }

    if (!hasPermissions) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-white">No tienes permisos de administrador</div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-white">Error al cargar datos</div>
            </div>
        )
    }

    const { links, title, description, profileImage, profileImageType, socialIcons, backgroundColor, backgroundSettings, styleSettings, categories } = data

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="border-b border-gray-700 px-4 sm:px-6 py-4">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                    Administrar Enlaces y Productos
                </h1>
            </div>

            <SortableLinksForm 
                links={links}
                categories={categories || []}
                title={title}
                description={description} 
                profileImage={profileImage}
                profileImageType={profileImageType}
                socialIcons={socialIcons}
                backgroundColor={backgroundColor || '#1a1a1a'}
                backgroundSettings={backgroundSettings || { type: 'color', color: backgroundColor || '#1a1a1a', imageOpacity: 0.5 }}
                styleSettings={styleSettings || { titleColor: '#ffffff', linkCardBackgroundColor: '#ffffff', linkCardTextColor: '#000000', productBuyButtonColor: '#ff6b35' }}
            />
        </div>
    )
}