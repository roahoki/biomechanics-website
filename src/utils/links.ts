import fs from 'fs/promises'
import path from 'path'

interface Link {
  id: number
  url: string
  label: string
}

interface LinksData {
  links: Link[]
  description: string
  profileImage: string
}

export async function getLinksData(): Promise<LinksData> {
  try {
    const filePath = path.resolve(process.cwd(), 'src/data/links.json')
    const file = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(file)
    
    return {
      links: data.items || [],
      description: data.description || "",
      profileImage: data.profileImage || "/profile.jpg"
    }
  } catch (error) {
    console.error('Error al cargar los enlaces:', error)
    return {
      links: [],
      description: "",
      profileImage: "/profile.jpg"
    }
  }
}