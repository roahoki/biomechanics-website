'use client'

import { useEffect, useState } from 'react'
import { SortableLinksFormWithProducts as SortableLinksForm } from "@/components/SortableLinksFormWithProducts"
import CategoryManagerCompact from "@/components/CategoryManagerCompact"
import ListView from "@/components/ListView"
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
            <div className="max-w-7xl mx-auto px-4 py-8">
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

                    {/* Content */}
                    <div className="p-6">
                        {/* Grid principal con categorías en la primera fila */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Administrador de Categorías - Compacto */}
                            <div className="lg:col-span-1">
                                <div className="bg-gray-700 rounded-lg border border-gray-600 p-4">
                                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        Categorías
                                    </h3>
                                    <div className="max-h-60 overflow-y-auto">
                                        <CategoryManagerCompact
                                            categories={categories || []}
                                            onCategoriesChange={handleCategoriesChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Formulario principal - Ocupa el resto del espacio */}
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
            </div>
        </div>
    )
}