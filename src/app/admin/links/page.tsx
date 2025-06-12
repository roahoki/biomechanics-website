import { SortableLinksForm } from "@/app/components/SortableLinksForm"
import { checkRole } from "@/utils/roles"
import { redirect } from 'next/navigation'
import fs from 'fs/promises'
import path from 'path'
import { log } from "console"



export default async function AdminSortableLinks(params: {
    searchParams: Promise<{ search?: string }>
}) {
    if (!checkRole('admin')) {
        redirect('/')
    }

    const filePath = path.resolve(process.cwd(), 'src/data/links.json')
    const file = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(file)
    const links = data.items || []
    const description = data.description || "";

    log('links', links)
    log('description', description)




    return (
            <SortableLinksForm links={links} description={description} />
    )
}