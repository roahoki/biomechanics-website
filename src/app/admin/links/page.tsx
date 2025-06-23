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

    const { links, description, profileImage, profileImageType, socialIcons, backgroundColor, backgroundSettings, styleSettings } = await getLinksData()

    log('links', links)
    log('description', description)
    log('profileImage', profileImage)
    log('profileImageType', profileImageType)
    log('socialIcons', socialIcons)
    log('backgroundColor', backgroundColor)
    log('backgroundSettings', backgroundSettings)
    log('styleSettings', styleSettings)

    return (
            <SortableLinksForm 
                links={links} 
                description={description} 
                profileImage={profileImage}
                profileImageType={profileImageType}
                socialIcons={socialIcons}
                backgroundColor={backgroundColor || '#1a1a1a'}
                backgroundSettings={backgroundSettings || { type: 'color', color: backgroundColor || '#1a1a1a', imageOpacity: 0.5 }}
                styleSettings={styleSettings || { titleColor: '#ffffff', linkCardBackgroundColor: '#ffffff', linkCardTextColor: '#000000' }}
            />
    )
}