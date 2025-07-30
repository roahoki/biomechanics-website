'use client'

import { useEffect, useState } from 'react'
import { SortableLinksFormWithProducts as SortableLinksForm } from "@/components"
import { CategoryManagerCompact, ListView } from "@/components"
import { checkAdminPermissions } from "../check-permissions"
import { getLinksData } from '@/utils/links'
import { LinkItem } from '@/types/product'

export default function AdminSortableLinks() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [hasPermissions, setHasPermissions] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        async function loadData() {
            try {
                // Verificar permisos primero
                const isAdmin = await checkAdminPermissions()
                if (!isAdmin) {
                    // La función ya redirige automáticamente
                    return
                }
                
                setHasPermissions(true)
                const result = await getLinksData()
                setData(result)
            } catch (error) {
                console.error('Error loading data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const handleCategoriesChange = () => {
        // Recargar los datos cuando las categorías cambien
        getLinksData().then(setData)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-white">Cargando...</div>
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
        <div className="min-h-screen bg-gray-900">
            <div className="max-w-7xl mx-auto px-10 py-8">
                <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700">
                    {/* Header */}
                    <div className="border-b border-gray-700 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">
                            Administrar Enlaces y Productos
                        </h1>
                        <p className="text-gray-300 mt-1">
                            Gestiona tu página de enlaces, productos y categorías
                        </p>
                    </div>

                    <div className="lg:col-span-3">
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
                
                </div>
            </div>
        </div>
    )
}