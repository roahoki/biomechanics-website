export interface Product {
    id: number
    type: 'product'
    title: string
    subtitle?: string
    price: number
    paymentLink: string
    description: string
    images: string[]
    aspectRatios?: number[]
    categories?: string[]
    visible?: boolean
    // Campo temporal para datos de imagen con blobs croppeados
    _imageData?: Array<{
        url: string
        blob?: Blob
        aspectRatio: number
    }>
}

export interface Item {
    id: number
    type: 'item'
    title: string
    subtitle?: string
    price: number
    priceVisible: boolean
    buttonText: string
    paymentLink: string
    description: string
    images: string[]
    aspectRatios?: number[]
    categories?: string[]
    visible?: boolean
    activityDate?: string | null      // Fecha de actividad/evento (opcional) - Formato ISO 8601 (YYYY-MM-DD)
    publicationDate: string            // Fecha de publicación (obligatorio) - Formato ISO 8601 (YYYY-MM-DD)
    // Campo temporal para datos de imagen con blobs croppeados
    _imageData?: Array<{
        url: string
        blob?: Blob
        aspectRatio: number
    }>
}

export interface Link {
    id: number
    type?: 'link'
    url: string
    label: string
    categories?: string[]
    visible?: boolean
}

export type LinkItem = Link | Product | Item
