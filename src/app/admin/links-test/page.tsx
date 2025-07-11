import { SortableLinksFormRefactored } from "@/components/SortableLinksFormRefactored"
import { checkRole } from "@/utils/roles"
import { redirect } from 'next/navigation'
import { getLinksData } from '@/utils/links'

export default async function AdminSortableLinksTest() {
    if (!checkRole('admin')) {
        redirect('/')
    }

    const { links, description, profileImage, profileImageType, socialIcons, backgroundColor, backgroundSettings, styleSettings } = await getLinksData()

    return (
        <SortableLinksFormRefactored 
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
