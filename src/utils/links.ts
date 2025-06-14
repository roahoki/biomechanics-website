import fs from 'fs/promises'
import path from 'path'

interface Link {
  id: number
  url: string
  label: string
}

export type ProfileImageType = 'image' | 'video' | 'gif'

export interface SocialIcon {
  url: string
  color: string
}

export interface SocialIcons {
  instagram?: SocialIcon
  soundcloud?: SocialIcon
  youtube?: SocialIcon
  tiktok?: SocialIcon
}

interface LinksData {
  links: Link[]
  description: string
  profileImage: string
  profileImageType: ProfileImageType
  socialIcons: SocialIcons
  backgroundColor?: string
}

export async function getLinksData(): Promise<LinksData> {
  try {
    const filePath = path.resolve(process.cwd(), 'src/data/links.json')
    const file = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(file)
    
    return {
      links: data.items || [],
      description: data.description || "",
      profileImage: data.profileImage || "/profile.jpg",
      profileImageType: data.profileImageType || "image",
      socialIcons: data.socialIcons || {},
      backgroundColor: data.backgroundColor || "#1a1a1a"
    }
  } catch (error) {
    console.error('Error al cargar los enlaces:', error)
    return {
      links: [],
      description: "",
      profileImage: "/profile.jpg",
      profileImageType: "image",
      socialIcons: {},
      backgroundColor: "#1a1a1a"
    }
  }
}