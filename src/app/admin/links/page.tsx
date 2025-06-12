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

    const { links, description } = await getLinksData()

    log('links', links)
    log('description', description)




    return (
            <SortableLinksForm links={links} description={description} />
    )
}