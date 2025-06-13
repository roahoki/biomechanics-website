import { SortableLinksForm } from "@/app/components/SortableLinksForm"
import { checkRole } from "@/utils/roles"
import { redirect } from 'next/navigation'
import { getLinksData } from '@/utils/links'
import { log } from "console"

export default async function AdminSortableLinks(params: {
    searchParams: Promise<{ search?: string }>
}) {
    if (!checkRole('admin')) {
        redirect('/')
    }

    const { links, description, profileImage } = await getLinksData()

    log('links', links)
    log('description', description)
    log('profileImage', profileImage)

    return (
            <SortableLinksForm 
                links={links} 
                description={description} 
                profileImage={profileImage}
            />
    )
}